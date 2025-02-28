#  bbb-mobile-sdk

## Code dependencies

### Versions
    $ node -v
    v18.20.3

    $ npm -v
    v10.7.0

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

    Install eas-cli globally (with npm) to build
        You can install with `npx expo`

### To install the dependencies, run:

    $ npm install

## How to run
    To run the sdk as standalone just switch the flag on the settings.json:
    $ "dev": true,

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

## License

bbb-mobile-sdk is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
