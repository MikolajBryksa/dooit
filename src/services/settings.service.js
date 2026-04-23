import realm from '@/storage/schemas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {subtractDays} from '@/utils';

export const getSettings = () => {
  try {
    const settings = realm.objects('Settings')[0];
    if (!settings) return null;

    return {
      id: settings.id,
      userName: settings.userName,
      language: settings.language,
      clockFormat: settings.clockFormat,
      firstDay: settings.firstDay,
      firstLaunch: settings.firstLaunch,
      currentTheme: settings.currentTheme,
      currentItem: settings.currentItem,
      currentDay: settings.currentDay,
      notifications: settings.notifications,
      dismissedTips: [...(settings.dismissedTips || [])],
      streakCount: settings.streakCount ?? 0,
      lastStreakDate: settings.lastStreakDate ?? null,
    };
  } catch (e) {
    console.error('[settings.getSettings]', e?.message);
    return null;
  }
};

export const updateSettings = updates => {
  try {
    let updatedSettings;
    realm.write(() => {
      updatedSettings = realm.create(
        'Settings',
        {id: 1, ...updates},
        'modified',
      );
    });

    return {
      id: updatedSettings.id,
      userName: updatedSettings.userName,
      language: updatedSettings.language,
      clockFormat: updatedSettings.clockFormat,
      firstDay: updatedSettings.firstDay,
      firstLaunch: updatedSettings.firstLaunch,
      currentTheme: updatedSettings.currentTheme,
      currentItem: updatedSettings.currentItem,
      currentDay: updatedSettings.currentDay,
      notifications: updatedSettings.notifications,
      dismissedTips: [...(updatedSettings.dismissedTips || [])],
      streakCount: updatedSettings.streakCount ?? 0,
      lastStreakDate: updatedSettings.lastStreakDate ?? null,
    };
  } catch (e) {
    console.error('[settings.updateSettings]', e?.message);
    return null;
  }
};

export const checkStreakBreak = today => {
  const settings = getSettings();
  if (!settings || !settings.lastStreakDate || settings.streakCount === 0)
    return null;
  if (settings.lastStreakDate === today) return null;
  const yesterday = subtractDays(today, 1);
  if (settings.lastStreakDate === yesterday) return null;
  return updateSettings({streakCount: 0});
};

export const updateStreakIfNeeded = today => {
  const settings = getSettings();
  if (!settings || settings.lastStreakDate === today) return null;
  const yesterday = subtractDays(today, 1);
  const isConsecutive = settings.lastStreakDate === yesterday;
  return updateSettings({
    streakCount: isConsecutive ? (settings.streakCount || 0) + 1 : 1,
    lastStreakDate: today,
  });
};

export const dismissTip = (tipId, currentSettings) => {
  try {
    const already = currentSettings?.dismissedTips || [];
    if (already.includes(tipId)) return currentSettings;
    const updated = [...already, tipId];
    return updateSettingValue('dismissedTips', updated);
  } catch (e) {
    console.error('[settings.dismissTip]', e?.message);
    return null;
  }
};

export const getSettingValue = key => {
  const settings = getSettings();
  return settings ? settings[key] : null;
};

export const updateSettingValue = (key, value) => {
  const updates = {[key]: value};
  return updateSettings(updates);
};

export const deleteAllLocalData = async () => {
  try {
    realm.write(() => {
      realm.delete(realm.objects('Habit'));
      realm.delete(realm.objects('Execution'));
      realm.delete(realm.objects('ErrorLog'));
      realm.delete(realm.objects('ContactMessage'));
      realm.create(
        'Settings',
        {
          id: 1,
          userName: null,
          language: 'en',
          clockFormat: '24 h',
          firstDay: 'mon',
          firstLaunch: true,
          currentTheme: null,
          currentItem: 0,
          currentDay: null,
          notifications: false,
          dismissedTips: [],
          streakCount: 0,
          lastStreakDate: null,
        },
        'modified',
      );
    });
  } catch (e) {
    console.error('[settings.deleteAllLocalData] Realm error:', e?.message);
    throw e;
  }

  try {
    await AsyncStorage.removeItem('LAST_RESET_DATE');
  } catch (e) {
    console.error(
      '[settings.deleteAllLocalData] AsyncStorage error:',
      e?.message,
    );
  }
};
