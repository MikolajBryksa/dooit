import React from 'react';
import {COLORS, styles} from './styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faClock,
  faCoins,
  faCalendar,
  faList,
  faWeight,
  faCog,
  faCircleCheck,
  faPlus,
  faCheck,
  faMinus,
  faTimes,
  faBasketShopping,
  faMugHot,
  faWallet,
  faUtensils,
  faCalendarCheck,
  faInfinity,
  faCommentDots,
} from '@fortawesome/free-solid-svg-icons';
import {faCircle} from '@fortawesome/free-regular-svg-icons';
import realm from './storage/schemas';

export function getNextId(itemName) {
  const lastItem = realm.objects(itemName).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
}

export function formatDate(when) {
  const today = when ? new Date(when) : new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;
  return localToday;
}

export function formatDateWithDay(when, language) {
  if (when.length < 3) {
    return '';
  }
  language = language === 'English' ? 'en' : 'pl';
  const date = new Date(when);
  let dayOfWeek = date.toLocaleDateString(language, {weekday: 'long'});
  const month = date.toLocaleDateString(language, {month: '2-digit'});
  const day = date.toLocaleDateString(language, {day: '2-digit'});
  dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return `${day}.${month} ${dayOfWeek}`;
}

export function formatNumericInput(text) {
  let sanitizedText = text.replace(/[^0-9]/g, '.');
  const parts = sanitizedText.split('.');

  if (parts.length === 2) {
    sanitizedText = parts[0] + '.' + parts[1].slice(0, 2);
  }

  if (parts.length > 2) {
    sanitizedText = parts[0] + '.' + parts.slice(1).join('');
  }

  if (sanitizedText.length > 12) {
    sanitizedText = sanitizedText.slice(0, 12);
  }

  return sanitizedText;
}

export function limitTextInput(text) {
  let sanitizedText = text;

  if (sanitizedText.length > 60) {
    sanitizedText = sanitizedText.slice(0, 60);
  }

  return sanitizedText;
}

export function convertTextToDisplayTime(text) {
  let sanitizedText = text.replace(/[^0-9]/g, '.');

  const parts = sanitizedText.split('.');

  if (parts.length === 2) {
    sanitizedText = parts[0] + '.' + parts[1].slice(0, 2);
  }

  if (parts.length > 2) {
    sanitizedText = parts[0] + '.' + parts.slice(1).join('');
  }

  if (sanitizedText.length === 3 && !sanitizedText.includes('.')) {
    sanitizedText = sanitizedText.slice(0, 2) + '.' + sanitizedText.slice(2);
  }

  if (sanitizedText.length > 5) {
    sanitizedText = sanitizedText.slice(0, 5);
  }

  const dotIndex = sanitizedText.indexOf('.');
  if (dotIndex !== -1 && sanitizedText.length > dotIndex + 3) {
    sanitizedText = sanitizedText.slice(0, dotIndex + 3);
  }

  return sanitizedText;
}

export function convertDisplayTimeToTime(time, clockFormat, timeMode) {
  let formattedTime = time.replace(/[^\d]/g, ':');

  if (formattedTime.slice(-1) === ':') {
    formattedTime = formattedTime + '00';
  }
  if (/:\d$/.test(formattedTime)) {
    formattedTime = formattedTime + '0';
  }
  if (formattedTime.length === 1 || formattedTime.length === 2) {
    formattedTime = formattedTime + ':00';
  }

  if (clockFormat === '12h' && formattedTime.length > 0) {
    let [hours, minutes] = formattedTime.split(':');
    hours = parseInt(hours, 10);

    if (timeMode === 'PM' && hours < 12) {
      formattedTime = `${hours + 12}:${minutes}`;
    }
    if (timeMode === 'AM' && hours === 12) {
      formattedTime = `00:${minutes}`;
    }
    if (timeMode === 'AM' && hours > 12) {
      formattedTime = `${hours - 12}:${minutes}`;
    }
  }

  if (formattedTime.length === 4) {
    formattedTime = '0' + formattedTime;
  }

  return formattedTime;
}

