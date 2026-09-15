# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`bbb-mobile-sdk` is the React Native + Expo client for **BigBlueButton**. It is
dual-purpose: it runs standalone as an app *and* is published as an embeddable
React Native SDK. The same root `App` component is `export default`ed from
`index.js`; it is only registered as the native root via
`registerRootComponent` when `settings.json` `dev` is `true`. A host app instead
imports `App` and mounts it itself, passing `joinURL`, `defaultLanguage`, and
`onLeaveSession` props.

Expo **bare workflow** (SDK 56, RN 0.85, React 19.2, Hermes v1): `android/` and
`ios/` are committed. Most native config lives in `app.json` (schemes, background
modes, team ID, notify-kit foreground service, splash, JitPack repo), but
`expo prebuild --clean` still wipes these hand-maintained bits, which must be
re-applied afterwards (diff against git):
- Android: `LiveKitReactNative.setup(...)` in `MainApplication.onCreate`, the four
  `<uses-feature>` entries + `tools:replace` on the notifee `ForegroundService` in
  `AndroidManifest.xml`, and `res/drawable/ic_notification.xml` (LiveKit screen
  share foreground notification; screenshare crashes without it).
- iOS: `RCTAudioModule`/`JitsiAudioSession*` files in `ios/` **and** their
  entries in `project.pbxproj` (`NativeModules.AudioModule`), the Podfile
  `post_install` hooks (pod deployment-target bump, `fmt` consteval patch), and
  `bbbmobile/PrivacyInfo.xcprivacy`.
- iOS (Xcode 27 only): the `SceneDelegate` + window-creation change in
  `AppDelegate.swift` (the UIScene manifest itself comes from `app.json`). Apps
  built with the iOS 27 SDK crash at launch without it; SDK 56's template has no
  scene support (expo/expo#46663, native support from SDK 57).

## Commands

```bash
# Node version is pinned in .nvmrc (22). Install with legacy peer deps
# (.npmrc sets legacy-peer-deps=true â€” plain `npm ci`/yarn will fail on peers).
npm install

npm start              # expo start --dev-client  (NOT Expo Go â€” native modules require a dev client)
npm run android        # expo run:android
npm run ios            # expo run:ios  (Xcode 26.4+, iOS deployment target 16.4)
npm run lint           # eslint . --ext .js  (airbnb config)
npm run lint:file <f>  # lint a single file
npm run build          # babel src/ -d lib/  â€” transpiles the SDK into lib/ (gitignored); prepublish runs this

# Android gradle troubleshooting: cd android && ./gradlew clean
# Locale sync (strings are a subset of upstream bbb-html5):
#   ./generate_locales.sh <lang> <path-to-bbb-html5/locales>

npm run build:notes-editor  # rebuilds the BlockNote shared-notes WebView bundle
                            # (shared-notes-editor/ -> src/screens/user-notes-screen/
                            # editor-bundle.js). Separate npm package with its own
                            # deps; the generated output IS committed. See its README.
```

**Native build prerequisites** (the README's Node/Expo versions are stale, but
these still hold):
- Android: JDK 17 and the Android SDK on your PATH. If a build fails with an
  `ANDROID_SDK` error: `export ANDROID_SDK_ROOT="$HOME/Android/sdk"` (Linux) or
  `"$HOME/Library/Android/sdk"` (macOS).
- iOS: Xcode 26.4+.

`.env` sets `EXPO_PUBLIC_USE_RN_FETCH=1` so `fetch` stays React Native's instead
of SDK 56's `expo/fetch` (only applies to standalone builds of this repo; a host
app embedding the SDK decides this for itself).

**There is no test framework** (no jest/mocha/vitest). Do not look for or invent
a test command; verify changes by running the app.

**Typecheck gate for TS edits:** `.ts`/`.tsx` are *not* linted (see Repo hygiene),
so `npx tsc --noEmit --skipLibCheck` is the only static check. (`tsconfig.json` sets
`strict: false`; TS 6 flipped the default to strict.) It's clean on `src/`
â€” the sole errors come from the untracked `tmp-livekit-live.ts` reference file, so
exclude it (`... | grep -v '^tmp-livekit-live.ts'`). Run it + `npm run build`.

To run standalone: set `dev: true` in `settings.json` and edit the
`defaultJoinURL` in `App.js` to point at your BBB server's `.../api/join?...` URL.

## Architecture

### The most important thing: this is a mid-migration codebase (two parallel planes)

