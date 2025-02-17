import realm from '../storage/schemas';
import {getNextId, formatDate} from '../utils';

export const addCost = (when, name, what) => {
  const id = getNextId('Cost');
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

  let newCost;
  realm.write(() => {
    newCost = realm.create('Cost', {
      id,
      when,
      name,
      what,
    });
  });
  return newCost;
};

export const getEveryCost = () => {
  const sortFields = [
    ['when', true],
    ['id', true],
  ];
  const results = realm.objects('Cost').sorted(sortFields);
  return results;
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

export const updateCost = (id, when, name, what) => {
  when = new Date(when);
  what = parseFloat(parseFloat(what).toFixed(2));

  let updatedCost;
  realm.write(() => {
    updatedCost = realm.create('Cost', {id, when, name, what}, 'modified');
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

export const getCostsSummary = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const costs = realm.objects('Cost');

  if (costs.length === 0) {
    return 0;
  }

  const filteredCosts = costs.filter(cost => {
    const costDate = new Date(cost.when);
    return (
      costDate.getMonth() === currentMonth &&
      costDate.getFullYear() === currentYear
    );
  });

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.what, 0);
  return totalCosts % 1 === 0 ? totalCosts.toString() : totalCosts.toFixed(2);
};
