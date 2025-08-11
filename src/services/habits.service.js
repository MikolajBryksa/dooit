import realm from '@/storage/schemas';
import {getNextId} from '@/utils';
import i18next from 'i18next';

export const addHabit = (
  habitName,
  goodChoice,
  badChoice,
  repeatDays,
  repeatHours,
  duration,
) => {
  const id = getNextId('Habit');

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      habitName,
      goodChoice,
      badChoice,
      score: 0,
      level: 0,
      duration,
      repeatDays,
      repeatHours,
      completedHours: [],
      available: true,
    });
  });
  return newHabit;
};

export const updateHabit = (
  id,
  habitName,
  goodChoice,
  badChoice,
  score,
  level,
  duration,
  repeatDays,
  repeatHours,
  available,
) => {
  let updatedHabit;
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);

    updatedHabit = realm.create(
      'Habit',
      {
        id,
        habitName,
        goodChoice,
        badChoice,
        score,
        level,
        duration,
        repeatDays: repeatDays !== undefined ? repeatDays : habit.repeatDays,
        repeatHours,
        available,
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

export const getHabits = () => {
  const realmHabits = realm.objects('Habit');
  return Array.from(realmHabits).map(habit => ({
    id: habit.id,
    habitName: habit.habitName,
    goodChoice: habit.goodChoice,
    badChoice: habit.badChoice,
    score: habit.score,
    level: habit.level,
    duration: habit.duration,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    completedHours: Array.from(habit.completedHours || []),
    available: habit.available,
  }));
};

export const getHabitById = id => {
  const habit = realm.objectForPrimaryKey('Habit', id);
  if (!habit) return null;

  return {
    id: habit.id,
    habitName: habit.habitName,
    goodChoice: habit.goodChoice,
    badChoice: habit.badChoice,
    score: habit.score,
    level: habit.level,
    duration: habit.duration,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    available: habit.available,
  };
};

export const createDefaultHabits = () => {
  const t = i18next.t;
  const defaultHabitsData = [
    {
      habitName: t('default-habits.1.habitName'),
      goodChoice: t('default-habits.1.goodChoice'),
      badChoice: t('default-habits.1.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:00'],
      duration: 15,
    },
    {
      habitName: t('default-habits.2.habitName'),
      goodChoice: t('default-habits.2.goodChoice'),
      badChoice: t('default-habits.2.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      repeatHours: ['08:00', '10:00', '12:00', '14:00', '18:00', '20:30'],
      duration: 30,
    },
    {
      habitName: t('default-habits.3.habitName'),
      goodChoice: t('default-habits.3.goodChoice'),
      badChoice: t('default-habits.3.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['17:30'],
      duration: 45,
    },
    {
      habitName: t('default-habits.4.habitName'),
      goodChoice: t('default-habits.4.goodChoice'),
      badChoice: t('default-habits.4.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:30', '13:00', '18:30'],
      duration: 30,
    },
    {
      habitName: t('default-habits.5.habitName'),
      goodChoice: t('default-habits.5.goodChoice'),
      badChoice: t('default-habits.5.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:00'],
      duration: 30,
    },
    {
      habitName: t('default-habits.6.habitName'),
      goodChoice: t('default-habits.6.goodChoice'),
      badChoice: t('default-habits.6.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['09:00'],
      duration: 30,
    },
    {
      habitName: t('default-habits.7.habitName'),
      goodChoice: t('default-habits.7.goodChoice'),
      badChoice: t('default-habits.7.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['21:30'],
      duration: 30,
    },
    {
      habitName: t('default-habits.8.habitName'),
      goodChoice: t('default-habits.8.goodChoice'),
      badChoice: t('default-habits.8.badChoice'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['21:00'],
      duration: 20,
    },
  ];

  const createdHabits = [];

  defaultHabitsData.forEach(habitData => {
    const newHabit = addHabit(
      habitData.habitName,
      habitData.goodChoice,
      habitData.badChoice,
      habitData.repeatDays,
      habitData.repeatHours,
      habitData.duration,
    );
    createdHabits.push(newHabit);
  });

  return createdHabits;
};

export const resetDailyHabits = () => {
  const habits = realm.objects('Habit');

  realm.write(() => {
    habits.forEach(habit => {
      habit.completedHours = [];
      habit.score = 0;
    });
  });
};

export const markRepetitionCompleted = (habitId, hour) => {
  const habit = realm.objectForPrimaryKey('Habit', habitId);

  if (habit) {
    realm.write(() => {
      if (!habit.completedHours.includes(hour)) {
        habit.completedHours.push(hour);
      }
    });
  }
};

export const isRepetitionCompleted = (habitId, hour) => {
  const habit = realm.objectForPrimaryKey('Habit', habitId);

  if (habit) {
    return habit.completedHours.includes(hour);
  }
  return false;
};
