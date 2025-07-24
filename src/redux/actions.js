export const SET_CURRENT_ITEM = 'SET_CURRENT_ITEM';
export const SET_HABITS = 'SET_HABITS';
export const SET_SETTINGS = 'SET_SETTINGS';

export const setCurrentItem = item => ({
  type: SET_CURRENT_ITEM,
  payload: item,
});

export const setHabits = habits => ({
  type: SET_HABITS,
  payload: habits,
});

export const setSettings = settings => ({
  type: SET_SETTINGS,
  payload: settings,
});
