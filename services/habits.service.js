import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addHabit = (
  habitName,
  firstStep,
  goalDesc,
  motivation,
  repeatDays,
  habitStart,
  progressType,
  progressUnit,
  targetScore,
) => {
  const id = getNextId('Habit');

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      habitName,
      firstStep,
      goalDesc,
      motivation,
      repeatDays,
      habitStart,
      progressType,
      progressUnit,
      targetScore,
    });
  });
  return newHabit;
};

export const updateHabit = (
  id,
  habitName,
  firstStep,
  goalDesc,
  motivation,
  repeatDays,
  habitStart,
  progressType,
  progressUnit,
  targetScore,
) => {
  let updatedHabit;
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);

    updatedHabit = realm.create(
      'Habit',
      {
        id,
        habitName,
        firstStep,
        goalDesc,
        motivation,
        repeatDays: repeatDays !== undefined ? repeatDays : habit.repeatDays,
        habitStart,
        progressType,
        progressUnit,
        targetScore,
      },
      'modified',
    );
  });
  return updatedHabit;
};

export const deleteHabit = id => {
  let deletedHabit;
  realm.write(() => {
    const habitToDelete = realm.objectForPrimaryKey('Habit', id);
    if (habitToDelete) {
      deletedHabit = {...habitToDelete};
      realm.delete(habitToDelete);
    }
  });
  return deletedHabit;
};

export const getEveryHabit = () => {
  return realm.objects('Habit').sorted('habitStart');
};

export const getHabitById = id => {
  return realm.objectForPrimaryKey('Habit', id);
};
