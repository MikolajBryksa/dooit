import {
  SET_CURRENT_ITEM,
  SET_HABITS,
  SET_SETTINGS,
} from './actions';

const initialState = {
  currentItem: null,
  habits: [],
  settings: {},
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
