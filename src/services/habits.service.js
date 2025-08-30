import realm from '@/storage/schemas';
import {getNextId} from '@/utils';
import i18next from 'i18next';
import {habitIcons} from '@/constants';

export const addHabit = (
  habitName,
  habitEnemy,
  repeatDays,
  repeatHours,
  icon,
) => {
  const id = getNextId('Habit');

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      habitName,
      habitEnemy,
      goodCounter: 0,
      badCounter: 0,
      skipCounter: 0,
      repeatDays,
      repeatHours,
      completedHours: [],
      available: true,
      icon: icon || 'infinity',
    });
  });
  return newHabit;
};

export const updateHabit = (id, updates) => {
  let updatedHabit;
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);
    if (!habit) return null;

    updatedHabit = realm.create(
      'Habit',
      {
        id,
        habitName: updates.habitName ?? habit.habitName,
        habitEnemy: updates.habitEnemy ?? habit.habitEnemy,
        goodCounter: updates.goodCounter ?? habit.goodCounter,
        badCounter: updates.badCounter ?? habit.badCounter,
        skipCounter: updates.skipCounter ?? habit.skipCounter,
        repeatDays: updates.repeatDays ?? Array.from(habit.repeatDays),
        repeatHours: updates.repeatHours ?? Array.from(habit.repeatHours),
        completedHours:
          updates.completedHours ?? Array.from(habit.completedHours || []),
        available: updates.available ?? habit.available,
        icon: updates.icon ?? habit.icon,
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

  const habitsArr = Array.from(realmHabits).map(habit => ({
    id: habit.id,
    habitName: habit.habitName,
    habitEnemy: habit.habitEnemy,
    goodCounter: habit.goodCounter,
    badCounter: habit.badCounter,
    skipCounter: habit.skipCounter,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    completedHours: Array.from(habit.completedHours || []),
    available: habit.available,
    icon: habit.icon,
  }));

  habitsArr.sort((a, b) => {
    if (a.available !== b.available) {
      return a.available ? -1 : 1;
    }
    const aFirstHour =
      Array.isArray(a.repeatHours) &&
      a.repeatHours.length > 0 &&
      a.repeatHours[0];
    const bFirstHour =
      Array.isArray(b.repeatHours) &&
      b.repeatHours.length > 0 &&
      b.repeatHours[0];
    return aFirstHour.localeCompare(bFirstHour);
  });

  return habitsArr;
};

export const getHabitById = id => {
  const habit = realm.objectForPrimaryKey('Habit', id);
  if (!habit) return null;

  return {
    id: habit.id,
    habitName: habit.habitName,
    habitEnemy: habit.habitEnemy,
    goodCounter: habit.goodCounter,
    badCounter: habit.badCounter,
    skipCounter: habit.skipCounter,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    available: habit.available,
    icon: habit.icon,
  };
};

export const createDefaultHabits = () => {
  const t = i18next.t;
  const defaultHabitsData = [
    {
      habitName: t('default-habits.1.habitName'),
      habitEnemy: t('default-habits.1.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:00'],
      icon: habitIcons[0],
    },
    {
      habitName: t('default-habits.2.habitName'),
      habitEnemy: t('default-habits.2.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      repeatHours: ['08:00', '10:00', '12:00', '14:00', '18:00', '20:30'],
      icon: habitIcons[1],
    },
    {
      habitName: t('default-habits.3.habitName'),
      habitEnemy: t('default-habits.3.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['17:30'],
      icon: habitIcons[2],
    },
    {
      habitName: t('default-habits.4.habitName'),
      habitEnemy: t('default-habits.4.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:30', '13:00', '18:30'],
      icon: habitIcons[3],
    },
    {
      habitName: t('default-habits.5.habitName'),
      habitEnemy: t('default-habits.5.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:00'],
      icon: habitIcons[4],
    },
    {
      habitName: t('default-habits.6.habitName'),
      habitEnemy: t('default-habits.6.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['09:00'],
      icon: habitIcons[5],
    },
    {
      habitName: t('default-habits.7.habitName'),
      habitEnemy: t('default-habits.7.habitEnemy'),
      repeatDays: ['tue', 'thu'],
      repeatHours: ['19:30'],
      icon: habitIcons[6],
    },
    {
      habitName: t('default-habits.8.habitName'),
      habitEnemy: t('default-habits.8.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['21:30'],
      icon: habitIcons[7],
    },
    {
      habitName: t('default-habits.9.habitName'),
      habitEnemy: t('default-habits.9.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['21:00'],
      icon: habitIcons[8],
    },
    {
      habitName: t('default-habits.10.habitName'),
      habitEnemy: t('default-habits.10.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:30'],
      icon: habitIcons[9],
    },
  ];

  const createdHabits = [];

  defaultHabitsData.forEach(habitData => {
    const newHabit = addHabit(
      habitData.habitName,
      habitData.habitEnemy,
      habitData.repeatDays,
      habitData.repeatHours,
      habitData.icon,
    );
    createdHabits.push(newHabit);
  });

  return createdHabits;
};

export const resetCompletedHoursForAllHabits = () => {
  let affected = 0;
  realm.write(() => {
    const habits = realm.objects('Habit');
    habits.forEach(habit => {
      if (habit.completedHours && habit.completedHours.length > 0) {
        habit.completedHours.splice(0, habit.completedHours.length);
        affected += 1;
      }
    });
  });
  return affected;
};
