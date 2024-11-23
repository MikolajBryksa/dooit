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

class Work extends Realm.Object {}
Work.schema = {
  name: 'Work',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    timeStart: 'string?',
    timeEnd: 'string?',
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
    timeStart: 'string?',
    timeEnd: 'string?',
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
  },
};

const realmConfig = {
  schema: [Habit, Weight, Cost, Plan, Task],
  schemaVersion: 1,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 1) {
      const oldObjects = oldRealm.objects('Plan');
      const newObjects = newRealm.objects('Plan');

      for (let i = 0; i < oldObjects.length; i++) {
        newObjects[i].timeStart = '';
        newObjects[i].timeEnd = '';
      }
    }
  },
};

export default new Realm(realmConfig);
