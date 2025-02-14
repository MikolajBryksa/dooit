export const SET_SELECTED_DAY = 'SET_SELECTED_DAY';
export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const SET_WEIGHTS = 'SET_WEIGHTS';
export const SET_COSTS = 'SET_COSTS';
export const SET_BUDGETS = 'SET_BUDGETS';
export const SET_PLANS = 'SET_PLANS';
export const SET_HABITS = 'SET_HABITS';
export const SET_TASKS = 'SET_TASKS';
export const SET_CATEGORY = 'SET_CATEGORY';
export const SET_SETTINGS = 'SET_SETTINGS';

export const setSelectedDay = item => ({
  type: SET_SELECTED_DAY,
  payload: item,
});

export const setCurrentItem = item => ({
  type: SET_CURRENT_ITEM,
  payload: item,
});

export const setWeights = weights => ({
  type: SET_WEIGHTS,
  payload: weights,
});

export const setCosts = costs => ({
  type: SET_COSTS,
  payload: costs,
});

export const setBudgets = budgets => ({
  type: SET_BUDGETS,
  payload: budgets,
});

export const setPlans = plans => ({
  type: SET_PLANS,
  payload: plans,
});

export const setHabits = habits => ({
  type: SET_HABITS,
  payload: habits,
});

export const setTasks = tasks => ({
  type: SET_TASKS,
  payload: tasks,
});

export const setCategory = category => ({
  type: SET_CATEGORY,
  payload: category,
});

export const setSettings = settings => ({
  type: SET_SETTINGS,
  payload: settings,
});
