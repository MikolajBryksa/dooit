import Realm from 'realm';

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

const realmConfig = {
  schema: [Habit, Weight, Cost, Plan, Task],
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

export default new Realm(realmConfig);
