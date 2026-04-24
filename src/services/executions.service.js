import realm from '@/storage/schemas';
import {getLocalDateKey, subtractDays, dateToWeekday} from '@/utils';
import {logError} from '@/services/errors.service';

const executionId = (habitId, date, slotIndex) =>
  `${habitId}_${date}_${slotIndex}`;

const addExecutionInWrite = (habitId, date, slotIndex, plannedHour, status) => {
  const id = executionId(habitId, date, slotIndex);
  const existing = realm.objectForPrimaryKey('Execution', id);

  if (existing) return null;

  return realm.create('Execution', {
    id,
    habitId,
    date,
    slotIndex,
    plannedHour,
    status,
    timestamp: new Date(),
    deleted: false,
  });
};

export const recordExecutionChoice = (
  habitId,
  date,
  slotIndex,
  plannedHour,
  status,
) => {
  try {
    realm.write(() => {
      const id = executionId(habitId, date, slotIndex);
      const existing = realm.objectForPrimaryKey('Execution', id);

      if (existing && existing.deleted) return;

      if (!existing) {
        addExecutionInWrite(habitId, date, slotIndex, plannedHour, status);
        return;
      }

      if (existing.status === status) return;

      existing.status = status;
      existing.timestamp = new Date();
      existing.plannedHour = plannedHour ?? existing.plannedHour;
    });
  } catch (e) {
    logError(e, 'executions.recordExecutionChoice');
  }
};

export const updateExecution = (executionIdValue, updates = {}) => {
  try {
    let updatedExecution = null;

    realm.write(() => {
      const execution = realm.objectForPrimaryKey(
        'Execution',
        executionIdValue,
      );
      if (!execution || execution.deleted) return null;

      execution.status = updates.status ?? execution.status;
      execution.plannedHour = updates.plannedHour ?? execution.plannedHour;
      execution.timestamp = updates.timestamp ?? new Date();

      updatedExecution = execution;
    });

    return updatedExecution;
  } catch (e) {
    logError(e, 'executions.updateExecution');
    return null;
  }
};

export const deleteExecution = executionIdValue => {
  try {
    realm.write(() => {
      const exec = realm.objectForPrimaryKey('Execution', executionIdValue);
      if (!exec) return;

      exec.deleted = true;
    });
  } catch (e) {
    logError(e, 'executions.deleteExecution');
  }
};

export const deleteExecutions = habitId => {
  try {
    realm.write(() => {
      realm.delete(
        realm.objects('Execution').filtered('habitId == $0', habitId),
      );
    });
  } catch (e) {
    logError(e, 'executions.deleteExecutions');
  }
};

export const resetAllExecutions = () => {
  try {
    realm.write(() => {
      realm.delete(realm.objects('Execution'));
    });
  } catch (e) {
    logError(e, 'executions.resetAllExecutions');
  }
};

export const hasAnyExecutions = () => {
  try {
    return realm.objects('Execution').filtered('deleted != true').length > 0;
  } catch (e) {
    logError(e, 'executions.hasAnyExecutions');
    return false;
  }
};

export const deleteOldExecutions = daysToKeep => {
  try {
    const cutoffDate = subtractDays(getLocalDateKey(), daysToKeep);

    realm.write(() => {
      realm.delete(
        realm.objects('Execution').filtered('date < $0', cutoffDate),
      );
    });
  } catch (e) {
    logError(e, 'executions.deleteOldExecutions');
  }
};

export const getExecutions = habitId => {
  try {
    const results = realm
      .objects('Execution')
      .filtered('habitId == $0 AND deleted != true', habitId)
      .sorted('timestamp', true);

    return Array.from(results).map(execution => ({
      id: execution.id,
      habitId: execution.habitId,
      date: execution.date,
      slotIndex: execution.slotIndex,
      plannedHour: execution.plannedHour,
      status: execution.status,
      timestamp: execution.timestamp,
    }));
  } catch (e) {
    logError(e, 'executions.getExecutions');
    return [];
  }
};

