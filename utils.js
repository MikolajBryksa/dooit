import {COLORS, styles} from './styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

export function formatToFloat(text) {
  const formattedText = text.replace(',', '.');
  const floatRegex = /^(\d+)?([.]\d*)?$/;
  if (floatRegex.test(formattedText)) {
    const floatValue = parseFloat(formattedText);
    return parseFloat(floatValue.toFixed(2));
  }
  return NaN;
}

export function formatDateWithDay(when) {
  if (when.length < 3) return when;
  const date = new Date(when);

  const dayOfWeek = date.toLocaleDateString('en-US', {weekday: 'long'});
  const month = date.toLocaleDateString('en-US', {month: '2-digit'});
  const day = date.toLocaleDateString('en-US', {day: '2-digit'});

  return `${day}.${month} ${dayOfWeek}`;
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
