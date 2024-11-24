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

class Hour extends Realm.Object {}
Hour.schema = {
  name: 'Hour',
  primaryKey: 'id',
  properties: {
    id: 'int',
    when: 'date',
    what: 'string?',
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
  schema: [Habit, Weight, Cost, Hour, Plan, Task],
  schemaVersion: 3,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 1) {
      const oldObjects = oldRealm.objects('Plan');
      const newObjects = newRealm.objects('Plan');

      for (let i = 0; i < oldObjects.length; i++) {
        newObjects[i].timeStart = '';
        newObjects[i].timeEnd = '';
      }
    }

    if (oldRealm.schemaVersion < 3) {
      const oldHourObjects = oldRealm.objects('Hour');
      const newHourObjects = newRealm.objects('Hour');

      for (let i = 0; i < oldHourObjects.length; i++) {
        newHourObjects[i].what = oldHourObjects[i].what || '';
      }
    }
  },
};

export default new Realm(realmConfig);
