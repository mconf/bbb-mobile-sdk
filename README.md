#  bbb-mobile-sdk

## Code dependencies

### Versions

    $ node -v
    v16.15.1

    $ yarn -v
    v1.22.15

    $ java -version 
    openjdk version "11.0.16.1" 2022-08-12
    OpenJDK Runtime Environment (build 11.0.16.1+1)
    OpenJDK 64-Bit Server VM (build 11.0.16.1+1, mixed mode)

    Device info in android studio:
    Pixel 4, API 30, android 11

### Extra

    Clone the repo

    Install Android Studio and setup a device with google play store
    Install XCode (ios only)
  
    Install node
    Install eas-cli globally (with npm or yarn) to build

### To install the dependencies, run:

    $ yarn install

## How to run

    $ expo run:android
    
    if it crashes with an error message with something like: ANDROID_SDK_ENVIRONMENT missing...
    $ export ANDROID_HOME=$HOME/Android/Sdk
    $ export PATH=$PATH:$ANDROID_HOME/tools
          

    $ expo run:ios

## License

bbb-mobile-sdk is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
