import realm from '../storage/schemas';
import {getNextId, getDayOfWeek} from '../utils';
import {getProgressByHabitIdAndDate} from './progress.service';

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

export const getCurrentHabit = (currentTime, selectedDay) => {
  const habits = realm.objects('Habit').sorted('habitStart');

  if (!habits || habits.length === 0) {
    return null;
  }

  const days = getDayOfWeek(selectedDay);

  const filteredHabits = habits.filter(habit => {
    const repeatDaysArray = habit.repeatDays ? habit.repeatDays : [];
    return days.some(day => repeatDaysArray.includes(day));
  });

  if (filteredHabits.length === 0) {
    return null;
  }

  for (let i = 0; i < filteredHabits.length; i++) {
    const habit = filteredHabits[i];
    const nextHabit = filteredHabits[i + 1];

    if (
      currentTime >= habit.habitStart &&
      (!nextHabit || currentTime < nextHabit.habitStart)
    ) {
      const progress = getProgressByHabitIdAndDate(habit.id, selectedDay);

      return {
        ...habit.toJSON(),
        progress: progress ? [progress] : [],
      };
    }
  }

  return null;
};
