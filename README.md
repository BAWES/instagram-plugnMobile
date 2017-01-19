# Plugn Mobile Apps Developed on Ionic v2
Mobile app developed in Ionic Framework v2


# Android APK Signing

Release key is included in the main project folder as 
`android-release-key.keystore`.

It was created using the following command:
`keytool -genkey -v -keystore android-release-key.keystore -alias plugn_android -keyalg RSA -keysize 2048 -validity 10000`

## Alias

When asked for Alias it is `plugn_android`

## Signing the unsigned APK

`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore HelloWorld-release-unsigned.apk plugn_android`

This signs the apk in place. Finally, we need to run the zip align tool to optimize the APK. The zipalign tool can be found in /path/to/Android/sdk/build-tools/VERSION/zipalign. For example, on OS X with Android Studio installed, zipalign is in ~/Library/Android/sdk/build-tools/VERSION/zipalign


`zipalign -v 4 HelloWorld-release-unsigned.apk HelloWorld.apk`

Now we have our final release binary called HelloWorld.apk and we can release this on the Google Play Store for all the world to enjoy!
