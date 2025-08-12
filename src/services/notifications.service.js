import notifee from '@notifee/react-native';
import {AppState} from 'react-native';
import {updateSettingValue} from './settings.service';

export async function syncNotificationStatus(settings, dispatch, setSettings) {
  // Checks system notification permissions and updates app settings to match
  try {
    const settingsStatus = await notifee.getNotificationSettings();
    const granted =
      settingsStatus.authorizationStatus === 1 ||
      settingsStatus.authorizationStatus === 2;

    if (settings && settings.notifications !== granted) {
      updateSettingValue('notifications', granted);
      const updatedSettings = {...settings, notifications: granted};
      dispatch(setSettings(updatedSettings));
    }
  } catch (error) {
    console.error('Error syncing notification status:', error);
  }
}

export function setupNotificationSync(
  // Sets up notification sync when app becomes active
  settings,
  loading,
  dispatch,
  setSettings,
) {
  if (!loading && settings) {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active') {
        syncNotificationStatus(settings, dispatch, setSettings);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    syncNotificationStatus(settings, dispatch, setSettings);

    return () => {
      subscription.remove();
    };
  }
}
