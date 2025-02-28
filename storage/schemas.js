import Realm from 'realm';

class Weight extends Realm.Object {}
Weight.schema = {
  name: 'Weight',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    what: 'double',
  },
};

class Menu extends Realm.Object {}
Menu.schema = {
  name: 'Menu',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    meal1: 'string?',
    meal2: 'string?',
    meal3: 'string?',
    meal4: 'string?',
    meal5: 'string?',
  },
};

class Cost extends Realm.Object {}
Cost.schema = {
  name: 'Cost',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    name: 'string?',
    what: 'double',
  },
};

class Budget extends Realm.Object {}
Budget.schema = {
  name: 'Budget',
  primaryKey: 'id',
  properties: {
    id: 'int',
    type: 'string',
    period: 'string',
    name: 'string',
    what: 'double',
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
    weightsTab: 'bool',
    weightUnit: 'string',
    weightGain: 'double',
    costsTab: 'bool',
    currency: 'string',
    costGain: 'double',
    plansTab: 'bool',
    clockFormat: 'string',
    firstDay: 'string',
    tasksTab: 'bool',
    firstLaunch: 'bool',
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
  schema: [Weight, Menu, Cost, Budget, Plan, Habit, Task, Settings, Temp],
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
      language: 'English',
      weightsTab: true,
      weightUnit: 'kg',
      weightGain: 0.05,
      costsTab: true,
      currency: 'zł',
      costGain: 0.5,
      plansTab: true,
      clockFormat: '24h',
      firstDay: 'Monday',
      tasksTab: true,
      firstLaunch: true,
    });
  }
});

export default realm;
