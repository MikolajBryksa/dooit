import realm from '../storage/schemas';
import {getNextId, formatDate} from '../utils';

export const addWeight = (when, what) => {
  const id = getNextId('Weight');
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

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

export const getEveryWeight = () => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  const results = realm.objects('Weight').sorted(sortFields);
  return results;
};

export const getWeight = id => {
  const weight = realm.objectForPrimaryKey('Weight', id);
  if (!weight) return null;

  const serializableWeight = {
    ...weight,
    when: weight.when instanceof Date ? formatDate(weight.when) : weight.when,
    what: parseFloat(parseFloat(weight.what).toFixed(2)),
  };

  return serializableWeight;
};

export const updateWeight = (id, when, what) => {
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

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

export const getAllWeights = () => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  return realm.objects('Weight').sorted(sortFields);
};

export const calcWeightChange = () => {
  const weights = getAllWeights();

  if (weights.length === 0) {
    return {weightChange: 0, dayDifference: 0};
  }

  const firstWeight = weights[0].what;
  const lastWeight = weights[weights.length - 1].what;
  let weightChange = firstWeight - lastWeight;
  weightChange = parseFloat(weightChange.toFixed(2));

  if (weightChange > 0) {
    weightChange = `+${weightChange}`;
  }

  const firstDate = new Date(weights[0].when);
  const lastDate = new Date(weights[weights.length - 1].when);
  const timeDifference = Math.abs(lastDate - firstDate);
  const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return {weightChange, dayDifference};
};
