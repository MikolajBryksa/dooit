import realm from '@/storage/schemas';
import {getLocalDateKey, subtractDays, dateToWeekday} from '@/utils';

const executionId = (habitId, date, hour) => `${habitId}_${date}_${hour}`;

export const addExecutionInWrite = (habitId, date, hour, status) => {
  const id = executionId(habitId, date, hour);
  if (realm.objectForPrimaryKey('Execution', id)) return;

  realm.create('Execution', {
    id,
    habitId,
    date,
    hour,
    status,
    timestamp: new Date(),
  });
};

export const addExecution = (habitId, date, hour, status) => {
  realm.write(() => {
    addExecutionInWrite(habitId, date, hour, status);
  });
};

export const updateExecution = (executionId, newStatus) => {
  realm.write(() => {
    const execution = realm.objectForPrimaryKey('Execution', executionId);
    if (!execution) return;

    const oldStatus = execution.status;
    if (oldStatus === newStatus) return;

    execution.status = newStatus;

    const habit = realm.objectForPrimaryKey('Habit', execution.habitId);
    if (!habit) return;

    if (oldStatus === 'good') {
      habit.goodCounter = Math.max(0, (habit.goodCounter || 0) - 1);
    } else if (oldStatus === 'bad') {
      habit.badCounter = Math.max(0, (habit.badCounter || 0) - 1);
    }

    if (newStatus === 'good') {
      habit.goodCounter = (habit.goodCounter || 0) + 1;
    } else if (newStatus === 'bad') {
      habit.badCounter = (habit.badCounter || 0) + 1;
    }
  });
};

export const deleteExecution = executionId => {
  realm.write(() => {
    const exec = realm.objectForPrimaryKey('Execution', executionId);
    if (!exec) return;

    const habit = realm.objectForPrimaryKey('Habit', exec.habitId);
    if (habit) {
      if (exec.status === 'good') {
        habit.goodCounter = Math.max(0, (habit.goodCounter || 0) - 1);
      } else if (exec.status === 'bad') {
        habit.badCounter = Math.max(0, (habit.badCounter || 0) - 1);
      }
    }

    realm.delete(exec);
  });
};

export const deleteExecutions = habitId => {
  realm.write(() => {
    realm.delete(realm.objects('Execution').filtered('habitId == $0', habitId));
  });
};

export const deleteOldExecutions = daysToKeep => {
  const cutoffDate = subtractDays(getLocalDateKey(), daysToKeep);

  realm.write(() => {
    realm.delete(realm.objects('Execution').filtered('date < $0', cutoffDate));
  });
};

export const getExecutions = habitId => {
  const results = realm
    .objects('Execution')
    .filtered('habitId == $0', habitId)
    .sorted('timestamp', true);

  return Array.from(results).map(e => ({
    id: e.id,
    habitId: e.habitId,
    date: e.date,
    hour: e.hour,
    status: e.status,
    timestamp: e.timestamp,
  }));
};

export const hasExecution = (habitId, date, hour) => {
  const id = executionId(habitId, date, hour);
  return !!realm.objectForPrimaryKey('Execution', id);
};

export const getExecutionLabel = executionId => {
  const execution = realm.objectForPrimaryKey('Execution', executionId);
  if (!execution) return null;

  const habit = realm.objectForPrimaryKey('Habit', execution.habitId);
  if (!habit) return null;

  return `${habit.habitName} | ${execution.date} | ${execution.hour}`;
};

const getLastExecutionDateGlobal = () => {
  const last = realm.objects('Execution').sorted('date', true)[0];
  return last ? last.date : null;
};

export const backfillMissedExecutions = (habits, maxDaysBack = 14) => {
  if (!habits || habits.length === 0) return;

  const today = getLocalDateKey();
  const yesterday = subtractDays(today, 1);

  const lastExecutionDate = getLastExecutionDateGlobal();
  if (!lastExecutionDate) return;

  const cutoffDate = subtractDays(today, maxDaysBack);
  if (lastExecutionDate < cutoffDate) return;

  realm.write(() => {
    habits.forEach(habit => {
      let currentDate = lastExecutionDate;

      while (currentDate <= yesterday) {
        const weekday = dateToWeekday(currentDate);

        if (habit.repeatDays.includes(weekday)) {
          habit.repeatHours.forEach(hour => {
            addExecutionInWrite(habit.id, currentDate, hour, 'bad');
          });
        }

        currentDate = subtractDays(currentDate, -1);
      }
    });
  });
};

const getFirstExecutionDate = habitId => {
  const first = realm
    .objects('Execution')
    .filtered('habitId == $0', habitId)
    .sorted('date')[0];

  return first ? first.date : null;
};

export const calculateEffectiveness = habitId => {
  const actualExecutions = getExecutions(habitId);

  let goodCount = 0;
  let badCount = 0;

  for (const e of actualExecutions) {
    if (e.status === 'good') goodCount += 1;
    else if (e.status === 'bad') badCount += 1;
  }

  const totalCount = goodCount + badCount;

  return {
    effectiveness:
      totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : null,
    goodCount,
    badCount,
    totalCount,
  };
};

export const calculateEffectivenessUpToDate = (habitId, endDate) => {
  const actualExecutions = getExecutions(habitId).filter(
    e => e.date <= endDate,
  );

  let goodCount = 0;
  let badCount = 0;

  for (const e of actualExecutions) {
    if (e.status === 'good') goodCount += 1;
    else if (e.status === 'bad') badCount += 1;
  }

  const totalCount = goodCount + badCount;

  return {
    effectiveness:
      totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : null,
    goodCount,
    badCount,
    totalCount,
  };
};
