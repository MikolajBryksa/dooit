import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCog, faList, faClock} from '@fortawesome/free-solid-svg-icons';
import realm from '@/storage/schemas';

export function getNextId(itemName) {
  // Retrieves the next available ID for a given item type from the database
  // If no items exist, it returns 1

  const lastItem = realm.objects(itemName).sorted('id', true)[0];
  return lastItem ? lastItem.id + 1 : 1;
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

export function formatHourString(hour, clockFormat = '24h') {
  // Converts a 24-hour time string to a 12-hour format with AM/PM

  if (clockFormat === '12h') {
    const [h, m] = hour.split(':');
    let hNum = parseInt(h, 10);
    let period = hNum < 12 ? 'AM' : 'PM';
    let h12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${h12}:${m || '00'} ${period}`;
  }
  return hour;
}

export function calculateEndTime(startTime, durationInMinutes) {
  // Calculates the end time by adding a duration (in MM) to a given start time (in HH:MM)
  // Returns the result as a string in HH:MM:SS

  if (!startTime || !durationInMinutes) return null;

  const [hour, minute] = startTime.split(':').map(Number);
  const durationInSeconds = Number(durationInMinutes) * 60;
  const totalSeconds = hour * 3600 + minute * 60 + durationInSeconds;

  const endHour = Math.floor(totalSeconds / 3600);
  const endMinute = Math.floor((totalSeconds % 3600) / 60);
  const endSecond = totalSeconds % 60;

  return `${endHour.toString().padStart(2, '0')}:${endMinute
    .toString()
    .padStart(2, '0')}:${endSecond.toString().padStart(2, '0')}`;
}

export function calculateProgress(currentTime, endTime, durationInMinutes) {
  // Calculates the progress of a task based on the current time, end time, and duration
  // Returns an object with the progress (0 to 1) and a boolean indicating if the task is finished

  if (!endTime || !currentTime) return {progress: 0, isFinished: false};

  const currentTimeInSeconds = timeStringToSeconds(currentTime);
  const endTimeInSeconds = timeStringToSeconds(endTime);

  const durationInSeconds = Number(durationInMinutes) * 60;
  const startTimeInSeconds = endTimeInSeconds - durationInSeconds;

  const elapsedTime = currentTimeInSeconds - startTimeInSeconds;
  const progress = Math.min(Math.max(elapsedTime / durationInSeconds, 0), 1);

  const isFinished = currentTimeInSeconds >= endTimeInSeconds;

  return {
    progress,
    isFinished,
  };
}

export function calculateTimeLeft(currentTime, endTime) {
  // Calculates the remaining time between the current time and the end time
  // Returns the result as a string in MM:SS

  if (!endTime || !currentTime) return '0:00';

  const currentTimeInSeconds = timeStringToSeconds(currentTime);
  const endTimeInSeconds = timeStringToSeconds(endTime);

  const timeLeftSeconds = Math.max(0, endTimeInSeconds - currentTimeInSeconds);
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = Math.floor(timeLeftSeconds % 60);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
