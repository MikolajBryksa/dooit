import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addBudget = (type, period, name, what) => {
  const id = getNextId('Budget');
  what = parseFloat(parseFloat(what).toFixed(2));

  let newBudget;
  realm.write(() => {
    newBudget = realm.create('Budget', {
      id,
      type,
      period,
      name,
      what,
    });
  });
  return newBudget;
};

export const getEveryBudget = () => {
  const sortFields = [
    ['type', true],
    ['what', true],
    ['id', true],
  ];
  const results = realm.objects('Budget').sorted(sortFields);
  return results;
};

export const getBudget = id => {
  const budget = realm.objectForPrimaryKey('Budget', id);
  if (!budget) return null;

  return {
    ...budget,
    what: parseFloat(parseFloat(budget.what).toFixed(2)),
  };
};

export const updateBudget = (id, type, period, name, what) => {
  what = parseFloat(parseFloat(what).toFixed(2));

  let updatedBudget;
  realm.write(() => {
    updatedBudget = realm.create(
      'Budget',
      {id, type, period, name, what},
      'modified',
    );
  });
  return updatedBudget;
};

export const deleteBudget = id => {
  let deletedBudget;
  realm.write(() => {
    const budgetToDelete = realm.objectForPrimaryKey('Budget', id);
    if (budgetToDelete) {
      deletedBudget = {...budgetToDelete};
      realm.delete(budgetToDelete);
    }
  });
  return deletedBudget;
};

export const getBudgetSummary = () => {
  const budgets = realm.objects('Budget');

  if (budgets.length === 0) {
    return 0;
  }

  const income = budgets.filtered('type == "income"');
  const totalIncome = income.reduce((sum, item) => sum + item.what, 0);

  const expense = budgets.filtered('type == "expense"');
  const totalExpense = expense.reduce((sum, item) => {
    const expenseAmount = item.period === 'yearly' ? item.what / 12 : item.what;
    return sum + expenseAmount;
  }, 0);

  const balance = totalIncome - totalExpense;
  return balance % 1 === 0 ? balance.toString() : balance.toFixed(2);
};
