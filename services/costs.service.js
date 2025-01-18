import realm from '../storage/schemas';
import {getNextId, formatDate} from '../utils';

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
    when: cost.when instanceof Date ? formatDate(cost.when) : cost.when,
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

export const getAllCosts = () => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  return realm.objects('Cost').sorted(sortFields);
};

export const calcAverageCost = () => {
  const costs = getAllCosts();

  if (costs.length === 0) {
    return 0;
  }

  const totalCost = costs.reduce((sum, cost) => sum + parseFloat(cost.what), 0);

  const firstDate = new Date(costs[0].when);
  const lastDate = new Date(costs[costs.length - 1].when);
  const timeDifference = Math.abs(lastDate - firstDate);
  const days = Math.max(
    Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1,
    1,
  );
  const averageCost = totalCost / days;

  return parseFloat(averageCost.toFixed(2));
};
