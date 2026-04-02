import realm from '@/storage/schemas';
import {hourToSec} from '@/utils';
import i18next from 'i18next';
import {habitIcons, MAX_HABITS} from '@/constants';
import {
  deleteExecutions,
  hasExecutionOrDeleted,
  getExecutionStats,
  getExecutionStatsForDate,
} from '@/services/executions.service';
import {logError} from '@/services/errors.service';

const calculateMonthlyTarget = (repeatDays = [], repeatHours = []) => {
  return (repeatDays.length || 0) * (repeatHours.length || 0) * 4;
};

export const addHabit = (
  habitName,
  repeatDays,
  repeatHours,
  icon,
  goal,
  id = null,
) => {
  try {
    const currentCount = realm.objects('Habit').length;
    if (id === null && currentCount >= MAX_HABITS) {
      return null;
    }

    if (id === null) {
      const lastItem = realm.objects('Habit').sorted('id', true)[0];
      const nextId = lastItem ? lastItem.id + 1 : 8;
      id = Math.max(8, nextId);
    }

    const resolvedGoal =
      goal ?? calculateMonthlyTarget(repeatDays, repeatHours);

    let newHabit;
    realm.write(() => {
      newHabit = realm.create('Habit', {
        id,
        habitName,
        repeatDays,
        repeatHours,
        icon: icon || 'infinity',
        goal: resolvedGoal,
      });
    });

    return newHabit;
  } catch (e) {
    logError(e, 'habits.addHabit');
    return null;
  }
};

export const updateHabit = (id, updates) => {
  try {
    let updatedHabit;

    realm.write(() => {
      const habit = realm.objectForPrimaryKey('Habit', id);
      if (!habit) return null;

      updatedHabit = realm.create(
        'Habit',
        {
          id,
          habitName: updates.habitName ?? habit.habitName,
          repeatDays: updates.repeatDays ?? Array.from(habit.repeatDays),
          repeatHours: updates.repeatHours ?? Array.from(habit.repeatHours),
          icon: updates.icon ?? habit.icon,
          goal: updates.goal ?? habit.goal,
        },
        'modified',
      );
    });

    return updatedHabit;
  } catch (e) {
    logError(e, 'habits.updateHabit');
    return null;
  }
};

export const deleteHabit = id => {
  try {
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
  } catch (e) {
    logError(e, 'habits.deleteHabit');
    return null;
  }
};

export const getHabits = () => {
  try {
    const realmHabits = realm.objects('Habit');

    const habitsArr = Array.from(realmHabits).map(habit => ({
      id: habit.id,
      habitName: habit.habitName,
      repeatDays: Array.from(habit.repeatDays),
      repeatHours: Array.from(habit.repeatHours),
      icon: habit.icon,
      goal: habit.goal,
    }));

    habitsArr.sort((a, b) => {
      const aFirstHour = a.repeatHours?.[0] || '';
      const bFirstHour = b.repeatHours?.[0] || '';
      return aFirstHour.localeCompare(bFirstHour);
    });

    return habitsArr;
  } catch (e) {
    logError(e, 'habits.getHabits');
    return [];
  }
};

export const getHabitById = id => {
  try {
    const habit = realm.objectForPrimaryKey('Habit', id);
    if (!habit) return null;

    return {
      id: habit.id,
      habitName: habit.habitName,
      repeatDays: Array.from(habit.repeatDays),
      repeatHours: Array.from(habit.repeatHours),
      icon: habit.icon,
      goal: habit.goal,
    };
  } catch (e) {
    logError(e, 'habits.getHabitById');
    return null;
  }
};

export const getHabitValue = (id, key) => {
  const habit = getHabitById(id);
  return habit ? habit[key] : null;
};

export const updateHabitValue = (id, key, value) => {
  return updateHabit(id, {[key]: value});
};

export const updateHabitValues = (id, updates) => {
  return updateHabit(id, updates);
};

const DEFAULT_HABITS_DATA = [
  {
    id: 1,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    repeatHours: ['08:00', '10:00', '12:00', '14:00', '18:00', '20:30'],
    icon: habitIcons[0],
  },
  {
    id: 2,
    repeatDays: ['tue', 'thu'],
    repeatHours: ['17:30'],
    icon: habitIcons[1],
  },
  {
    id: 3,
    repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    repeatHours: ['07:30', '13:00', '18:30'],
    icon: habitIcons[2],
  },
  {
    id: 4,
    repeatDays: ['mon', 'tue', 'wed', 'thu'],
    repeatHours: ['22:00'],
    icon: habitIcons[3],
  },
  {
    id: 5,
    repeatDays: ['mon', 'wed'],
    repeatHours: ['09:00'],
    icon: habitIcons[4],
  },
  {
    id: 6,
    repeatDays: ['mon', 'tue', 'wed', 'thu'],
    repeatHours: ['21:30'],
    icon: habitIcons[5],
  },
  {
    id: 7,
    repeatDays: ['mon', 'tue', 'wed', 'thu'],
    repeatHours: ['22:30'],
    icon: habitIcons[6],
  },
];

