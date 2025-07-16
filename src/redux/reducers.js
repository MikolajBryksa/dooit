import {
  SET_SELECTED_DAY,
  SET_CURRENT_ITEM,
  SET_HABITS,
  SET_PROGRESS,
  SET_SETTINGS,
} from './actions';

const initialState = {
  selectedDay: null,
  currentItem: null,
  habits: [],
  progress: [],
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
    case SET_HABITS:
      return {
        ...state,
        habits: action.payload,
      };
    case SET_PROGRESS:
      return {
        ...state,
        progress: action.payload,
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
