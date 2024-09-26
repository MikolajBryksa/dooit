export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const SET_HABITS = 'SET_HABITS';
export const SET_WEIGHTS = 'SET_WEIGHTS';
export const SET_COSTS = 'SET_COSTS';
export const SET_PLANS = 'SET_PLANS';
export const SET_TASKS = 'SET_TASKS';
export const SET_MODAL_NAME = 'SET_MODAL_NAME';

export const setCurrentItem = (item) => ({
  type: SET_CURRENT_ITEM,
  payload: item,
});

export const setHabits = (habits) => ({
  type: SET_HABITS,
  payload: habits,
});

export const setWeights = (weights) => ({
  type: SET_WEIGHTS,
  payload: weights,
});

export const setCosts = (costs) => ({
  type: SET_COSTS,
  payload: costs,
});

export const setPlans = (plans) => ({
  type: SET_PLANS,
  payload: plans,
});

export const setTasks = (tasks) => ({
  type: SET_TASKS,
  payload: tasks,
});

export const setModalName = (modalName) => ({
  type: SET_MODAL_NAME,
  payload: modalName,
});