export const createDefaultHabit = habitId => {
  const data = DEFAULT_HABITS_DATA.find(h => h.id === habitId);
  if (!data) return null;

  const habitName = i18next.t(`default-habits.${habitId}.habitName`);

  return addHabit(
    habitName,
    data.repeatDays,
    data.repeatHours,
    data.icon,
    data.goal,
    habitId,
  );
};

export const translateDefaultHabits = (oldLanguage, newLanguage) => {
  try {
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
              repeatDays: Array.from(habit.repeatDays),
              repeatHours: Array.from(habit.repeatHours),
              icon: habit.icon,
              goal: habit.goal,
            },
            'modified',
          );

          updatedCount++;
        }
      });
    });

    return updatedCount;
  } catch (e) {
    logError(e, 'habits.translateDefaultHabits');
    return 0;
  }
};

export const getTodayHabits = (habits, weekdayKey) => {
  if (!habits || habits.length === 0) return [];

  const filteredHabits = habits.filter(habit =>
    habit.repeatDays.includes(weekdayKey),
  );

  const expandedHabits = filteredHabits.flatMap(habit =>
    habit.repeatHours.map((hour, idx) => ({
      key: `${habit.id}__${idx}__${hour}`,
      id: habit.id,
      habitName: habit.habitName,
      repeatDays: habit.repeatDays,
      repeatHours: habit.repeatHours,
      selectedHour: hour,
      slotIndex: idx,
      icon: habit.icon,
      goal: habit.goal,
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
    return !hasExecutionOrDeleted(habit.id, dateKey, habit.slotIndex);
  });

  if (incomplete.length === 0) return null;

  incomplete.sort(
    (a, b) => hourToSec(a.selectedHour) - hourToSec(b.selectedHour),
  );

  return incomplete[0].key;
}

export const getGoalTarget = habit => {
  if (!habit) return 0;
  return habit.goal || 0;
};

export const getGoalProgress = habit => {
  if (!habit?.id) return 0;
  return getExecutionStats(habit.id).doneCount;
};

export const getGoalPercentage = habit => {
  const target = getGoalTarget(habit);
  const progress = getGoalProgress(habit);

  if (target <= 0) return null;
  return Math.min(100, Math.round((progress / target) * 100));
};

export const getGoalStats = habit => {
  if (!habit?.id) {
    return {
      goalCount: 0,
      doneCount: 0,
      skippedCount: 0,
      remainingCount: 0,
      progressPercent: null,
    };
  }

  const goalCount = habit.goal || 0;
  const {doneCount, skippedCount} = getExecutionStats(habit.id);
  const remainingCount = Math.max(0, goalCount - doneCount);

  return {
    goalCount,
    doneCount,
    skippedCount,
    remainingCount,
    progressPercent:
      goalCount > 0
        ? Math.min(100, Math.round((doneCount / goalCount) * 100))
        : null,
  };
};

export const getHabitsForSync = habits => {
  return habits.map(habit => ({
    id: habit.id,
    habitName: habit.habitName,
    repeatDays: habit.repeatDays,
    repeatHours: habit.repeatHours,
    icon: habit.icon,
    goal: habit.goal,
    repetitions: getExecutionStats(habit.id).doneCount,
  }));
};

export const getSuggestedGoalFromSchedule = (
  repeatDays = [],
  repeatHours = [],
) => {
  return calculateMonthlyTarget(repeatDays, repeatHours);
};

export const getTodayGoalStats = (habit, dateKey, weekdayKey) => {
  if (!habit?.id) {
    return {
      todayTarget: 0,
      todayDoneCount: 0,
      todaySkippedCount: 0,
      todayAttemptedCount: 0,
      todayRemainingCount: 0,
      todayPercentage: null,
    };
  }

  const isScheduledToday = habit.repeatDays?.includes(weekdayKey);
  const todayTarget = isScheduledToday ? habit.repeatHours?.length || 0 : 0;

  const {doneCount, skippedCount} = getExecutionStatsForDate(habit.id, dateKey);
  const todayAttemptedCount = doneCount + skippedCount;
  const todayRemainingCount = Math.max(0, todayTarget - todayAttemptedCount);

  return {
    todayTarget,
    todayDoneCount: doneCount,
    todaySkippedCount: skippedCount,
    todayAttemptedCount,
    todayRemainingCount,
    todayPercentage:
      todayTarget > 0
        ? Math.min(100, Math.round((doneCount / todayTarget) * 100))
        : null,
  };
};
