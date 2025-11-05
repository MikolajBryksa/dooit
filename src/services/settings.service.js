import realm from '@/storage/schemas';

export const getSettings = () => {
  const settings = realm.objects('Settings')[0];
  if (!settings) return null;

  return {
    id: settings.id,
    userId: settings.userId,
    userName: settings.userName,
    language: settings.language,
    clockFormat: settings.clockFormat,
    firstDay: settings.firstDay,
    firstLaunch: settings.firstLaunch,
    currentTheme: settings.currentTheme,
    currentItem: settings.currentItem,
    currentDay: settings.currentDay,
    notifications: settings.notifications,
    debugMode: settings.debugMode,
    cardDuration: settings.cardDuration,
  };
};

export const updateSettings = updates => {
  // Preventing userId changes
  const {userId, ...safeUpdates} = updates;

  let updatedSettings;
  realm.write(() => {
    updatedSettings = realm.create(
      'Settings',
      {id: 1, ...safeUpdates},
      'modified',
    );
  });

  return {
    id: updatedSettings.id,
    userId: updatedSettings.userId,
    userName: updatedSettings.userName,
    language: updatedSettings.language,
    clockFormat: updatedSettings.clockFormat,
    firstDay: updatedSettings.firstDay,
    firstLaunch: updatedSettings.firstLaunch,
    currentTheme: updatedSettings.currentTheme,
    currentItem: updatedSettings.currentItem,
    currentDay: updatedSettings.currentDay,
    notifications: updatedSettings.notifications,
    debugMode: updatedSettings.debugMode,
    cardDuration: updatedSettings.cardDuration,
  };
};

export const getSettingValue = key => {
  const settings = getSettings();
  return settings ? settings[key] : null;
};

export const updateSettingValue = (key, value) => {
  const updates = {[key]: value};
  return updateSettings(updates);
};
