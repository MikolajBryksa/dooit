# Dooit

Dooit is a **management tool** designed to help you create and maintain a system of good habits. With Dooit, you can easily track your daily tasks, weight changes, current expenses, plans and things to buy.

## Tech Stack

- **React Native** for building the mobile application.
- **Realm** for local database management.
- **Java** for Android-specific development.

## Features

- Create and manage tasks and plans.
- Track your progress and maintain good habits.
- Offline support with Realm database.
- Easy-to-use interface built with React Native.

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

- **Install dependencies:**:

```
    cd dooit
    npm install
```

### Launch

- **Run the app in Android Studio**:

```
    npm run android
```

- **Uninstall the app from Android Simulator**:

```
    Settings > Apps > All apps > Dooit > Uninstall
```

- **Build the APK file**:

```
    npm run build
```

- **Find the APK file**:

```
    android/app/build/outputs/apk/release/app-release.apk
```

- **Build the Android App Bundle**:

```
    npm run build-bundle
```

- **Find the Android App Bundle**:

```
    android/app/build/outputs/bundle/release/app-release.aab
```

### Development

- **Run tests**:

```
    npm run test
```

- **Change the app icon**:

```
    https://icon.kitchen/
```

- **Publish**:

```
    Paste to android/app 2 files:
    - dooit-release-key.keystore
    - secrets.json
```
