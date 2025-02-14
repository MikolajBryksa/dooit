import realm from '../storage/schemas';
import {getNextId, formatDate} from '../utils';
import {getBudgetSummary} from './budgets.service';

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

export const getCostsSummary = () => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const costs = realm.objects('Cost');
  const filteredCosts = costs.filter(cost => {
    const costDate = new Date(cost.when);
    return (
      costDate.getMonth() === currentMonth &&
      costDate.getFullYear() === currentYear
    );
  });

  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.what, 0);
  return totalCosts;
};
