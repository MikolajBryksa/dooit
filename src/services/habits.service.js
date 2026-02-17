import realm from '@/storage/schemas';
import {getNextId, hourToSec} from '@/utils';
import i18next from 'i18next';
import {habitIcons} from '@/constants';
import {deleteExecutions, hasExecution} from '@/services/executions.service';

export const addHabit = (
  habitName,
  repeatDays,
  repeatHours,
  icon,
  id = null,
) => {
  id = id || getNextId('Habit');

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      habitName,
      goodCounter: 0,
      badCounter: 0,
      repeatDays,
      repeatHours,
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
        goodCounter: updates.goodCounter ?? habit.goodCounter,
        badCounter: updates.badCounter ?? habit.badCounter,
        repeatDays: updates.repeatDays ?? Array.from(habit.repeatDays),
        repeatHours: updates.repeatHours ?? Array.from(habit.repeatHours),
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

  if (deletedHabit) {
    deleteExecutions(id);
  }

  return deletedHabit;
};

export const getHabits = () => {
  const realmHabits = realm.objects('Habit');

  const habitsArr = Array.from(realmHabits).map(habit => ({
    id: habit.id,
    habitName: habit.habitName,
    goodCounter: habit.goodCounter,
    badCounter: habit.badCounter,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    available: habit.available,
    icon: habit.icon,
  }));

  habitsArr.sort((a, b) => {
    const aFirstHour = a.repeatHours.length > 0 && a.repeatHours[0];
    const bFirstHour = b.repeatHours.length > 0 && b.repeatHours[0];
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
    goodCounter: habit.goodCounter,
    badCounter: habit.badCounter,
    repeatDays: Array.from(habit.repeatDays),
    repeatHours: Array.from(habit.repeatHours),
    available: habit.available,
    icon: habit.icon,
  };
};

export const getHabitValue = (id, key) => {
  const habit = getHabitById(id);
  return habit ? habit[key] : null;
};

export const updateHabitValue = (id, key, value) => {
  const updates = {[key]: value};
  return updateHabit(id, updates);
};

export const updateHabitValues = (id, updates) => {
  return updateHabit(id, updates);
};

export const createDefaultHabits = () => {
  const t = i18next.t;
  const defaultHabitsData = [
    {
      id: 1,
      habitName: t('default-habits.1.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      repeatHours: ['08:00', '10:00', '12:00', '14:00', '18:00', '20:30'],
      icon: habitIcons[0],
    },
    {
      id: 2,
      habitName: t('default-habits.2.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['17:30'],
      icon: habitIcons[1],
    },
    {
      id: 3,
      habitName: t('default-habits.3.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:30', '13:00', '18:30'],
      icon: habitIcons[2],
    },
    {
      id: 4,
      habitName: t('default-habits.4.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:00'],
      icon: habitIcons[3],
    },
    {
      id: 5,
      habitName: t('default-habits.5.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['09:00'],
      icon: habitIcons[4],
    },
    {
      id: 6,
      habitName: t('default-habits.6.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['21:30'],
      icon: habitIcons[5],
    },
    {
      id: 7,
      habitName: t('default-habits.7.habitName'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:30'],
      icon: habitIcons[6],
    },
  ];

  const createdHabits = [];

  defaultHabitsData.forEach(habit => {
    const newHabit = addHabit(
      habit.habitName,
      habit.repeatDays,
      habit.repeatHours,
      habit.icon,
      habit.id,
    );
    createdHabits.push(newHabit);
  });

  return createdHabits;
};

export const translateDefaultHabits = (oldLanguage, newLanguage) => {
  const defaultHabitIds = [1, 2, 3, 4, 5, 6, 7];

  const oldTranslations = {};
  const newTranslations = {};

  defaultHabitIds.forEach(id => {
    oldTranslations[id] = {
      habitName: i18next.t(`default-habits.${id}.habitName`, {
        lng: oldLanguage,
      }),
    };
    newTranslations[id] = {
      habitName: i18next.t(`default-habits.${id}.habitName`, {
        lng: newLanguage,
      }),
    };
  });

  let updatedCount = 0;

  realm.write(() => {
    const habits = realm.objects('Habit');

    habits.forEach(habit => {
      let needsUpdate = false;
      let newHabitName = habit.habitName;

      for (const id of defaultHabitIds) {
        const oldHabit = oldTranslations[id];

        if (habit.habitName === oldHabit.habitName) {
          newHabitName = newTranslations[id].habitName;
          needsUpdate = true;
          break;
        }
      }

      if (needsUpdate) {
        realm.create(
          'Habit',
          {
            id: habit.id,
            habitName: newHabitName,
            goodCounter: habit.goodCounter,
            badCounter: habit.badCounter,
            repeatDays: Array.from(habit.repeatDays),
            repeatHours: Array.from(habit.repeatHours),
            available: habit.available,
            icon: habit.icon,
          },
          'modified',
        );
        updatedCount++;
      }
    });
  });

  return updatedCount;
};

export const deleteUnavailableHabits = () => {
  const toDelete = realm.objects('Habit').filtered('available == false');
  const ids = Array.from(toDelete).map(h => h.id);

  if (ids.length === 0) return 0;

  realm.write(() => {
    realm.delete(toDelete);
  });

  ids.forEach(id => {
    deleteExecutions(id);
  });

  return ids.length;
};

export const getTodayHabits = (habits, weekdayKey) => {
  if (!habits || habits.length === 0) return [];

  const filteredHabits = habits.filter(
    habit => habit.available && habit.repeatDays.includes(weekdayKey),
  );

  const expandedHabits = filteredHabits.flatMap(habit =>
    habit.repeatHours.map((hour, idx) => ({
      key: `${habit.id}__${idx}__${hour}`,
      id: habit.id,
      habitName: habit.habitName,
      goodCounter: habit.goodCounter,
      badCounter: habit.badCounter,
      repeatDays: habit.repeatDays,
      repeatHours: habit.repeatHours,
      selectedHour: hour,
      icon: habit.icon,
    })),
  );

  expandedHabits.sort(
    (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
  );

  return expandedHabits;
};

export function selectActiveHabitKey(todayHabits, dateKey) {
  if (!todayHabits || todayHabits.length === 0) return null;

  const incomplete = todayHabits.filter(habit => {
    return !hasExecution(habit.id, dateKey, habit.selectedHour);
  });

  if (incomplete.length === 0) return null;

  incomplete.sort(
    (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
  );

  return incomplete[0].key;
}
