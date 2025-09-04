import Realm from 'realm';
import * as RNLocalize from 'react-native-localize';
import {dayMap} from '@/constants';

class Habit extends Realm.Object {}
Habit.schema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitName: 'string',
    habitEnemy: 'string',
    goodCounter: 'int',
    badCounter: 'int',
    skipCounter: 'int',
    repeatDays: 'string[]',
    repeatHours: 'string[]',
    completedHours: 'string[]',
    available: 'bool',
    icon: 'string',
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
    currentItem: 'int?',
    currentDay: 'string?',
    notifications: 'bool',
    debugMode: 'bool',
    cardDuration: 'int',
  },
};

const realmConfig = {
  schema: [Habit, Settings],
  schemaVersion: 10,
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
      clockFormat: '24 h',
      firstDay: 'mon',
      firstLaunch: true,
      currentItem: 0,
      currentDay: dayMap[new Date().getDay()],
      notifications: false,
      debugMode: false,
      cardDuration: 4,
    });
  }
});

export default realm;
