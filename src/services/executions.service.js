import realm from '@/storage/schemas';
import {getLocalDateKey, subtractDays, dateToWeekday} from '@/utils';

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
};

export const updateExecution = (executionIdValue, updates = {}) => {
  let updatedExecution = null;

  realm.write(() => {
    const execution = realm.objectForPrimaryKey('Execution', executionIdValue);
    if (!execution || execution.deleted) return null;

    execution.status = updates.status ?? execution.status;
    execution.plannedHour = updates.plannedHour ?? execution.plannedHour;
    execution.timestamp = updates.timestamp ?? new Date();

    updatedExecution = execution;
  });

  return updatedExecution;
};

export const deleteExecution = executionIdValue => {
  realm.write(() => {
    const exec = realm.objectForPrimaryKey('Execution', executionIdValue);
    if (!exec) return;

    exec.deleted = true;
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
};

export const getExecutionStats = habitId => {
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
};

export const hasExecutionOrDeleted = (habitId, date, slotIndex) => {
  const id = executionId(habitId, date, slotIndex);
  return !!realm.objectForPrimaryKey('Execution', id);
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
};

export const getExecutionStatsForDate = (habitId, date) => {
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
};
