import Realm from 'realm';

class Weight extends Realm.Object {}
Weight.schema = {
  name: 'Weight',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    what: 'float',
  },
};

class Cost extends Realm.Object {}
Cost.schema = {
  name: 'Cost',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    what: 'float',
  },
};

class Plan extends Realm.Object {}
Plan.schema = {
  name: 'Plan',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    what: 'string',
    time: 'string?',
    check: 'bool',
  },
};

class Habit extends Realm.Object {}
Habit.schema = {
  name: 'Habit',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'int',
    what: 'string',
    time: 'string?',
    monday: 'bool',
    tuesday: 'bool',
    wednesday: 'bool',
    thursday: 'bool',
    friday: 'bool',
    saturday: 'bool',
    sunday: 'bool',
    check: 'bool',
  },
};

class Task extends Realm.Object {}
Task.schema = {
  name: 'Task',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'int',
    what: 'string',
    check: 'bool',
    category: 'string',
  },
};

class Settings extends Realm.Object {}
Settings.schema = {
  name: 'Settings',
  primaryKey: 'id',
  properties: {
    id: 'int',
    language: 'string',
    rowsNumber: 'int',
    weightsTab: 'bool',
    weightUnit: 'string',
    weightGain: 'float',
    costsTab: 'bool',
    currency: 'string',
    costGain: 'float',
    plansTab: 'bool',
    clockFormat: 'string',
    firstDay: 'string',
    tasksTab: 'bool',
    firstLaunch: 'bool',
  },
};

const realmConfig = {
  schema: [Habit, Weight, Cost, Plan, Task, Settings],
  schemaVersion: 1,
  //   migration: (oldRealm, newRealm) => {
  //     if (oldRealm.schemaVersion < 2) {
  //     }
  //   },
};

const realm = new Realm(realmConfig);

realm.write(() => {
  const existingSettings = realm.objects('Settings')[0];
  if (!existingSettings) {
    realm.create('Settings', {
      id: 1,
      language: 'English',
      rowsNumber: 45,
      weightsTab: true,
      weightUnit: 'kg',
      weightGain: parseFloat((0.05).toFixed(2)),
      costsTab: true,
      currency: 'zł',
      costGain: parseFloat((0.5).toFixed(2)),
      plansTab: true,
      clockFormat: '24h',
      firstDay: 'Monday',
      tasksTab: true,
      firstLaunch: true,
    });
  }
});

export default realm;
