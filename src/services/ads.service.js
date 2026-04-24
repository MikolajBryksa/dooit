import {TestIds} from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  BANNER_NOW: __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : 'ca-app-pub-8296952085915343/8915874168',
  REWARDED_SUPPORT: __DEV__
    ? TestIds.REWARDED
    : 'ca-app-pub-8296952085915343/5718345660',
};
