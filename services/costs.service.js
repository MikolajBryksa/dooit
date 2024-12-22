import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addCost = (when, what) => {
  const id = getNextId('Cost');
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

  let newCost;
  realm.write(() => {
    newCost = realm.create('Cost', {
      id,
      when,
      what,
    });
  });
  return newCost;
};

export const getEveryCost = rowsNumber => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  const results = realm.objects('Cost').sorted(sortFields);
  return results.slice(0, rowsNumber);
};

export const getCost = id => {
  const cost = realm.objectForPrimaryKey('Cost', id);
  if (!cost) return null;

  return {
    ...cost,
    when: cost.when instanceof Date ? cost.when.toISOString() : cost.when,
    what: parseFloat(parseFloat(cost.what).toFixed(2)),
  };
};

export const updateCost = (id, when, what) => {
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

  let updatedCost;
  realm.write(() => {
    updatedCost = realm.create('Cost', {id, when, what}, 'modified');
  });
  return updatedCost;
};

export const deleteCost = id => {
  let deletedCost;
  realm.write(() => {
    const costToDelete = realm.objectForPrimaryKey('Cost', id);
    if (costToDelete) {
      deletedCost = {...costToDelete};
      realm.delete(costToDelete);
    }
  });
  return deletedCost;
};
