# Smoke checklist: the app with no plugins

The SDK has no automated tests, so a build alone does not show that the app still works. This
checklist is run by hand on a device. A PR that changes the in-conference app attaches a pass
(see [Recording a pass](#recording-a-pass)), and the result is compared with the
[baseline](#baseline).

The checklist records what the app does today. A step that fails on the baseline is not fixed
here: it is recorded, and a later PR may only change it as a labelled behaviour change.

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
| S3 | Poll | On the web, start a poll; answer it on the phone; publish the results on the web. | The phone shows the poll dialog; the web receives the answer; the phone shows the results dialog. |
| S4 | Breakout invite | On the web, create breakout rooms with the phone user in one of them. On the phone, accept the invite, join the room, then use "Leave breakout room" in the drawer. | The invite dialog opens; the breakout list opens; the phone enters the room with audio; leaving returns to the main room and its audio rejoins. |
| S5 | Audio-output row | Open the drawer and tap "Change audio output"; tap the "Change audio output" row in the sheet; switch to the speaker and back. | The sheet expands; the selector lists the outputs (Android: earpiece and speaker phone, plus any headset); audio follows the choice. |
| S6 | Landscape | On the main screen, rotate the phone. If the screen rotates, open the drawer and tap "Change audio output", then rotate back. | Today the app stays in portrait. If a change lets the main screen rotate, the audio-output row still opens without a crash. |
| S7 | pick-random-user | On the web, pick a random user with the pick-random-user plugin. | The phone shows "Randomly picked user" with the picked name. The app listens for one plugin name only, so record the plugin version. |

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

Recorded on 2026-10-13, on `v0.25.1`.

```text
Smoke checklist pass
Commit:      34fb39f (v0.25.1)
Build:       debug, npm run android
Device / OS: Samsung SM-S731B, Android 16
Server:      BBB 3.0.32 (development build), audio bridge livekit, camera bridge livekit, pick-random-user 0.1.2
S1 Join:              pass
S2 Audio:             pass
S3 Poll:              pass; the first poll published after the phone joins opens no results dialog, later ones do
S4 Breakout invite:   pass; the microphone is unmuted on entering the room; leaving goes through an end screen ("Access Main Room"); after the return the actions bar is hidden
S5 Audio-output row:  pass
S6 Landscape:         the app stays in portrait (the root component locks it), so the landscape path cannot be reached
S7 pick-random-user:  fail: no dialog; the app listens for the plugin name used before 0.1.2
Notes:       the phone joined as a viewer; the web user was moderator and presenter
```
