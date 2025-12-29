import realm from '@/storage/schemas';
import {getNextId, hourToSec, getLocalDateKey} from '@/utils';
import i18next from 'i18next';
import {habitIcons} from '@/constants';
import {MINUTES_FOR_HABIT} from '@/constants';
import {
  deleteHabitExecutions,
  hasExecution,
  recordHabitExecutionInTransaction,
} from '@/services/effectiveness.service';

export const addHabit = (
  habitName,
  habitEnemy,
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
      habitEnemy,
      goodCounter: 0,
      badCounter: 0,
      skipCounter: 0,
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
        habitEnemy: updates.habitEnemy ?? habit.habitEnemy,
        goodCounter: updates.goodCounter ?? habit.goodCounter,
        badCounter: updates.badCounter ?? habit.badCounter,
        skipCounter: updates.skipCounter ?? habit.skipCounter,
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
    deleteHabitExecutions(id);
  }

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
      habitEnemy: t('default-habits.1.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      repeatHours: ['08:00', '10:00', '12:00', '14:00', '18:00', '20:30'],
      icon: habitIcons[0],
    },
    {
      id: 2,
      habitName: t('default-habits.2.habitName'),
      habitEnemy: t('default-habits.2.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['17:30'],
      icon: habitIcons[1],
    },
    {
      id: 3,
      habitName: t('default-habits.3.habitName'),
      habitEnemy: t('default-habits.3.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['07:30', '13:00', '18:30'],
      icon: habitIcons[2],
    },
    {
      id: 4,
      habitName: t('default-habits.4.habitName'),
      habitEnemy: t('default-habits.4.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:00'],
      icon: habitIcons[3],
    },
    {
      id: 5,
      habitName: t('default-habits.5.habitName'),
      habitEnemy: t('default-habits.5.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      repeatHours: ['09:00'],
      icon: habitIcons[4],
    },
    {
      id: 6,
      habitName: t('default-habits.6.habitName'),
      habitEnemy: t('default-habits.6.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['21:30'],
      icon: habitIcons[5],
    },
    {
      id: 7,
      habitName: t('default-habits.7.habitName'),
      habitEnemy: t('default-habits.7.habitEnemy'),
      repeatDays: ['mon', 'tue', 'wed', 'thu'],
      repeatHours: ['22:30'],
      icon: habitIcons[6],
    },
  ];

  const createdHabits = [];

  defaultHabitsData.forEach(habit => {
    const newHabit = addHabit(
      habit.habitName,
      habit.habitEnemy,
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
      habitEnemy: i18next.t(`default-habits.${id}.habitEnemy`, {
        lng: oldLanguage,
      }),
    };
    newTranslations[id] = {
      habitName: i18next.t(`default-habits.${id}.habitName`, {
        lng: newLanguage,
      }),
      habitEnemy: i18next.t(`default-habits.${id}.habitEnemy`, {
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
      let newHabitEnemy = habit.habitEnemy;

      for (const id of defaultHabitIds) {
        const oldHabit = oldTranslations[id];

        if (
          habit.habitName === oldHabit.habitName &&
          habit.habitEnemy === oldHabit.habitEnemy
        ) {
          newHabitName = newTranslations[id].habitName;
          newHabitEnemy = newTranslations[id].habitEnemy;
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
            habitEnemy: newHabitEnemy,
            goodCounter: habit.goodCounter,
            badCounter: habit.badCounter,
            skipCounter: habit.skipCounter,
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
    deleteHabitExecutions(id);
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
      habitEnemy: habit.habitEnemy,
      goodCounter: habit.goodCounter,
      badCounter: habit.badCounter,
      skipCounter: habit.skipCounter,
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

export function selectActiveHabitKey(todayHabits, currentTime) {
  if (!todayHabits || todayHabits.length === 0) return null;

  const currentSeconds =
    currentTime.getHours() * 3600 +
    currentTime.getMinutes() * 60 +
    currentTime.getSeconds();

  const windowSeconds = MINUTES_FOR_HABIT * 60;
  const today = getLocalDateKey();

  const incomplete = todayHabits.filter(habit => {
    return !hasExecution(habit.id, today, habit.selectedHour);
  });

  if (incomplete.length === 0) return null;

  const activeWindow = incomplete.filter(habit => {
    const start = hourToSec(habit.selectedHour);
    const diff = currentSeconds - start;
    return diff >= 0 && diff <= windowSeconds;
  });

  if (activeWindow.length > 0) {
    activeWindow.sort(
      (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
    );
    return activeWindow[0].key;
  }

  const future = incomplete.filter(habit => {
    const start = hourToSec(habit.selectedHour);
    return start > currentSeconds;
  });

  if (future.length > 0) {
    future.sort(
      (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
    );
    return future[0].key;
  }

  return null;
}

export const autoSkipPastHabits = weekdayKey => {
  // Automatically marks past habits as skipped for today
  // This prevents users from feeling overwhelmed when starting mid-day
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getLocalDateKey();
  let affected = 0;

  realm.write(() => {
    const habits = realm.objects('Habit');
    habits.forEach(habit => {
      if (!habit.available || !habit.repeatDays.includes(weekdayKey)) {
        return;
      }

      let hasChanges = false;

      habit.repeatHours.forEach(hour => {
        const [h, m] = hour.split(':').map(Number);
        const habitMinutes = h * 60 + (m || 0);

        // If habit time is more than MINUTES_FOR_HABIT in the past and not yet completed
        const minutesDiff = currentMinutes - habitMinutes;
        if (
          minutesDiff > MINUTES_FOR_HABIT &&
          !hasExecution(habit.id, today, hour)
        ) {
          recordHabitExecutionInTransaction(habit.id, today, hour, 'skip');
          habit.skipCounter = (habit.skipCounter || 0) + 1;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        affected += 1;
      }
    });
  });

  return affected;
};

export const calculateGlobalProgress = todayHabits => {
  if (!todayHabits || todayHabits.length === 0) return 0;

  const today = getLocalDateKey();
  const totalPlanned = todayHabits.length;
  const totalCompleted = todayHabits.filter(habit =>
    hasExecution(habit.id, today, habit.selectedHour),
  ).length;

  const value = totalCompleted / totalPlanned;
  return Math.max(0, Math.min(1, value));
};
