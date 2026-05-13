import NetInfo from '@react-native-community/netinfo';
import {AdsConsent} from 'react-native-google-mobile-ads';
import {updateSettingValue} from './settings.service';
import {logError} from './errors.service';

const runConsentFlow = async () => {
  const consentInfo = await AdsConsent.requestInfoUpdate();
  if (consentInfo.isConsentFormAvailable) {
    await AdsConsent.showForm();
  }
};

const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
  } catch (e) {
    logError(e, 'adsConsent.netInfo');
    return false;
  }
};

export const requestAdsConsentWithNetworkCheck = async () => {
  if (!(await isOnline())) {
    updateSettingValue('pendingAdsConsent', true);
    return;
  }

  try {
    await runConsentFlow();
    updateSettingValue('pendingAdsConsent', false);
  } catch (e) {
    logError(e, 'adsConsent.request');
    updateSettingValue('pendingAdsConsent', true);
  }
};

export const tryShowPendingAdsConsent = async () => {
  try {
    await runConsentFlow();
    updateSettingValue('pendingAdsConsent', false);
  } catch (e) {
    logError(e, 'adsConsent.pendingRetry');
  }
};

export const showAdsConsentForm = async () => {
  await runConsentFlow();
  updateSettingValue('pendingAdsConsent', false);
};
