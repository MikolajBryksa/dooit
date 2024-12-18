import Realm from 'realm';

class Temp extends Realm.Object {}
Temp.schema = {
  name: 'Temp',
  primaryKey: 'id',
  properties: {
    id: 'int',
    habitId: 'int',
    habitPlay: 'bool',
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
  },
};

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
    habitsTab: 'bool',
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
  },
};

const realmConfig = {
  schema: [Temp, Habit, Weight, Cost, Plan, Task, Settings],
  schemaVersion: 2,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 2) {
      const oldPlanObjects = oldRealm.objects('Plan');
      const newPlanObjects = newRealm.objects('Plan');

      for (let i = 0; i < oldPlanObjects.length; i++) {
        const oldPlan = oldPlanObjects[i];
        const newPlan = newPlanObjects[i];
        newPlan.time = null;
      }
    }
  },
};

const realm = new Realm(realmConfig);

realm.write(() => {
  const existingTemp = realm.objects('Temp')[0];
  if (!existingTemp) {
    realm.create('Temp', {
      id: 1,
      habitId: 0,
      habitPlay: false,
    });
  }

  const existingSettings = realm.objects('Settings')[0];
  if (!existingSettings) {
    realm.create('Settings', {
      id: 1,
      language: 'English',
      rowsNumber: 45,
      habitsTab: true,
      weightsTab: true,
      weightUnit: 'kg',
      weightGain: parseFloat((0.05).toFixed(2)),
      costsTab: true,
      currency: 'zł',
      costGain: 0.5,
      plansTab: true,
      clockFormat: '24h',
      firstDay: 'Monday',
      tasksTab: true,
    });
  }
});

export default realm;