export const getExecutionStats = habitId => {
  try {
    const executions = realm
      .objects('Execution')
      .filtered('habitId == $0 AND deleted != true', habitId);

    let doneCount = 0;
    let skippedCount = 0;

    executions.forEach(execution => {
      if (execution.status === 'done') doneCount += 1;
      else if (execution.status === 'skipped') skippedCount += 1;
    });

    return {
      totalExecutions: executions.length,
      doneCount,
      skippedCount,
    };
  } catch (e) {
    logError(e, 'executions.getExecutionStats');
    return {totalExecutions: 0, doneCount: 0, skippedCount: 0};
  }
};

export const hasExecutionOrDeleted = (habitId, date, slotIndex) => {
  try {
    const id = executionId(habitId, date, slotIndex);
    return !!realm.objectForPrimaryKey('Execution', id);
  } catch (e) {
    logError(e, 'executions.hasExecutionOrDeleted');
    return false;
  }
};

export const getExecutionLabel = executionIdValue => {
  const execution = realm.objectForPrimaryKey('Execution', executionIdValue);
  if (!execution) return null;

  const habit = realm.objectForPrimaryKey('Habit', execution.habitId);
  if (!habit) return null;

  return `${habit.habitName} | ${execution.date} | ${execution.plannedHour}`;
};

const getLastExecutionDateForHabit = habitId => {
  const last = realm
    .objects('Execution')
    .filtered('habitId == $0 AND deleted != true', habitId)
    .sorted('date', true)[0];

  return last ? last.date : null;
};

export const backfillMissedExecutions = (habits, maxDaysBack) => {
  if (!habits || habits.length === 0) return;

  try {
    const today = getLocalDateKey();
    const yesterday = subtractDays(today, 1);
    const cutoffDate = subtractDays(today, maxDaysBack);

    realm.write(() => {
      habits.forEach(habit => {
        const lastExecutionDate = getLastExecutionDateForHabit(habit.id);

        if (!lastExecutionDate) return;
        if (lastExecutionDate < cutoffDate) return;

        let currentDate = lastExecutionDate;

        while (currentDate <= yesterday) {
          const weekday = dateToWeekday(currentDate);

          if (habit.repeatDays.includes(weekday)) {
            habit.repeatHours.forEach((hour, slotIndex) => {
              const executionExists = hasExecutionOrDeleted(
                habit.id,
                currentDate,
                slotIndex,
              );

              if (!executionExists) {
                addExecutionInWrite(
                  habit.id,
                  currentDate,
                  slotIndex,
                  hour,
                  'skipped',
                );
              }
            });
          }

          currentDate = subtractDays(currentDate, -1);
        }
      });
    });
  } catch (e) {
    logError(e, 'executions.backfillMissedExecutions');
  }
};

export const backfillTodaySkippedExecutions = habits => {
  if (!habits || habits.length === 0) return;

  try {
    const today = getLocalDateKey();
    const weekday = dateToWeekday(today);

    realm.write(() => {
      habits.forEach(habit => {
        if (!habit.repeatDays.includes(weekday)) return;

        habit.repeatHours.forEach((hour, slotIndex) => {
          const executionExists = hasExecutionOrDeleted(
            habit.id,
            today,
            slotIndex,
          );

          if (!executionExists) {
            addExecutionInWrite(habit.id, today, slotIndex, hour, 'skipped');
          }
        });
      });
    });
  } catch (e) {
    logError(e, 'executions.backfillTodaySkippedExecutions');
  }
};

export const getExecutionStatsForDate = (habitId, date) => {
  try {
    const executions = realm
      .objects('Execution')
      .filtered(
        'habitId == $0 AND date == $1 AND deleted != true',
        habitId,
        date,
      );

    let doneCount = 0;
    let skippedCount = 0;

    executions.forEach(execution => {
      if (execution.status === 'done') doneCount += 1;
      else if (execution.status === 'skipped') skippedCount += 1;
    });

    return {
      totalExecutions: executions.length,
      doneCount,
      skippedCount,
    };
  } catch (e) {
    logError(e, 'executions.getExecutionStatsForDate');
    return {totalExecutions: 0, doneCount: 0, skippedCount: 0};
  }
};
