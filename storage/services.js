import realm from './schemas';

const getModel = name => {
  const models = {
    habit: 'Habit',
    weight: 'Weight',
    cost: 'Cost',
    plan: 'Plan',
    task: 'Task',
  };
  return models[name];
};

const getNextId = model => {
  const lastItem = realm.objects(model).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
};

export const addItem = (name, when, what) => {
  const model = getModel(name);
  const id = getNextId(model);
  if (model === 'Weight' || model === 'Cost' || model === 'Plan') {
    when = new Date(when);
  } else {
    when = id;
  }
  let newItem;
  realm.write(() => {
    newItem = realm.create(model, {id, when, what});
  });
  return newItem;
};

export const getEveryItem = (name, sort) => {
  const model = getModel(name);
  const results = realm.objects(model).sorted([
    ['when', sort],
    ['id', true],
  ]);
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

export const updateItem = (name, id, when, what) => {
  const model = getModel(name);
  if (model === 'Habit' || model === 'Task') {
    when = parseInt(when, 10);
  }
  let updatedItem;
  realm.write(() => {
    updatedItem = realm.create(model, {id, when, what}, 'modified');
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
