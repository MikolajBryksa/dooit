import {
  SET_CURRENT_ITEM,
  SET_HABITS,
  SET_WEIGHTS,
  SET_COSTS,
  SET_PLANS,
  SET_TASKS,
  SET_MODAL_NAME,
} from './actions';

const initialState = {
  currentItem: null,
  habits: null,
  costs: null,
  weights: null,
  plans: null,
  tasks: null,
  modalName: null,
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
    default:
      return state;
  }
};

export default reducer;
