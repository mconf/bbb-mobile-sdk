#  bbb-mobile-sdk

## Code dependencies

### Versions
    $ node -v
    v24

    $ npm -v
    v11.19

    $ expo -V
    52.x.x

    ## For Android only:
    $ java -version 
    openjdk 17.0.0.1 2024-07-02
    OpenJDK Runtime Environment (build 17.0.0.1+2-3)
    OpenJDK 64-Bit Server VM (build 17.0.0.1+2-3, mixed mode, sharing)

### Extra
    Run on android:
        Install Android Studio and setup a device with google play store
        Device info in android studio:
            Device: any device that has the play store icon
            APIs: 35, 34...24 (the higher the better)
            Android: 15, 14... (the higher the better)
    Run on iOS:
        Install XCode (ios only)
        Required Xcode version: 16.2
        You can check available versions here: https://xcodereleases.com/

    Install eas-cli globally (with npm) to build
        You can install with `npx expo`

### To install the dependencies, run:

    $ npm install

## Embedding the SDK in an app

The SDK lists the plugin contract, `@mconf/bbb-mobile-plugin-api`, as a peer dependency. The
contract is not on npm, so the app installs it from this repository's `vendor/` tarball, at
the same commit as the SDK:

    $ npm install --save-exact ./path/to/mconf-bbb-mobile-plugin-api-<version>.tgz

Install it again, by its path, on every SDK update. The tarball can change while its version
stays the same. A plain `npm install` then keeps the copy already installed, and `npm ci`
installs the copy cached under the lockfile's hash, or fails with EINTEGRITY.

npm cannot install it for the app: a git or tarball dependency whose own dependency is a
`file:` tarball fails to install. Without the contract, npm stops with E404, or, with
`legacy-peer-deps`, the app's bundler cannot resolve `@mconf/bbb-mobile-plugin-api`.

The app passes its plugins to `App` as `plugins`, a list of definitions made with the
contract's `definePlugin`. The SDK reads the list once, when `App` mounts, and calls each
plugin's `create()` for that meeting; a breakout room creates none. The SDK logs and skips a
plugin whose host API range does not include the SDK's host API version. Of plugins with the
same name, it keeps the first, and logs and skips the others.

A plugin runs only in a meeting whose server turns it on. After the join, the SDK reads the
meeting's plugin list once: the web plugins the server loaded, or failed to load, from their
manifests (`pluginManifests`, `pluginManifestsFetchUrl`). If the server rejects a manifest's URL
or its checksum, or cannot fetch or read the manifest, the list has no row with the plugin's name.

The plugin is active when a manifest with its name loaded with no failure, and when its settings
in the server's client settings set `mobile.enabled` to `true`:

```yaml
public:
  plugins:
    - name: <the plugin's name>
      settings:
        mobile:
          enabled: true
```

Any other value, or no setting, leaves the plugin off. So does a list that cannot be read, or a
load failure the server records at meeting creation (a `requiredSdkVersion` that the server's
plugin SDK does not satisfy, for example). The `mobile` key goes in the plugin's existing
`public.plugins` entry, since a `public.plugins` list in an override file replaces the base
list. The server copies these settings into a meeting when it creates it.

When the read ends, the SDK logs why each plugin is inactive (`plugin_host_not_listed`,
`plugin_host_load_failed`, `plugin_host_mobile_disabled`), or one `plugin_host_list_unavailable`
record when the list cannot be read, then one `plugin_host_activation` record. `create()` still
runs at mount for each plugin the SDK loads; activation decides which of their parts the SDK will
use. An app with no plugins reads nothing.

Once the list is read, the SDK mounts the `Headless` part of each active plugin. The part stays
mounted while the user is in the meeting: across the in-meeting screens, fullscreen and a
breakout room. It unmounts before the feedback screens open, when the user leaves, the meeting
ends or the user is removed. A leave with Android's back button unmounts it with `App`.

A part that throws in render, in an effect or in a cleanup stops, and the rest of the meeting
goes on. A cleanup that throws as `App` unmounts reaches the host app. The SDK logs a failed part
at error level (`plugin_host_part_failed`), and each mount and unmount at debug level
(`plugin_host_part_mounted`, `plugin_host_part_unmounted`).

A plugin's `useCapabilities()` reports:

- `mediaGroupAudioRouting`: the meeting's `audioBridge` is `livekit` and selective subscription
  is on (`public.media.livekit.selectiveSubscription.enabled`, on when unset). Under that
  condition the SDK subscribes to audio by media group. It is `false` until the meeting data
  arrives.
- `mediaGroupCameraRouting`: always `false`. The SDK does not route cameras by media group.
- `inBreakout`: the user has gone into a breakout room, where the main room's media is off.
- `placements`: empty. The SDK draws no plugin placement yet.

## Breakout rooms

Breakout rooms are handled by this same package: a breakout is the root `App`
mounted a second time (with `isBreakout`) inside the main room, each mount
owning its own store, LiveKit room and media managers (see `src/app-instance`).
No extra dependency or separate breakout tag is needed.

## How to run
To run the sdk as standalone just switch the flag on the settings.json:

```json
"dev": true,
```

Edit the App.js file and add your server join url to the defaultJoinURL string

Android:

    $ npx expo run:android
    
if it crashes with an error message with something like: ANDROID_SDK_ENVIRONMENT missing...

    $ export ANDROID_HOME=$HOME/Android/Sdk
    $ export PATH=$PATH:$ANDROID_HOME/tools

```bash
# mac
export ANDROID_SDK_ROOT="$HOME/Library/Android/sdk"
# linux
export ANDROID_SDK_ROOT="$HOME/Android/sdk"
```
if it results in a error with gradle:
    $ cd android && ./gradlew clean
          
iOS:
    $ npx expo run:ios

### Loading a plugin from a folder

A standalone development build can load plugins from folders on disk. Set
`BBB_SDK_DEV_PLUGINS` to the plugin folders, separated as in `PATH`, when Metro starts:

    $ BBB_SDK_DEV_PLUGINS=/path/to/plugin npx expo run:android

Each folder is a package whose entry (`react-native`, else `browser`, else `main`) is its built
code and whose default export is a plugin definition; Metro watches the folders. After a
rebuild of a plugin, reload the app: Fast Refresh keeps the plugins created when `App` mounted.
React, React Native and the plugin contract resolve to this app's copies; host apps run their
own Metro and never load these folders.

With plugins loaded, leaving the meeting mounts a new `App`, which joins again with fresh
plugin state.

## License

bbb-mobile-sdk is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
