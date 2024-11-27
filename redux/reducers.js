import {
  SET_CURRENT_ITEM,
  SET_HABITS,
  SET_WEIGHTS,
  SET_COSTS,
  SET_HOURS,
  SET_PLANS,
  SET_TASKS,
  SET_MODAL_NAME,
  SET_CATEGORY,
} from './actions';

const initialState = {
  currentItem: null,
  habits: [],
  weights: [],
  costs: [],
  hours: [],
  plans: [],
  tasks: [],
  modalName: null,
  category: 'task',
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
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
    case SET_HOURS:
      return {
        ...state,
        hours: action.payload,
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
    case SET_MODAL_NAME:
      return {
        ...state,
        modalName: action.payload,
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
