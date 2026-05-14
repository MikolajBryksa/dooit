import Realm from 'realm';
import {dayMap} from '@/constants';
import {detectDeviceLanguage} from '@/i18next';

class Habit extends Realm.Object {}
Habit.schema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitName: 'string',
    repeatDays: 'string[]',
    repeatHours: 'string[]',
    icon: 'string',
    goal: 'int',
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
    slotIndex: 'int',
    plannedHour: 'string',
    status: 'string',
    timestamp: 'date',
    deleted: 'bool',
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
    dismissedTips: 'string[]',
    streakCount: 'int?',
    lastStreakDate: 'string?',
    adsEnabled: 'bool?',
    pendingAdsConsent: 'bool?',
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
  schema: [Habit, Execution, Settings, ErrorLog, ContactMessage],
  schemaVersion: 37,
  migration: () => {},
};

const realm = new Realm(realmConfig);

try {
  realm.write(() => {
    const existingSettings = realm.objects('Settings')[0];
    if (!existingSettings) {
      realm.create('Settings', {
        id: 1,
        language: detectDeviceLanguage(),
        clockFormat: '24 h',
        firstDay: 'mon',
        firstLaunch: true,
        currentItem: 0,
        currentDay: dayMap[new Date().getDay()],
        notifications: false,
      });
    }
  });
} catch (e) {
  console.error('[schemas] Failed to initialize default settings:', e?.message);
}

export default realm;
