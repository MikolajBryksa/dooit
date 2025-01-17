import realm from '../storage/schemas';

export const getSettings = () => {
  const settings = realm.objects('Settings')[0];
  if (!settings) return null;

  return {
    id: settings.id,
    language: settings.language,
    rowsNumber: settings.rowsNumber,
    weightsTab: settings.weightsTab,
    weightUnit: settings.weightUnit,
    weightGain: parseFloat(settings.weightGain.toFixed(2)),
    costsTab: settings.costsTab,
    currency: settings.currency,
    costGain: parseFloat(settings.costGain.toFixed(2)),
    plansTab: settings.plansTab,
    clockFormat: settings.clockFormat,
    firstDay: settings.firstDay,
    tasksTab: settings.tasksTab,
    firstLaunch: settings.firstLaunch,
  };
};

export const updateSettings = updates => {
  let updatedSettings;
  realm.write(() => {
    updatedSettings = realm.create('Settings', {id: 1, ...updates}, 'modified');
  });
  return updatedSettings;
};

export const getSettingValue = key => {
  const settings = getSettings();
  return settings ? settings[key] : null;
};

export const updateSettingValue = (key, value) => {
  const updates = {[key]: value};
  return updateSettings(updates);
};
