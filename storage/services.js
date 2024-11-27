import realm from './schemas';
import {calculateDuration} from '../utils';

const getModel = name => {
  const models = {
    habit: 'Habit',
    weight: 'Weight',
    cost: 'Cost',
    hour: 'Hour',
    plan: 'Plan',
    task: 'Task',
  };
  return models[name];
};

const getNextId = model => {
  const lastItem = realm.objects(model).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
};

export const addItem = (name, when, what, timeStart, timeEnd, category) => {
  const model = getModel(name);
  const id = getNextId(model);

  if (model === 'Habit' || model === 'Task') {
    when = id;
  } else {
    when = new Date(when);
  }
  if (model === 'Hour') {
    what = calculateDuration(timeStart, timeEnd);
  }

  if (model === 'Task') {
    check = false;
  } else {
    check = null;
    category = null;
  }

  let newItem;
  realm.write(() => {
    newItem = realm.create(model, {
      id,
      when,
      what,
      timeStart,
      timeEnd,
      check,
      category,
    });
  });
  return newItem;
};

export const getEveryItem = (name, sort) => {
  const model = getModel(name);
  const sortFields = [['when', sort]];
  (name === 'plan' || name === 'hour') && sortFields.push(['timeStart', sort]);
  sortFields.push(['id', true]);
  const results = realm.objects(model).sorted(sortFields);
  return results.slice(0, 90);
};

export const getItem = (name, id) => {
  const model = getModel(name);
  const item = realm.objectForPrimaryKey(model, id);
  if (item) {
    const serializableItem = JSON.parse(JSON.stringify(item));
    if (serializableItem.when instanceof Date) {
      serializableItem.when = serializableItem.when.toISOString();
    }
    return serializableItem;
  }
  return item;
};

export const updateItem = (
  name,
  id,
  when,
  what,
  timeStart,
  timeEnd,
  check,
  category,
) => {
  const model = getModel(name);
  if (model === 'Habit' || model === 'Task') {
    when = parseInt(when, 10);
  }
  if (model === 'Hour') {
    what = calculateDuration(timeStart, timeEnd);
  }

  let updatedItem;
  realm.write(() => {
    updatedItem = realm.create(
      model,
      {id, when, what, timeStart, timeEnd, check, category},
      'modified',
    );
  });
  return updatedItem;
};

export const deleteItem = (name, id) => {
  const model = getModel(name);
  let deletedItem;
  realm.write(() => {
    const itemToDelete = realm.objectForPrimaryKey(model, id);
    if (itemToDelete) {
      deletedItem = {...itemToDelete};
      realm.delete(itemToDelete);
    }
  });
  return deletedItem;
};
