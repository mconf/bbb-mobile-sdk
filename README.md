#  bbb-mobile-sdk

## Code dependencies

### Versions

    $ node -v
    v18.15.0

    $ npm -v
    v9.5.0

    ## For Android only:
    $ java -version 
    openjdk version "11.0.16.1" 2022-08-12
    OpenJDK Runtime Environment (build 11.0.16.1+1)
    OpenJDK 64-Bit Server VM (build 11.0.16.1+1, mixed mode)

### 
    Run on android:
        Install Android Studio and setup a device with google play store
        Device info in android studio:
            Pixel 4, API 30, android 11
    Run on iOS:
        Install XCode (ios only)

    Install eas-cli globally (with npm) to build
        You can install with `npx expo`

### To install the dependencies, run:

    $ npm install

## How to run

    Android:
    $ npx expo run:android
    
    if it crashes with an error message with something like: ANDROID_SDK_ENVIRONMENT missing...
    $ export ANDROID_HOME=$HOME/Android/Sdk
    $ export PATH=$PATH:$ANDROID_HOME/tools

    if it results in a error with gradle:
    $ cd android && ./gradlew clean
          
    iOS:
    $ npx expo run:ios

## License

bbb-mobile-sdk is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
