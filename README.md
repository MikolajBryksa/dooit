# Dooit

A **management tool** designed to help you create and maintain a system of good habits. With Dooit, you can easily track your daily progress of any activity. With just a few clicks, you can define your new goal.  
https://dooit-one-focus.lovable.app/  
https://play.google.com/store/apps/details?id=com.dooit.bryksa  

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/eaf3437e-c7fb-4abb-822b-9b04fd277a25" width="13%" alt="01 Create a habit system" />
  <img src="https://github.com/user-attachments/assets/be5f44d4-9faa-40f3-bab9-df094aeed958" width="13%" alt="02 Track your daily habits" />
  <img src="https://github.com/user-attachments/assets/9e2d552d-9b59-4f9f-921a-ab4dffe1b3b5" width="13%" alt="03 Modify your habits" />
  <img src="https://github.com/user-attachments/assets/a2b348e8-36c5-476e-a45e-42e487cf5eaa" width="13%" alt="04 Add new habits" />
  <img src="https://github.com/user-attachments/assets/56c8c9f9-bdbe-4bee-a899-801305f06be6" width="13%" alt="05 Select the best time" />
  <img src="https://github.com/user-attachments/assets/b276fbcf-1f0d-4cb3-be24-0fc338d04f83" width="13%" alt="06 Customize the app" />
  <img src="https://github.com/user-attachments/assets/26ac2de3-cbba-4eb4-996f-313ec96c6ab3" width="13%" alt="07 Use a dark mode" />
</div>

## Tech Stack

- **React Native** for building the mobile application
- **Realm** for local database management (offline-first)
- **Supabase** for cloud sync with JWT authentication
- **Java** for Android-specific development

## Features

- **No account**. Start instantly without registration.
- **Free**. No subscriptions, no ads.
- **Offline**. Works without internet.
- **Custom schedules**. Your habits, your rhythm.
- **Progress tracking**. See how your habits grow.
- **Daily summary**. Personalized recap.
- **No distraction**. Clean design, zero noise.
- **Dark mode**. Beautiful in any lighting.
- **Multi-language**. Available in English and Polish.

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

- **Setup Supabase**:

  ```
  Authentication → Settings → Auth Providers Enable → "Anonymous sign-ins"
  SQL Editor → Run the entire `supabase-setup.sql` file
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

## Build

- **Update version**:

  ```
  Change version in package.json
  Change versionCode and versionName in android/app/build.gradle
  ```

- **Build new version**:

  ```
  npm run build
  npm run bundle
  ```

- **Find the app builds**:

  ```
  android/app/build/outputs/apk/release/app-release.apk
  android/app/build/outputs/bundle/release/app-release.aab
  ```

### Launch

- **Run the app in Android Studio**:

  ```
  npm run android
  ```

## License

This project is licensed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) license.  
See the [LICENSE](LICENSE) file for details.  
Non-commercial use is permitted with attribution.  
Commercial use is strictly prohibited.