export function display12HourFormat(time, clockFormat) {
  if (time) {
    if (clockFormat === '12h') {
      const [hours, minutes] = time.split(':').map(Number);
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes < 10 ? '0' : ''}${minutes}`;
    } else {
      return time;
    }
  }
}

export function convertTo12HourFormat(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'pm' : 'am';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes < 10 ? '0' : ''}${minutes} ${suffix}`;
}

export function getMarkedDates(items, when) {
  const marked = {};

  items.forEach(item => {
    if (item.when === when) {
      marked[item.when] = {
        selected: true,
        selectedColor: COLORS.background,
        selectedTextColor: COLORS.secondary,
      };
    } else {
      marked[item.when] = {
        selected: true,
        selectedColor: COLORS.background,
        selectedTextColor: COLORS.text,
      };
    }
  });

  if (when) {
    marked[when] = {
      selected: true,
      selectedColor: COLORS.background,
      selectedTextColor: COLORS.secondary,
    };
  }

  if (!marked[when]) {
    marked[when] = {
      selected: true,
      selectedColor: COLORS.background,
      selectedTextColor: COLORS.secondary,
    };
  }
  return marked;
}

export function convertToISO(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function renderViewIcon(name, focused) {
  let iconColor;

  if (focused === false) {
    iconColor = COLORS.primary;
  } else {
    iconColor = COLORS.secondary;
  }

  switch (name) {
    case 'home':
      icon = faClock;
      break;
    case 'weights':
      icon = faWeight;
      break;
    case 'costs':
      icon = faCoins;
      break;
    case 'budgets':
      icon = faWallet;
      break;
    case 'plans':
      icon = faCalendar;
      break;
    case 'habits':
      icon = faInfinity;
      break;
    case 'tasks':
      icon = faList;
      break;
    case 'settings':
      icon = faCog;
      break;
  }

  return (
    <FontAwesomeIcon icon={icon} style={[styles.icon, {color: iconColor}]} />
  );
}

export function renderControlIcon(type, shape) {
  let iconColor;

  if (shape === 'shadow') {
    iconColor = COLORS.primary;
  } else {
    iconColor = COLORS.background;
  }

  switch (type) {
    case 'cancel':
      icon = faTimes;
      break;
    case 'delete':
      icon = faMinus;
      break;
    case 'accept':
      icon = faCheck;
      break;
    case 'add':
      icon = faPlus;
      break;
    case 'back':
      icon = faChevronLeft;
      break;
    case 'meals':
      icon = faUtensils;
      break;
    case 'budget':
      icon = faWallet;
      break;
    case 'habits':
      icon = faInfinity;
      break;
    case 'shop':
      icon = faBasketShopping;
      break;
    case 'contact':
      icon = faCommentDots;
      break;
    case 'income':
      icon = faMugHot;
      break;
    case 'finish':
      icon = faCalendarCheck;
      break;
  }

  return (
    <FontAwesomeIcon icon={icon} style={[styles.icon, {color: iconColor}]} />
  );
}

export function renderArrow(direction) {
  let icon;

  switch (direction) {
    case 'left':
      icon = faChevronLeft;
      break;
    case 'right':
      icon = faChevronRight;
      break;
    case 'up':
      icon = faChevronUp;
      break;
    case 'down':
      icon = faChevronDown;
      break;
    case 'minus':
      icon = faMinus;
      break;
    case 'plus':
      icon = faPlus;
      break;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      style={[styles.icon, {color: COLORS.primary}]}
    />
  );
}

export function renderCheck(check) {
  let icon;

  switch (check) {
    case true:
      icon = faCircleCheck;
      break;
    case false:
      icon = faCircle;
      break;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      style={[styles.icon, {color: COLORS.primary}]}
    />
  );
}

export const convertRealmObjects = realmObjects => {
  return realmObjects.map(obj => ({
    ...obj,
    when: obj.when instanceof Date ? formatDate(obj.when) : obj.when,
  }));
};

export const isDaily = currentItem => {
  const days = [
    currentItem.monday,
    currentItem.tuesday,
    currentItem.wednesday,
    currentItem.thursday,
    currentItem.friday,
    currentItem.saturday,
    currentItem.sunday,
  ];

  return days.every(day => day === true);
};

export const isNever = currentItem => {
  const days = [
    currentItem.monday,
    currentItem.tuesday,
    currentItem.wednesday,
    currentItem.thursday,
    currentItem.friday,
    currentItem.saturday,
    currentItem.sunday,
  ];

  return days.every(day => day === false);
};
