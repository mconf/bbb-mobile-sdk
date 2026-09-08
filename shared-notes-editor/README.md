# shared-notes-editor

The BlockNote shared-notes editor, bundled into one self-contained HTML document
that `src/screens/user-notes-screen` loads into a `WebView`.

## Why this exists

BigBlueButton 4.0 replaced Etherpad with BlockNote. Etherpad was a web service that
served its own pages, so the app only had to point a `WebView` at a URL. BlockNote is
a React library that the web client compiles into its own bundle — `bbb-shared-notes-server`
hosts no editor page at all, it only speaks Yjs over a Hocuspocus WebSocket and exposes
export endpoints. BlockNote is built on ProseMirror and needs a DOM, so it cannot run in
React Native either. The remaining option is to host the editor ourselves, which is what
this package builds.

`src/index.jsx` is a port of
`bigbluebutton-html5/imports/ui/components/bn-shared-notes/component.tsx` and
`src/hooks.js` a port of its `hooks.ts`. Keep them close to the originals so upstream
fixes stay easy to carry over; intentional differences are marked `MOBILE:`.

## This is a separate npm package on purpose

Its dependencies (React 18, `react-dom`, Mantine) must never enter the app's module
graph — the app runs React 19 and has no DOM. Nothing here is installed by a normal
`npm install` at the repository root.

## Rebuilding

```bash
npm run build:notes-editor    # from the repository root
```

Requires Node 22 (`.nvmrc`). The output is
`src/screens/user-notes-screen/editor-bundle.js`, a JavaScript module whose default
export is the whole HTML document as a string.

**The output is committed.** Two reasons: `npm run build` in the SDK is
`babel src/ -d lib/` without `--copy-files`, so only `.js` files reach the published
`lib/`; and `bbb-breakout-sdk` consumes this repository as a git dependency and cannot
run this build. Rebuild and commit `editor-bundle.js` whenever anything in `src/` here
changes.

## Versions

Pinned to match `bigbluebutton-html5` so the Yjs document schema stays compatible with
the server: BlockNote 0.53, `@hocuspocus/provider` 3.4.4, Yjs 13.6.29, React 18.3.1.
Check `bigbluebutton-html5/package.json` on the matching BBB branch before bumping.

## How the app talks to it

- The immutable half of the configuration (padId, session token, host, message strings)
  is substituted into the `/*__BBB_NOTES_CONFIG__*/` placeholder as
  `window.__BBB_NOTES__` before the document is handed to the `WebView`.
- Anything that changes during a session — the user's name, colour and role, the lock
  settings, the locale — is pushed in later through `window.bbbNotesUpdate(patch)`,
  which the app calls with `injectJavaScript`. Rebuilding the document instead would
  reload the page and drop the Yjs connection.
- The editor reports back over `window.ReactNativeWebView.postMessage`; see
  `src/bridge.js` for the message shapes.
