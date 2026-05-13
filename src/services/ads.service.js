import {TestIds} from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  BANNER_SUMMARY: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : 'ca-app-pub-8296952085915343/8915874168',
  BANNER_HABITS: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : 'ca-app-pub-8296952085915343/8484401385',
  BANNER_SETTINGS: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : 'ca-app-pub-8296952085915343/8344800586',
  REWARDED_SUPPORT: __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-8296952085915343/5718345660',
};
