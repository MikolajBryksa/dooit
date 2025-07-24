import realm from '@/storage/schemas';
import {getNextId} from '@/utils';
import i18next from 'i18next';

export const addHabit = (
  habitName,
  goodChoice,
  badChoice,
  repeatDays,
  repeatHours,
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
      level: 1,
      currentStreak: 0,
      desc: '',
      message: '',
      repeatDays,
      repeatHours,
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
  currentStreak,
  desc,
  message,
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
        currentStreak,
        desc,
        message,
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
  const realmHabits = realm.objects('Habit').sorted('habitName');
  return Array.from(realmHabits).map(habit => ({
    id: habit.id,
    habitName: habit.habitName,
    goodChoice: habit.goodChoice,
    badChoice: habit.badChoice,
    score: habit.score,
    level: habit.level,
    currentStreak: habit.currentStreak,
    desc: habit.desc,
    message: habit.message,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
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
    currentStreak: habit.currentStreak,
    desc: habit.desc,
    message: habit.message,
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
      repeatHours: ['06:30'],
    },
    {
      habitName: t('default-habits.2.habitName'),
      goodChoice: t('default-habits.2.goodChoice'),
      badChoice: t('default-habits.2.badChoice'),
      repeatHours: ['08:00', '12:00', '14:00', '18:00'],
    },
    {
      habitName: t('default-habits.3.habitName'),
      goodChoice: t('default-habits.3.goodChoice'),
      badChoice: t('default-habits.3.badChoice'),
      repeatHours: ['07:00', '17:30'],
    },
    {
      habitName: t('default-habits.4.habitName'),
      goodChoice: t('default-habits.4.goodChoice'),
      badChoice: t('default-habits.4.badChoice'),
      repeatHours: ['07:30', '13:00', '17:00'],
    },
    {
      habitName: t('default-habits.5.habitName'),
      goodChoice: t('default-habits.5.goodChoice'),
      badChoice: t('default-habits.5.badChoice'),
      repeatHours: ['20:00'],
    },
    {
      habitName: t('default-habits.6.habitName'),
      goodChoice: t('default-habits.6.goodChoice'),
      badChoice: t('default-habits.6.badChoice'),
      repeatHours: ['11:00'],
    },
    {
      habitName: t('default-habits.7.habitName'),
      goodChoice: t('default-habits.7.goodChoice'),
      badChoice: t('default-habits.7.badChoice'),
      repeatHours: ['20:30'],
    },
    {
      habitName: t('default-habits.8.habitName'),
      goodChoice: t('default-habits.8.goodChoice'),
      badChoice: t('default-habits.8.badChoice'),
      repeatHours: ['21:00'],
    },
  ];

  const createdHabits = [];

  defaultHabitsData.forEach(habitData => {
    const newHabit = addHabit(
      habitData.habitName,
      habitData.goodChoice,
      habitData.badChoice,
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      habitData.repeatHours,
    );
    createdHabits.push(newHabit);
  });

  return createdHabits;
};
