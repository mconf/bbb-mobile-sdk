
#  bbb-mobile-sdk
The bbb-mobile-sdk is a software development kit (SDK) designed for mobile applications that integrate with BigBlueButton. This SDK provides developers with a set of tools and libraries to easily build mobile apps that can interact with the features and functionalities of BBB.

## **Table of Contents**

-   Features
-   Code dependencies
-   How to integrate with my own BBB server
-   Contributing
-   License

## Features
-   Real-time video and audio conferencing capabilities
-   View presentation and screen sharing functionality
-   Recording of meetings
-   Breakout rooms
-   Chat and messaging functionality

Check the full list of features present in HTML5 and bbb-mobile-sdk [here](https://github.com/mconf/bbb-mobile-sdk/wiki/Features-table)

## Code dependencies
Android: [here](https://github.com/mconf/bbb-mobile-sdk/wiki/Android-installation)

iOS: [here](https://github.com/mconf/bbb-mobile-sdk/wiki/iOS-installation)


## How to integrate with my own BBB server
Currently, the bbb-mobile-sdk can only integrate if the server is version 2.5 / 2.6 and 2.7 (experimental). We are very excited about version 3.0, and we believe that things will get easier, but for now, we don't support this version yet.

`bbb-mobile-sdk` does not yet have all the features that BBB's HTML5 client provides, so see the [equivalence table](https://github.com/mconf/bbb-mobile-sdk/wiki/Features-table) to check if it makes sense for you to integrate this project.

If you are not a mobile developer, it may take a little time to install simulators and Android SDKs, however, after the initial installation the **ONLY** thing you need to join a session is the Join link.

`bbb-mobile-sdk` can be compared as a native HTML5 version.

 ### Easy implementation
 To make things easier, we provide a template that provides all the dependencies for you to develop your own version of greenlight. We plan to make this template available with BigBlueButton's Greenlight integrated in the future, but for now we leave it as a simple template.
 https://github.com/mconf/bbb-mobile-template
 
 ### Manual implementation

 If you already have a react-native application that uses the BBB version through a WebView, you can install the component using:

```bash
$ npm install git+https://github.com/mconf/bbb-mobile-sdk.git#v0.9.4
# Yes, we plan to make this package available via npm.
```

You probably have to build your own native modules (/ios/ and /android/ folder) of your application, and this will require you to install WebRTC modules and other native libraries that require the main application to implement. The native modules you will have to install are listed here.
___

After the initial installation you can start using like

```jsx
import BbbMobileSdk from "bbb-mobile-sdk";
```

Pass the joinUrl of your meeting in the jUrl prop, and what to do when the user leave the meeting to the onLeaveSession callback:

```jsx
<BbbMobileSdk 
  jUrl={joinUrl} 
  onLeaveSession={() => navigation.replace("Home")} 
/>
```

## Contributing
We welcome contributions from the community. To contribute to the BigBlueButton Mobile SDK, follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and submit a pull request.

Please read our [contribution guidelines](https://github.com/mconf/bbb-mobile-sdk/blob/main/CONTRIBUTING.md) for more details.

## License

The `bbb-mobile-sdk` is released under the [MIT License](https://github.com/mconf/bbb-mobile-sdk/blob/dev/LICENSE.md).
