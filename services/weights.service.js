import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addWeight = (when, what) => {
  const id = getNextId('Weight');
  when = new Date(when);

  let newWeight;
  realm.write(() => {
    newWeight = realm.create('Weight', {
      id,
      when,
      what,
    });
  });
  return newWeight;
};

export const getEveryWeight = rowsNumber => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  const results = realm.objects('Weight').sorted(sortFields);
  return results.slice(0, rowsNumber);
};

export const getWeight = id => {
  const weight = realm.objectForPrimaryKey('Weight', id);
  if (!weight) return null;

  const serializableWeight = {
    ...weight,
    when: weight.when instanceof Date ? weight.when.toISOString() : weight.when,
  };

  return serializableWeight;
};

export const updateWeight = (id, when, what) => {
  when = new Date(when);
  let updatedWeight;
  realm.write(() => {
    updatedWeight = realm.create('Weight', {id, when, what}, 'modified');
  });
  return updatedWeight;
};

export const deleteWeight = id => {
  let deletedWeight;
  realm.write(() => {
    const weightToDelete = realm.objectForPrimaryKey('Weight', id);
    if (weightToDelete) {
      deletedWeight = {...weightToDelete};
      realm.delete(weightToDelete);
    }
  });
  return deletedWeight;
};
