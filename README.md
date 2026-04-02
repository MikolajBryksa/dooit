# Dooit

A **management tool** designed to help you create and maintain a system of good habits. With Dooit, you can easily track your daily progress of any activity. With just a few clicks, you can define your new goal.  
https://dooit-one-focus.lovable.app/  
https://play.google.com/store/apps/details?id=com.dooit.bryksa

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
  <img src="https://github.com/user-attachments/assets/6d6f20a2-2693-4219-82ab-200f312f0d9e" width="13%" alt="01 Create a habit system" />
  <img src="https://github.com/user-attachments/assets/555631e7-f94a-404a-9b28-f217d17845a0" width="13%" alt="02 Track your daily habits" />
  <img src="https://github.com/user-attachments/assets/8966e242-9886-4be1-b016-b2642b993316" width="13%" alt="03 Modify your habits" />
  <img src="https://github.com/user-attachments/assets/9e18ecee-80bd-44f4-ac82-9faf0973eeb9" width="13%" alt="04 Add new habits" />
  <img src="https://github.com/user-attachments/assets/43a0c463-edfa-446a-8163-8dbe15118072" width="13%" alt="05 Select the best time" />
  <img src="https://github.com/user-attachments/assets/d5f4599e-b7a3-460a-947c-a82c6eb4d74b" width="13%" alt="06 Customize the app" />
  <img src="https://github.com/user-attachments/assets/0ee832ff-5e94-4d5b-bbff-9c88de6bdb9e" width="13%" alt="07 Use a dark mode" />
</div>

## Tech Stack

- **React Native** for building the mobile application
- **Realm** for local database management (offline-first)
- **Supabase** for cloud sync with JWT authentication
- **Java** for Android-specific development

## Features

- **No account required**. Start instantly without registration.
- **Ad-free**. No subscriptions, no ads. Ever.
- **Offline-first**. Works without internet, always.
- **Custom schedules**. Your habits, your rhythm.
- **Progress tracking**. See how your habits grow.
- **Daily summary**. Personalized recap.
- **Distraction-free**. Clean design, zero noise.
- **Light & dark mode**. Beautiful in any lighting.
- **Multi-language support**. Available in English and Polish.

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

This project is licensed under the [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) license — see the [LICENSE](LICENSE) file for details. Non-commercial use is permitted with attribution. Commercial use is strictly prohibited.