The active branch is porting BBB mobile from its **legacy** stack to a **new**
stack. Both run simultaneously, so most domain concerns exist in **two** places.
Do not assume a single code path; prefer the new plane for new work.

| Concern | NEW plane (preferred) | LEGACY plane |
|---|---|---|
| Server data (read) | Hasura GraphQL **subscriptions** via Apollo (`src/graphql`) | Meteor/DDP collections mirrored into Redux `*Collection` slices (`src/components/socket-connection`) |
| Actions (write) | BBB graphql-actions **mutations** (`useMutation`) | `makeCall('...')` DDP method RPC |
| Media | **LiveKit** (`src/services/livekit`, `src/components/livekit`) | `bbb-webrtc-sfu` managers (`src/services/webrtc`) |
| Join/auth | `use-join-meeting.js` + `user-join-screen` | `client` slice `join`/`fetchGuestStatus` thunks + `socket-connection` |

`<SocketConnection>` is now only mounted in `test-components-screen`, but its
module still *loads* on any `import '../../services/api'` â€” that import triggers
dependency-injection side effects (it wires `makeCall`/`getAuthInfo`/session-id
into the logger). So the legacy module is not dead even though the component is
unmounted.

### Join flow â€” a login state machine

`src/graphql/hooks/use-join-meeting.js` is a hand-rolled `loginStage` (0â€“6)
state machine (one `useEffect` switching on the integer). It is **the only place
`ApolloClient` is constructed.** Stages: fetch join URL â†’ follow redirect to
extract `sessionToken` â†’ `enter` â†’ GET `{host}/bigbluebutton/api` (XML, parsed by
a naive regex `xml2json`) to *discover* `graphqlWebsocketUrl`/`graphqlApiUrl` â†’
build a `graphql-ws` client + Apollo client â†’ GET `{graphqlApiUrl}/meetingStaticData`
for client settings â†’ done (5). A `transfer/` URL branches to stage 6.

- Endpoints are **not hardcoded** â€” discovered at runtime from the BBB API XML.
- Auth is the BBB **session token**, sent as `X-Session-Token` (plus
  `X-ClientType: HTML5`, `X-ClientIsMobile: true`) on the ws `connectionParams`.
  graphql-ws error code `4403` = invalid token (stops retrying). Hasura scopes
  all rows to that session, so **operations carry no explicit meetingId/auth
  args** â€” don't add them.
- `src/utils/functions` `getHostFromUrl`/`buildURL` deliberately preserve a
  server path prefix before `/html5client` (for reverse-proxy/cluster-proxy
  sub-path deployments). Don't replace with `new URL(...).host`.

### Navigation is a gated tree, not a static route table

`App.js` â†’ `NavigatorHandler` reads `loginStage` and mounts one of:
`LoadingScreen` (default) / `MainNavigator` (stage 5) / `TransferNavigator`
(stage 6). **`ApolloProvider` is mounted deep, only inside `MainNavigator`** â€”
so any component using `useSubscription`/`useMutation` must render under it;
`App.js` has no provider. Apollo **reactive vars** (`makeVar`) are the exception:
they are module-global and work anywhere (that's how `use-join-meeting` seeds
`useMeetingSettings` before the client exists).

The in-conference UI is a **drawer** (`custom-drawer/drawer-navigator`), not a
stack. `BBBLiveKitRoom` is mounted once in the custom drawer content so the media
room survives switching drawer screens. Post-login routing (guest lobby â†’
conference â†’ feedback) is centralized in `user-join-screen`'s subscription
effect â€” `GuestScreen` itself has no navigation logic and depends on
`UserJoinScreen` staying mounted.

Breakout rooms are **a second, nested mount of this same `App`**: the main
room's `inside-breakout-room-screen` renders the root `App` (taken from
`NestedAppContext`, not imported, to avoid a cycle) with `isBreakout`, from the
same module graph. There is no `bbb-breakout-sdk` dependency and no separate
breakout branch/tag anymore. That's why `NavigationContainer`/`Drawer` are
marked `independent`, and why two Redux stores / two Apollo clients are alive
at once (see "Per-App instance" below). Breakout-only behavior is decided at
**runtime**: `useIsBreakoutInstance()` (`src/app-instance/context.js`, known on
the first render, before Apollo and after teardown; use it to skip
subscriptions, feedback, end-screen strings) or the server flag
`meeting.isBreakout` from `useMeeting` (drawer routes, recording indicator).
Entering a breakout: `breakout-room-screen` `joinSession` exits audio/camera,
sets `mainRoomBlockedByBreakout`, **awaits** `instance.disconnectLiveKit({final:true})`,
then navigates. The main room's `BBBLiveKitRoom` stays mounted (drawer content)
but refuses to reconnect while the flag is set; the nested App's `onLeaveSession`
clears it and the main media re-initializes.

