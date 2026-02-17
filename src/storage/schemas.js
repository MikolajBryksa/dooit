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
    goodCounter: 'int',
    badCounter: 'int',
    repeatDays: 'string[]',
    repeatHours: 'string[]',
    available: 'bool',
    icon: 'string',
  },
};

class Execution extends Realm.Object {}
Execution.schema = {
  name: 'Execution',
  primaryKey: 'id',
  properties: {
    id: 'string',
    habitId: 'int',
    date: 'string',
    hour: 'string',
    status: 'string',
    timestamp: 'date',
  },
};

class Settings extends Realm.Object {}
Settings.schema = {
  name: 'Settings',
  primaryKey: 'id',
  properties: {
    id: 'int',
    userName: 'string?',
    language: 'string',
    clockFormat: 'string',
    firstDay: 'string',
    firstLaunch: 'bool',
    currentTheme: 'string?',
    currentItem: 'int?',
    currentDay: 'string?',
    notifications: 'bool',
  },
};

class DailySummary extends Realm.Object {}
DailySummary.schema = {
  name: 'DailySummary',
  primaryKey: 'updatedAt',
  properties: {
    updatedAt: 'string',
    habitsJson: 'string?',
    aiSummary: 'string?',
  },
};

class ErrorLog extends Realm.Object {}
ErrorLog.schema = {
  name: 'ErrorLog',
  primaryKey: 'id',
  properties: {
    id: 'string',
    error_message: 'string',
    error_stack: 'string?',
    context: 'string?',
    app_version: 'string?',
    user_id: 'string?',
    user_name: 'string?',
    created_at: 'string',
  },
};

class ContactMessage extends Realm.Object {}
ContactMessage.schema = {
  name: 'ContactMessage',
  primaryKey: 'id',
  properties: {
    id: 'string',
    sent_at: 'date',
  },
};

const realmConfig = {
  schema: [Habit, Execution, Settings, DailySummary, ErrorLog, ContactMessage],
  schemaVersion: 22,
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
    });
  }
});

export default realm;
