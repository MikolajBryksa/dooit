import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faChartPie,
  faList,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import realm from '@/storage/schemas';
import {getProgressByHabitId} from '@/services/progress.service';

export function formatSecondsToHHMMSS(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedHrs = hrs > 0 ? `${hrs.toString().padStart(2, '0')}:` : '';
  const formattedMins = `${mins.toString().padStart(2, '0')}:`;
  const formattedSecs = secs.toString().padStart(2, '0');

  return `${formattedHrs}${formattedMins}${formattedSecs}`;
}

export function formatSecondsToMM(seconds) {
  const mins = Math.floor(seconds / 60);
  return mins;
}

export function timeStringToSeconds(timeString) {
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

export function formatDateToYYMMDD(when) {
  const today = when ? new Date(when) : new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const localToday = `${year}-${month}-${day}`;
  return localToday;
}

export function getFormattedTime(hour12 = false) {
  const now = new Date();
  return now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: hour12,
  });
}

export function getNextId(itemName) {
  const lastItem = realm.objects(itemName).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
}

export function renderIcon(name, color, size) {
  switch (name) {
    case 'home':
      icon = faClock;
      break;
    case 'habits':
      icon = faList;
      break;
    case 'stats':
      icon = faChartPie;
      break;
    case 'settings':
      icon = faCog;
      break;
  }

  return <FontAwesomeIcon icon={icon} color={color} size={size} />;
}

export function getRepeatDaysString(repeatDays, t) {
  const dayNames = {
    mon: t('date.mon'),
    tue: t('date.tue'),
    wed: t('date.wed'),
    thu: t('date.thu'),
    fri: t('date.fri'),
    sat: t('date.sat'),
    sun: t('date.sun'),
  };

  if (typeof repeatDays === 'string') {
    repeatDays = JSON.parse(repeatDays);
  }

  const selectedDays = repeatDays
    .map(day => dayNames[day])
    .filter(day => day !== undefined);

  if (selectedDays.length === 7) {
    return t('date.daily');
  }

  if (
    repeatDays.includes('sat') &&
    repeatDays.includes('sun') &&
    selectedDays.length === 2
  ) {
    return t('date.weekend');
  }

  if (
    !repeatDays.includes('sat') &&
    !repeatDays.includes('sun') &&
    selectedDays.length === 5
  ) {
    return t('date.workdays');
  }

  return selectedDays.join(', ');
}

export function hexToRgba(hex, opacity) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getDayOfWeek(date) {
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const days = [daysOfWeek[new Date(date).getDay()]];
  return days;
}

export function addProgressToHabits(habits) {
  if (!habits || habits.length === 0) {
    return [];
  }

  return habits.map(habit => {
    const progressData = getProgressByHabitId(habit.id);
    const progress = progressData
      ? progressData.map(p => ({
          ...p,
          date: p.date ? p.date.toISOString() : null,
        }))
      : undefined;

    const serializableRepeatDays = habit.repeatDays
      ? JSON.stringify(habit.repeatDays)
      : '[]';

    return {
      ...habit,
      ...(progress !== undefined && {progress}),
      repeatDays: serializableRepeatDays,
    };
  });
}

export function getHabitsByDays(habits, days) {
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  if (!days) days = daysOfWeek;

  const filtered = habits.filter(habit => {
    const repeatDaysArray = habit.repeatDays
      ? JSON.parse(habit.repeatDays)
      : [];
    return days.some(day => repeatDaysArray.includes(day));
  });
  return filtered;
}

export function getHabitsByDay(habits, selectedDay) {
  const date = new Date(selectedDay);
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const day = daysOfWeek[date.getDay()];

  return habits.filter(habit => {
    const repeatDaysArray = habit.repeatDays
      ? JSON.parse(habit.repeatDays)
      : [];
    return repeatDaysArray.includes(day);
  });
}
