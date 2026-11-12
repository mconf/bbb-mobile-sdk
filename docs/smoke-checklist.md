# Smoke checklist: the app with no plugins

The app has no automated tests, so a build alone does not show that it still works. This
checklist is run by hand on a device. Every PR that changes anything but documentation attaches
a pass (see [Recording a pass](#recording-a-pass)), and the result is compared with the
[baseline](#baseline).

The checklist records what the app does today. A step that fails on the baseline is not fixed
here: it is recorded. A later PR changes a step, its expected result or the baseline only as a
behaviour change: labelled `behaviour-change`, naming each step it changes.

The baseline is recorded again, in a PR that does nothing else, when the base branch takes in
changes to the in-conference app, such as a newer `master`. Passes are compared with the
baseline of their own base.

## Setup

- **App:** this repo in standalone mode (`settings.json` `dev: true`, a join URL in `App.js`),
  built with `npm run android` or `npm run ios`. Run `npm install` first, with the Node
  version in `.nvmrc`. Use the committed `settings.json` otherwise.
- **Server:** a BigBlueButton server with the pick-random-user plugin enabled.
- **Web client:** a second participant in a browser, as moderator and presenter.
- **Phone user:** joins as a viewer (not moderator, not presenter).

## Steps

| ID | Step | Do | Expect |
|---|---|---|---|
| S1 | Join | Open the app with the join URL. | Loading screen, then the main screen with the meeting name in the header and the actions bar at the bottom. |
| S2 | Audio | Allow the microphone if asked. Unmute, speak, mute again. Have the web user speak. | Audio joins on its own, muted (the server's mute-on-start default). The web client shows the phone user talking while unmuted. The phone hears the web user. |
| S3 | Poll | On the web, start a poll; answer it on the phone; publish the results on the web. Then run a second poll the same way. | Each time, the phone shows the poll dialog, the web receives the answer, and the phone shows the results dialog. |
| S4 | Breakout invite | On the web, create breakout rooms with the phone user in one of them. On the phone, accept the invite, join the room, then use "Leave breakout room" in the drawer. | The invite dialog opens; the breakout list opens; the phone enters the room with audio; leaving returns to the main room and its audio rejoins. |
| S5 | Audio-output row | Open the drawer and tap "Change audio output"; tap the "Change audio output" row in the sheet; switch to the speaker and back. | The sheet expands; the selector lists the outputs (Android: earpiece and speaker phone, plus any headset); audio follows the choice. |
| S6 | Landscape | On the main screen, rotate the phone. Then tap the pencil button on the presentation; it opens the presentation in fullscreen, in landscape. Swipe the drawer open from the left edge and tap "Change audio output". Leave fullscreen. | The main screen stays in portrait. In fullscreen, the drawer and the audio-output row open without a crash. Leaving fullscreen returns to portrait. |
| S7 | pick-random-user | With the phone in the main room, pick a random user on the web with the pick-random-user plugin. | The phone shows "Participant picked!" ("You have been randomly picked" when the phone user is picked) with the picked user's avatar and name. Picks older than 10 seconds are not shown. Record the plugin version. |

## Recording a pass

Paste this in the PR, one line per step. Mark a step `pass`, `fail` (with what happened) or
`same as baseline` when it fails the same way the baseline does.

```text
Smoke checklist pass
Commit:      <sha>
Build:       <debug|release>, <npm run android|ios>
Device / OS: <model>, <Android|iOS version>
Server:      <BBB version>, audio bridge <livekit|bbb-webrtc-sfu>, camera bridge <...>, pick-random-user <version>
S1 Join:              <result>
S2 Audio:             <result>
S3 Poll:              <result>
S4 Breakout invite:   <result>
S5 Audio-output row:  <result>
S6 Landscape:         <result>
S7 pick-random-user:  <result>
Notes:       <anything else seen>
```

## Baseline

Recorded on 2026-11-11, on `v0.27.0`.

```text
Smoke checklist pass
Commit:      dee24c4 (v0.27.0)
Build:       debug, ./gradlew app:assembleDebug -PreactNativeArchitectures=arm64-v8a
Device / OS: Samsung SM-S731B, Android 17
Server:      BBB 4.1.x-develop (development build), audio bridge livekit, camera bridge livekit, pick-random-user 0.1.3
S1 Join:              pass
S2 Audio:             pass; no microphone prompt (the permission was kept from an earlier install)
S3 Poll:              pass; the first poll published after the phone joins opens no results dialog, later ones do
S4 Breakout invite:   pass; the microphone is unmuted on entering the room; leaving goes through an end screen ("Access Main Room"); after the return the actions bar is hidden until the main screen is tapped
S5 Audio-output row:  pass
S6 Landscape:         fail; the main screen stays in portrait (the root component locks it); in fullscreen the drawer opens, but tapping "Change audio output" throws a render error ("'index' was provided but out of the provided snap points range! expected value to be between -1, 0", from snapToIndex(1) in the actions bar sheet); the screen goes blank and the phone leaves the meeting
S7 pick-random-user:  pass; the phone user was picked: "You have been randomly picked" with the avatar and name; "Clear All" on the web closes the dialog
Notes:       the phone joined as a viewer; the web user was moderator and presenter; in S2, "the phone hears the web user" was checked from the Android audio state (an active voice-communication track), not by ear; a dialog (poll, pick-random-user) closes the actions bar sheet
```
