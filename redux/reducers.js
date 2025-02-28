import {
  SET_SELECTED_DAY,
  SET_CURRENT_ITEM,
  SET_WEIGHTS,
  SET_MENU,
  SET_COSTS,
  SET_BUDGETS,
  SET_PLANS,
  SET_HABITS,
  SET_TASKS,
  SET_CATEGORY,
  SET_SETTINGS,
} from './actions';

const initialState = {
  selectedDay: null,
  currentItem: null,
  weights: [],
  menu: [],
  costs: [],
  budgets: [],
  plans: [],
  habits: [],
  tasks: [],
  category: 'task',
  settings: {},
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SELECTED_DAY:
      return {
        ...state,
        selectedDay: action.payload,
      };
    case SET_CURRENT_ITEM:
      return {
        ...state,
        currentItem: action.payload,
      };
    case SET_WEIGHTS:
      return {
        ...state,
        weights: action.payload,
      };
    case SET_MENU:
      return {
        ...state,
        menu: action.payload,
      };
    case SET_COSTS:
      return {
        ...state,
        costs: action.payload,
      };
    case SET_BUDGETS:
      return {
        ...state,
        budgets: action.payload,
      };
    case SET_PLANS:
      return {
        ...state,
        plans: action.payload,
      };
    case SET_HABITS:
      return {
        ...state,
        habits: action.payload,
      };
    case SET_TASKS:
      return {
        ...state,
        tasks: action.payload,
      };
    case SET_CATEGORY:
      return {
        ...state,
        category: action.payload,
      };
    case SET_SETTINGS:
      return {
        ...state,
        settings: action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
