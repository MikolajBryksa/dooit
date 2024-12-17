import {
  SET_CURRENT_VIEW,
  SET_CURRENT_ITEM,
  SET_HABITS,
  SET_WEIGHTS,
  SET_COSTS,
  SET_PLANS,
  SET_TASKS,
  SET_CATEGORY,
} from './actions';

const initialState = {
  currentView: null,
  currentItem: null,
  habits: [],
  weights: [],
  costs: [],
  plans: [],
  tasks: [],
  category: 'task',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENT_VIEW:
      return {
        ...state,
        currentView: action.payload,
      };
    case SET_CURRENT_ITEM:
      return {
        ...state,
        currentItem: action.payload,
      };
    case SET_HABITS:
      return {
        ...state,
        habits: action.payload,
      };
    case SET_WEIGHTS:
      return {
        ...state,
        weights: action.payload,
      };
    case SET_COSTS:
      return {
        ...state,
        costs: action.payload,
      };
    case SET_PLANS:
      return {
        ...state,
        plans: action.payload,
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
    default:
      return state;
  }
};

export default reducer;
