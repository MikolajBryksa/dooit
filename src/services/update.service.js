import {Platform} from 'react-native';
import SpInAppUpdates, {IAUUpdateKind} from 'sp-react-native-in-app-updates';
import {logError} from '@/services/errors.service';

export async function checkForUpdate() {
  if (Platform.OS !== 'android') return null;
  if (__DEV__) return null;
  try {
    const inAppUpdates = new SpInAppUpdates(false);
    const result = await inAppUpdates.checkNeedsUpdate();
    if (!result?.shouldUpdate) return null;
    return () =>
      inAppUpdates
        .startUpdate({updateType: IAUUpdateKind.IMMEDIATE})
        .catch(e => logError(e, 'startUpdate'));
  } catch {
    return null;
  }
}
