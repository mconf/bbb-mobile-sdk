{
  description = "bbb-mobile-sdk development shell";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
        config = {
          allowUnfree = true;
          android_sdk.accept_license = true;
        };
      };

      androidComposition = pkgs.androidenv.composeAndroidPackages {
        platformVersions = [ "36" ];
        buildToolsVersions = [ "36.0.0" ];
        ndkVersions = [ "27.1.12297006" ];
        cmakeVersions = [ "3.22.1" ];
        includeNDK = true;
        includeCmake = true;
      };

      androidSdk = androidComposition.androidsdk;
      sdkRoot = "${androidSdk}/libexec/android-sdk";
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_22
          jdk17
          androidSdk
          android-tools # adb
        ];

        ANDROID_HOME = sdkRoot;
        ANDROID_SDK_ROOT = sdkRoot;
        ANDROID_NDK_HOME = "${sdkRoot}/ndk/27.1.12297006";
        JAVA_HOME = "${pkgs.jdk17}";
        GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${sdkRoot}/build-tools/36.0.0/aapt2";

        shellHook = ''
          export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/build-tools/36.0.0:$PATH"
          echo "bbb-mobile-sdk development shell"
          node --version
          java -version
        '';
      };
    };
}
