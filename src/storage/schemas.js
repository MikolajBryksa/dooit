import Realm from 'realm';
import * as RNLocalize from 'react-native-localize';

class Habit extends Realm.Object {}
Habit.schema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitName: 'string',
    goodChoice: 'string',
    badChoice: 'string',
    score: 'int',
    level: 'int',
    currentStreak: 'int',
    desc: 'string?',
    message: 'string?',
    repeatDays: 'string[]',
    repeatHours: 'string[]',
    available: 'bool',
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

const realmConfig = {
  schema: [Habit, Settings],
  schemaVersion: 4,
  deleteRealmIfMigrationNeeded: true,
};

const realm = new Realm(realmConfig);

realm.write(() => {
  const existingSettings = realm.objects('Settings')[0];
  if (!existingSettings) {
    const deviceLocales = RNLocalize.getLocales();
    const deviceLanguage =
      deviceLocales && deviceLocales.length > 0
        ? deviceLocales[0].languageCode
        : 'en';

    realm.create('Settings', {
      id: 1,
      language: deviceLanguage,
      clockFormat: '24h',
      firstDay: 'mon',
      firstLaunch: true,
    });
  }
});

export default realm;