### Per-App instance: nothing media/session-related is a module singleton

`src/app-instance/` is the heart of that. `createAppInstance({ isBreakout })`
(called once per mounted `App` via a `useState` initializer) builds an object
owning: the Redux store (`createAppStore(instance)`), the LiveKit `Room` +
event emitter + room bookkeeping (`liveKitTracker`: connected-once flag,
published camera tracks), the three WebRTC managers (constructed with the
instance), the meeting-settings reactive var, the ICE-server cache, the
audio-join guard, the expected camera stops (`cameraStops`), the client mute
commands (`muteIntent`) and the LiveKit screen-capture attempt state.
React reads it through `useAppInstance()` / `useLiveKitRoom()` /
`useMediaManagers()`; managers/bridges receive it by constructor; Redux
listener effects reach it as `listenerApi.extra`. **Never create a module-level
`Room`, manager or `makeVar` for session state again.** The only module-level
pointer is `active-instance.js` (a stack, innermost mounted App = active),
which exists solely for legacy non-React code: the `store` shim
`src/store/redux/legacy-store.js` (used by `socket-connection/**` and
`poll-screen/service.js`; `store.js` no longer exports a store) and the
logger's `getAuthInfo`.

### State: Redux + Apollo (reactive vars), split by origin

`src/store/redux/store.js`: two kinds of slices â€”
- `*Collection` slices (`usersCollection`, `meetingCollection`, â€¦) are the
  **legacy Meteor collection mirrors**, populated by the DDP modules.
- `wide-app/*` slices (`client`, `audio`, `video`, `screenshare`, `modal`,
  `layout`, â€¦) are **app-local state**. `client` holds the session/auth state
  (`meetingData`, `sessionState`, discovered graphql URLs).

The store **flushes itself** (dispatches `STORE_FLUSH`, resetting all slices) via
a listener middleware when the session is disconnected + ended + terminated.
Cleanup middlewares (`videoStreamCleanupObserver`, `screenshareCleanupObserver`,
`voiceCallStateObserver`, `logoutOrEjectionObserver`) react to slice changes to
tear down media/handle ejection.

### Media layer: SFU managers vs LiveKit room, chosen per media type

The server tells the client which transport to use **per media type** via
`meeting.audioBridge` / `cameraBridge` / `screenShareBridge` (each `'livekit'` or
`'bbb-webrtc-sfu'`, from the `useMeeting` GraphQL hook). They are independent
(audio can be LiveKit while camera is SFU). UI entry points `switch()` on these
flags.

- **SFU path** â€” three singleton **managers** (`audio-manager`, `video-manager`,
  `screenshare-manager` in `src/services/webrtc`). Each is a class exported as a
  default singleton, holds Redux state, and drives a `Broker` (extends
  `sfu-base-broker.js`, an EventEmitter2) â†’ `WebRtcPeer` (`peer.js`) over a
  hand-rolled JSON-signaling WebSocket to `bbb-webrtc-sfu`. Managers are plain
  modules (not React): they read via `store.getState()` and write via
  `store.dispatch()`. There is one set of managers **per App instance**: they
  are constructed with the instance and use `this.instance.store`; the old
  `injectStore(...)` is gone. Slices never import managers; listener effects
  use `listenerApi.extra.<manager>`.
- **LiveKit path** â€” **one `Room` per App instance**, created by
  `createLiveKitRoom()` in `src/services/livekit/index.js` and held as
  `instance.liveKitRoom` (`useLiveKitRoom()` in React; the five
  `RoomContext.Provider` sites read it from there). `BBBLiveKitRoom`
  imperatively connects it.
  `registerGlobals()` from `@livekit/react-native` runs in `index.js` **before**
  `App` is imported (wires WebRTC globals) â€” don't reorder those imports.
- **Asymmetric port state:** audio on LiveKit *still flows through*
  `AudioManager` (via `LiveKitAudioBridge`), but LiveKit **video/screenshare do
  not use any manager** â€” they live in React components using
  `@livekit/react-native` hooks (`useTracks`). There is no `LiveKitVideoManager`.
