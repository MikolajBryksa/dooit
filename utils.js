import React from 'react';
import {COLORS, styles} from './styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
  faClock,
  faPlay,
  faCoins,
  faCalendar,
  faList,
  faWeight,
  faCog,
  faCircleCheck,
  faPlus,
  faCheck,
  faMinus,
  faStop,
  faTimes,
  faBasketShopping,
  faTrashCan,
  faMugHot,
} from '@fortawesome/free-solid-svg-icons';
import {faCircle} from '@fortawesome/free-regular-svg-icons';
import realm from './storage/schemas';

export function getNextId(itemName) {
  const lastItem = realm.objects(itemName).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
}
export function formatDateWithDay(when) {
  if (when.length < 3) {
    return '';
  }
  const date = new Date(when);

  const dayOfWeek = date.toLocaleDateString('en-US', {weekday: 'long'});
  const month = date.toLocaleDateString('en-US', {month: '2-digit'});
  const day = date.toLocaleDateString('en-US', {day: '2-digit'});

  return `${day}.${month} ${dayOfWeek}`;
}

export function convertTimeToObject(time) {
  if (!time) return {hours: 0, minutes: 0};
  const [hours, minutes] = time.split(':').map(Number);
  return {hours, minutes};
}

export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getMarkedDates(items, when) {
  const marked = {};

  items.forEach(item => {
    if (item.when === when) {
      marked[item.when] = {
        selected: true,
        selectedColor: COLORS.background,
        selectedTextColor: COLORS.text,
      };
    } else {
      marked[item.when] = {
        selected: true,
        selectedColor: COLORS.background,
        selectedTextColor: COLORS.secondary,
      };
    }
  });

  if (when) {
    marked[when] = {
      selected: true,
      selectedColor: COLORS.background,
      selectedTextColor: COLORS.text,
    };
  }

  if (!marked[when]) {
    marked[when] = {
      selected: true,
      selectedColor: COLORS.background,
      selectedTextColor: COLORS.text,
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

  if (focused === true) {
    iconColor = COLORS.text;
  } else if (focused === false) {
    iconColor = COLORS.primary;
  } else {
    iconColor = COLORS.secondary;
  }

  switch (name) {
    case 'habits':
      icon = faClock;
      break;
    case 'weights':
      icon = faWeight;
      break;
    case 'costs':
      icon = faCoins;
      break;
    case 'plans':
      icon = faCalendar;
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

export function renderControlIcon(type) {
  let icon;

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
    case 'play':
      icon = faPlay;
      break;
    case 'stop':
      icon = faStop;
      break;
    case 'item':
      icon = faBasketShopping;
      break;
    case 'reset':
      icon = faTrashCan;
      break;
    case 'support':
      icon = faMugHot;
      break;
  }

  return (
    <FontAwesomeIcon
      icon={icon}
      style={[styles.icon, {color: COLORS.background}]}
    />
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
