# Dooit

A **management tool** designed to help you create and maintain a system of good habits. With Dooit, you can easily track your daily progress of any activity. With just a few clicks, you can define your new goal.  
https://play.google.com/store/apps/details?id=com.dooit.bryksa

## Tech Stack

- **React Native** for building the mobile application
- **Realm** for local database management
- **Java** for Android-specific development
- **Supabase** for collecting analytics data
- **Google Cloud** for generating AI-powered messages

## Features

- No network or account login required
- Creating and managing a habit system
- Tracking progress toward daily goals
- English and Polish languages
- Customizable clock and calendar
- Light and dark theme

## Setup

### Requirements

Before you begin, ensure you have met the following requirements:

- **Node.js**: 18.20.4

  ```
  node -v
  ```

- **npm**: 10.7.0

  ```
  npm -v
  ```

- **Java Development Kit (JDK)**: 17.0.6

  ```
  java --version
  ```

- **Android Studio** with the Android SDK.

### Installation

- **Clone the repository**:

  ```
  git clone https://github.com/MikolajBryksa/dooit.git
  ```

- **Install dependencies**:

  ```
  cd dooit
  npm install
  ```

- **Copy the required files**:

  ```
  Paste dooit-release-key.keystore to android/app
  Paste .env to main directory
  ```

### Launch

- **Build the APK file**:

  ```
  npm run build
  ```

- **Find the APK file**:

  ```
  android/app/build/outputs/apk/release/app-release.apk
  ```

- **Run the app in Android Studio**:

  ```
  npm run android
  ```

## Development

- **Change the app icon**:

  ```
  https://icon.kitchen/
  Paste folders to:
  /android/app/src/main/res
  ```

- **Change the app font**:

  ```
  Paste fonts to:
  /assets/fonts
  Update fontConfig.js
  ```

- **Uninstall the app from Android Simulator**:

  ```
  Settings > Apps > All apps > Dooit > Uninstall
  ```

## Publishing

- **Update version**:

  ```
  Change version in package.json
  Change versionCode and versionName in android/app/build.gradle
  ```

- **Build the Android App Bundle**:

  ```
  npm run build-bundle
  ```

- **Find the Android App Bundle**:

  ```
  android/app/build/outputs/bundle/release/app-release.aab
  ```

- **Submit new version to Google Play**:

  https://play.google.com/console/u/0/developers/7319941563958195551/app/4975927330793716884/bundle-explorer-selector

- **Update the app info**:

  https://play.google.com/console/u/0/developers/7319941563958195551/app/4975927330793716884/main-store-listing

- **Create new version for testers**:

  https://play.google.com/console/u/0/developers/7319941563958195551/app/4975927330793716884/tracks/4698028729410342214?tab=releases

- **Link for testers**:

  https://play.google.com/apps/testing/com.dooit.bryksa
