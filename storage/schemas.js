import Realm from 'realm';

class Habit extends Realm.Object {}
Habit.schema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitName: 'string',
    firstStep: 'string',
    goalDesc: 'string',
    motivation: 'string',
    repeatDays: 'string[]',
    habitStart: 'string',
    progressType: 'string',
    progressUnit: 'string',
    targetScore: 'double',
  },
};

class Progress extends Realm.Object {}
Progress.schema = {
  name: 'Progress',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitId: 'int',
    date: 'date',
    progressAmount: 'int?',
    progressValue: 'double?',
    progressTime: 'int?',
    checked: 'bool',
  },
};

class Settings extends Realm.Object {}
Settings.schema = {
  name: 'Settings',
  primaryKey: 'id',
  properties: {
    id: 'int',
    language: 'string',
    clockFormat: 'string',
    firstDay: 'string',
    firstLaunch: 'bool',
    currentTheme: 'string?',
  },
};

class Temp extends Realm.Object {}
Temp.schema = {
  name: 'Temp',
  primaryKey: 'id',
  properties: {
    id: 'int',
    selectedDay: 'date',
  },
};

const realmConfig = {
  schema: [Habit, Progress, Settings, Temp],
  schemaVersion: 1,
};

const realm = new Realm(realmConfig);

realm.write(() => {
  const existingTemp = realm.objects('Temp')[0];
  if (!existingTemp) {
    realm.create('Temp', {
      id: 1,
      selectedDay: new Date(),
    });
  }

  const existingSettings = realm.objects('Settings')[0];
  if (!existingSettings) {
    realm.create('Settings', {
      id: 1,
      language: 'pl',
      clockFormat: '24h',
      firstDay: 'mon',
      firstLaunch: true,
    });
  }
});

export default realm;
