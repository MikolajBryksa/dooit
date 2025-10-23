import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCog, faList, faClock} from '@fortawesome/free-solid-svg-icons';
import realm from '@/storage/schemas';
import {dayMap} from '@/constants';

export function getNextId(itemName) {
  // Retrieves the next available ID for a given item type from the database
  // If no items exist, it returns 1

  const lastItem = realm.objects(itemName).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
}

export function hourToSec(hourString) {
  // Converts a time string (HH:MM) into seconds

  const [h, m] = hourString.split(':').map(Number);
  return h * 3600 + m * 60;
}

export function timeStringToSeconds(timeString) {
  // Converts a time string (HH:MM:SS, MM:SS, or SS) into seconds

  const parts = timeString.split(':').map(Number);

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    const [seconds] = parts;
    return seconds;
  }
}

export function getFormattedTime(hour12 = false, withSeconds = false) {
  // Returns the current time as a formatted string
  // Optionally in 12-hour format and with seconds

  const now = new Date();
  return now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: withSeconds ? '2-digit' : undefined,
    hour12: hour12,
  });
}

export function formatHourString(hour, clockFormat = '24 h') {
  // Converts a 24-hour time string to a 12-hour format with AM/PM

  if (clockFormat === '12 h') {
    const [h, m] = hour.split(':');
    let hNum = parseInt(h, 10);
    let period = hNum < 12 ? 'AM' : 'PM';
    let h12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${h12}:${m || '00'} ${period}`;
  }
  return hour;
}

export function addHour(list, hour) {
  return Array.from(new Set([...(list || []), hour]));
}

export function renderIcon(name, color, size) {
  // Renders a FontAwesome icon based on the provided name, color, and size

  switch (name) {
    case 'home':
      icon = faClock;
      break;
    case 'habits':
      icon = faList;
      break;
    case 'settings':
      icon = faCog;
      break;
  }

  return <FontAwesomeIcon icon={icon} color={color} size={size} />;
}

export function hexToRgba(hex, opacity) {
  // Converts a HEX color code to an RGBA color string

  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getTodayKey() {
  // Returns the current day's key
  const jsDay = new Date().getDay();
  return dayMap[jsDay];
}

export function getLocalDateKey(day = new Date()) {
  // Returns the current day's date
  const y = day.getFullYear();
  const m = String(day.getMonth() + 1).padStart(2, '0');
  const d = String(day.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dateToWeekday(dateKey) {
  // Converts a date (YYYY-MM-DD) into a weekday key
  const [y, m, d] = dateKey.split('-');
  const dow = new Date(+y, +m - 1, +d).getDay();
  return dayMap[dow];
}

let lastPickedMessages = {
  notification: '',
  good: '',
  bad: '',
  skip: '',
  end: '',
};

export function pickRandomMotivation(translationFunction, category) {
  // Gets a random motivation message from translation that's different from the last one
  const messagesArray = translationFunction(`motivation.${category}`, {
    returnObjects: true,
  });
  const lastMessage = lastPickedMessages[category];
  const messagesToPickFrom = messagesArray.filter(msg => msg !== lastMessage);
  const randomIndex = Math.floor(Math.random() * messagesToPickFrom.length);
  const selectedMessage = messagesToPickFrom[randomIndex];
  lastPickedMessages[category] = selectedMessage;
  return selectedMessage;
}

export function generateDailySummary(habits, t) {
  // Generates a daily summary based on today's habits performance
  if (!habits || habits.length === 0) {
    return t('summary.no-habits');
  }

  const todayKey = getLocalDateKey();
  const weekdayKey = dateToWeekday(todayKey);

  // Filter today's active habits
  const todayHabits = habits.filter(
    habit => habit.available && habit.repeatDays.includes(weekdayKey),
  );

  if (todayHabits.length === 0) {
    return t('summary.no-habits-today');
  }

  // Calculate statistics
  let totalActions = 0;
  let goodActions = 0;
  let badActions = 0;
  let skipActions = 0;
  let bestHabit = null;
  let worstHabit = null;
  let maxSuccessRate = -1;
  let minSuccessRate = 101;
  let habitsWithData = 0;

  todayHabits.forEach(habit => {
    const total = habit.goodCounter + habit.badCounter + habit.skipCounter;
    if (total === 0) return;

    habitsWithData++;
    const successRate = (habit.goodCounter / total) * 100;
    
    totalActions += total;
    goodActions += habit.goodCounter;
    badActions += habit.badCounter;
    skipActions += habit.skipCounter;

    if (successRate > maxSuccessRate && habit.goodCounter > 0) {
      maxSuccessRate = successRate;
      bestHabit = habit;
    }

    if (successRate < minSuccessRate && (habit.badCounter > 0 || habit.skipCounter > 0)) {
      minSuccessRate = successRate;
      worstHabit = habit;
    }
  });

  // If habits exist but none have any actions yet
  if (totalActions === 0 || habitsWithData === 0) {
    return t('summary.no-actions-yet');
  }

  const goodRate = goodActions / totalActions;
  const badRate = badActions / totalActions;

  // Build summary sentences
  const sentences = [];

  // Opening sentence based on overall performance
  if (goodRate >= 0.8) {
    sentences.push(t('summary.excellent-day', {count: goodActions}));
  } else if (goodRate >= 0.6) {
    sentences.push(t('summary.great-day', {count: goodActions}));
  } else if (goodRate >= 0.4) {
    sentences.push(t('summary.good-day', {count: goodActions}));
  } else if (goodRate >= 0.2) {
    sentences.push(t('summary.mixed-day', {count: goodActions}));
  } else {
    sentences.push(t('summary.tough-day'));
  }

  // Best habit highlight
  if (bestHabit && maxSuccessRate >= 70) {
    sentences.push(
      t('summary.best-habit', {
        habit: bestHabit.habitName,
        rate: Math.round(maxSuccessRate),
      }),
    );
  }

  // Progress acknowledgment
  if (goodActions > badActions * 2) {
    sentences.push(t('summary.strong-progress'));
  } else if (goodActions > badActions) {
    sentences.push(t('summary.positive-progress'));
  }

  // Area to improve
  if (worstHabit && badRate > 0.3) {
    sentences.push(
      t('summary.improve-habit', {habit: worstHabit.habitName}),
    );
  } else if (skipActions > goodActions * 0.5) {
    sentences.push(t('summary.reduce-skips'));
  }

  // Closing encouragement
  if (goodRate >= 0.6) {
    sentences.push(t('summary.keep-momentum'));
  } else {
    sentences.push(t('summary.tomorrow-better'));
  }

  return sentences.join(' ');
}
