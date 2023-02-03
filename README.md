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

### Extra

    Clone the repo

    Install Android Studio and setup a pixel 4 or a device with google play store
    Install XCode (ios only) and ...
  
    Install node
    Install eas-cli globally (with npm or yarn) to build

    Add the android sdk to your bash.rc/zsh.rc
    export ANDROID_SDK_ROOT='/home/{YOUR_USER}/Android/Sdk'
    Change {YOUR_USER} to your pc user name
    then Source your bash/zsh rc file

### To install the dependencies, run:

    $ yarn install
    if it crashes with an error message with something like: ANDROID_SDK_ENVIRONMENT missing...
      --> repeat the last
      or
      --> add a file inside the /android folder
        --> local.properties
        --> and add --> sdk.dir=/home/{YOUR_USER}/Android/Sdk

## How to run

    $ expo run:android
    $ expo run:ios

## License

bbb-mobile-sdk is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