- `instance.disconnectLiveKit({final: true})` (returns a promise) also
  `destroy()`s that instance's three WebRTC managers â€” it's the central
  teardown coupling both stacks (called from `App.js` `leaveSessionFactory`,
  `BBBLiveKitRoom` unmount, breakout entry, user-join). Managers are
  re-initializable after `destroy()`; that is how the main room resumes after a
  breakout.

> WebRTC library naming trap: the runtime WebRTC primitives come from
> `@livekit/react-native-webrtc` (a LiveKit fork). `@config-plugins/react-native-webrtc`
> in `package.json` is only the Expo prebuild config plugin, not a runtime import.

### Logging

`src/services/logger` is a `browser-bunyan` logger. `settings.json` `clientLog`
selects streams by target (`console` / `server` (legacy DDP `makeCall`) /
`external` (HTTP POST)). Currently only `external` is enabled (POST to
`https://{host}/html5Log`). The endpoint host is resolved **at write time** from
Redux `meetingData.host` (not at construction). Each record is enriched with auth
info, device info, and app/build version. Note: log records include
`sessionToken`/`joinUrl` â€” be mindful of where logs ship.

## Conventions

- **Component folders** follow `index.js` (JSX + Redux/Apollo/i18n wiring) +
  `styles.js`. `styles.js` default-exports a bag of styled-components imported as
  `Styled` and used `<Styled.X>`. Note `styles.js` often *also* contains
  functional presentational components â€” "logic is only in index.js" is wrong.
- **Styling** is `styled-components/native` v6 with props-driven conditional
  template literals, over `react-native-paper` v5 primitives. **Theming is a
  single flat dark palette** in `src/constants/colors.js`, imported as a plain
  module and interpolated directly. There is **no `ThemeProvider`/`useTheme`**
  and no light/dark switching; adding real theming means rearchitecting.
- **Modals/alerts:** imperative `Alert.alert(...)` and a Redux-driven registry
  in `components/modal` (maps `state.modal.profile` â†’ component). `components/alert`
  is a dead scaffold â€” don't use it.
- **GraphQL:** `src/graphql/queries/` contains mostly Hasura live
  `subscription` documents (folder is misnamed). Read-hook shape:
  `const {data,loading,error}=useSubscription(DOC); return useMemo(...)`. gql docs
  live both centrally and co-located per component (e.g. `components/livekit/mutations.js`).
- **Reading settings outside React:** use the instance's `getMeetingSettings()`
  (`instance.getMeetingSettings`, built by `createMeetingSettingsState()` in
  `src/graphql/local-states/useMeetingSettings.ts`; mobile's analog of web's
  `window.meetingClientSettings`). There is no module-level export: managers and
  bridges get it from the instance, components from `useAppInstance()`.
  `createUseLocalState` also returns the raw Apollo `ReactiveVar` as its 3rd tuple
  element for non-hook reads.
- **Feature gating** is driven by `settings.json` flags read throughout the UI:
  `features.timer`, `showNotImplementedFeatures`, `whiteboard`, `feedback.*`, and
  `plugins.pickRandomUser` toggle whether screens/controls render (combined with
  meeting state and user role from GraphQL hooks).

## Repo hygiene â€” read before editing

- **Editor backup litter may be present.** Files may have `*.js~` / `.*.un~`
  / `*.ts~` twins, plus root scratch files (`expo-bak/`, `tmp-livekit-live.ts`,
  `jarn.lock.diff`, `*.patch`, `*.txt` logs). **Only the plain `.js`/`.ts` files
  are live** â€” it's easy to edit the wrong twin and see no effect. Do not create
  new backup files.
- `.eslintrc.js` **ignores** `lib/`, `android/`, `ios/`, `src/services/`, and
  `socket-connection/` â€” so lint does *not* cover the WebRTC/LiveKit/logger/DDP
  layer where much of the hard logic lives.
- `npm run lint` is `eslint . --ext .js` â€” **`.ts`/`.tsx` are not linted at all**
  (tsc is their only checker). A `.js` importing a `.ts` module always emits
  pre-existing `import/no-unresolved` + `import/extensions` errors (resolver isn't
  TS-aware) â€” expected repo-wide; diff against HEAD before blaming your edit.
- The `README.md` is stale (claims Node 18 / Expo 52); trust `.nvmrc` and
  `package.json`.
- **Versioning:** the SDK release version is `package.json` only. `app.json`
  `version` (1.0.0) is unrelated â€” bump `package.json` for SDK releases. The
  old `breakout-graphql` branch and `breakout-v*` tags are archived: since
  0.27.0 the breakout client ships inside the main SDK and no breakout tag is
  cut.

