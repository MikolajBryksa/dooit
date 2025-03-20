import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addProgress = (
  habitId,
  date,
  progressAmount,
  progressValue,
  progressTime,
  checked,
) => {
  const id = getNextId('Progress');

  let newProgress;
  realm.write(() => {
    newProgress = realm.create('Progress', {
      id,
      habitId,
      date,
      progressAmount,
      progressValue,
      progressTime,
      checked,
    });
  });
  return newProgress;
};

export const getProgressByHabitId = habitId => {
  const results = realm
    .objects('Progress')
    .filtered('habitId == $0', habitId)
    .sorted('date', true);
  return results;
};

export const getProgressById = id => {
  const progress = realm.objectForPrimaryKey('Progress', id);
  if (!progress) return null;

  return {
    ...progress,
    id: progress.id.toString(),
  };
};

export const updateProgress = (
  id,
  habitId,
  date,
  progressAmount,
  progressValue,
  progressTime,
  checked,
) => {
  let updatedProgress;
  realm.write(() => {
    const progress = realm.objectForPrimaryKey('Progress', id);

    updatedProgress = realm.create(
      'Progress',
      {
        id,
        habitId,
        date,
        progressAmount,
        progressValue,
        progressTime,
        checked,
      },
      'modified',
    );
  });
  return updatedProgress;
};

export const deleteProgress = id => {
  let deletedProgress;
  realm.write(() => {
    const progressToDelete = realm.objectForPrimaryKey('Progress', id);
    if (progressToDelete) {
      deletedProgress = {...progressToDelete};
      realm.delete(progressToDelete);
    }
  });
  return deletedProgress;
};

export const deleteProgressByHabitId = habitId => {
  realm.write(() => {
    const progressToDelete = realm
      .objects('Progress')
      .filtered('habitId == $0', habitId);
    if (progressToDelete.length > 0) {
      realm.delete(progressToDelete);
    }
  });
};

export const getTodayProgress = selectedDay => {
  const results = realm
    .objects('Progress')
    .filtered('date == $0', selectedDay)
    .sorted('habitId');
  return results;
};

export const updateOrCreateProgress = (
  habitId,
  date,
  amount = null,
  value = null,
  time = null,
  checked = null,
) => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  const existingProgress = realm
    .objects('Progress')
    .filtered('habitId == $0 AND date == $1', habitId, parsedDate)[0];

  if (existingProgress) {
    updateProgress(
      existingProgress.id,
      habitId,
      parsedDate,
      amount !== null ? amount : null,
      value !== null ? value : null,
      time !== null ? time : null,
      checked !== null ? checked : existingProgress.checked,
    );
  } else {
    addProgress(habitId, parsedDate, amount, value, time, checked);
  }
};
