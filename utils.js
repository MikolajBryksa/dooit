import React from 'react';
import {COLORS, styles} from './styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

export function formatToFloat(text, modalName) {
  if (modalName === 'cost' || modalName === 'weight') {
    const formattedText = text.replace(',', '.');
    const floatRegex = /^(\d+)?([.]\d*)?$/;
    if (floatRegex.test(formattedText)) {
      const floatValue = parseFloat(formattedText);
      return isNaN(floatValue) ? text : parseFloat(floatValue.toFixed(2));
    }
  } else {
    return text;
  }
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

export function convertToISO(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
