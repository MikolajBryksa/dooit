import realm from '@/storage/schemas';
import {getLocalDateKey, subtractDays, dateToWeekday} from '@/utils';
import uuid from 'react-native-uuid';

// Internal function to create execution without opening a transaction
const _createExecution = (habitId, date, hour, status) => {
  realm.create('HabitExecution', {
    id: uuid.v4(),
    habitId,
    date,
    hour,
    status, // 'good' | 'bad' | 'skip'
    timestamp: new Date(),
  });
};

// Records a habit execution to history
export const recordHabitExecution = (habitId, date, hour, status) => {
  realm.write(() => {
    _createExecution(habitId, date, hour, status);
  });
};

// Records execution inside an already open transaction (for batch operations)
export const recordHabitExecutionInTransaction = _createExecution;

// Retrieves habit executions from the last N days
export const getHabitExecutions = (habitId, daysBack = 14) => {
  const today = getLocalDateKey();
  const startDate = subtractDays(today, daysBack - 1);

  const executions = realm
    .objects('HabitExecution')
    .filtered(
      'habitId == $0 AND date >= $1 AND date <= $2',
      habitId,
      startDate,
      today,
    );

  return Array.from(executions).map(e => ({
    id: e.id,
    habitId: e.habitId,
    date: e.date,
    hour: e.hour,
    status: e.status,
    timestamp: e.timestamp,
  }));
};

// Generates a list of expected executions for a habit in the last N days
export const generateExpectedExecutions = (
  habit,
  daysBack = 14,
  referenceDate = null,
) => {
  const today = referenceDate || getLocalDateKey();
  const expected = [];

  for (let i = 0; i < daysBack; i++) {
    const date = subtractDays(today, i);
    const weekday = dateToWeekday(date);

    if (habit.repeatDays.includes(weekday)) {
      habit.repeatHours.forEach(hour => {
        expected.push({date, hour});
      });
    }
  }

  return expected;
};

// Helper to compute inclusive day difference between two YYYY-MM-DD dates.
// Returns number of days including both endpoints (min 1).
const inclusiveDaysBetween = (startDate, endDate) => {
  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = endDate.split('-').map(Number);

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);

  const diffDays = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
};

export const calculateEffectiveness = (habitId, habit = null) => {
  if (!habit) {
    const realmHabit = realm.objectForPrimaryKey('Habit', habitId);
    if (!realmHabit) {
      return {
        effectiveness: null,
        goodCount: 0,
        badCount: 0,
        skipCount: 0,
        totalCount: 0,
      };
    }

    habit = {
      id: realmHabit.id,
      repeatDays: Array.from(realmHabit.repeatDays),
      repeatHours: Array.from(realmHabit.repeatHours),
    };
  }

  const today = getLocalDateKey();

  const firstExecDate = getFirstExecutionDate(habitId);
  const startDate = firstExecDate || today;
  const daysBack = inclusiveDaysBetween(startDate, today);

  const actualExecutions = getHabitExecutions(habitId, daysBack);

  const repeatDaysSet = new Set(habit.repeatDays || []);
  const repeatHoursSet = new Set((habit.repeatHours || []).map(String));

  let goodCount = 0;
  let badCount = 0;
  let skipCount = 0;

  for (const e of actualExecutions) {
    const weekday = dateToWeekday(e.date);
    if (!repeatDaysSet.has(weekday)) continue;

    const hourKey = String(e.hour);
    if (!repeatHoursSet.has(hourKey)) continue;

    if (e.status === 'good') goodCount += 1;
    else if (e.status === 'bad') badCount += 1;
    else if (e.status === 'skip') skipCount += 1;
  }

  const totalCount = goodCount + badCount;

  return {
    effectiveness:
      totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : null,
    goodCount,
    badCount,
    skipCount,
    totalCount,
  };
};

// Recalculates effectiveness after habit config change (doesn't modify historical executions)
export const recalculateEffectivenessAfterConfigChange = (
  habitId,
  newRepeatDays,
  newRepeatHours,
) => {
  // Calculate effectiveness with new configuration
  const habit = {
    id: habitId,
    repeatDays: newRepeatDays,
    repeatHours: newRepeatHours,
  };

  return calculateEffectiveness(habitId, habit);
};

// Cleans old executions (older than N days) to prevent database bloat
export const cleanOldExecutions = (daysToKeep = 30) => {
  const cutoffDate = subtractDays(getLocalDateKey(), daysToKeep);

  realm.write(() => {
    const oldExecutions = realm
      .objects('HabitExecution')
      .filtered('date < $0', cutoffDate);
    realm.delete(oldExecutions);
  });
};

// Deletes all executions for a habit (used when deleting a habit)
export const deleteHabitExecutions = habitId => {
  realm.write(() => {
    const executions = realm
      .objects('HabitExecution')
      .filtered('habitId == $0', habitId);
    realm.delete(executions);
  });
};

// Retrieves the date of the first habit execution
export const getFirstExecutionDate = habitId => {
  const executions = realm
    .objects('HabitExecution')
    .filtered('habitId == $0', habitId)
    .sorted('date', false);

  if (executions.length === 0) return null;
  return executions[0].date;
};

// Checks if an execution already exists (prevents duplicates)
export const hasExecution = (habitId, date, hour) => {
  const execution = realm
    .objects('HabitExecution')
    .filtered(
      'habitId == $0 AND date == $1 AND hour == $2',
      habitId,
      date,
      hour,
    );

  return execution.length > 0;
};

// Retrieves all completed hours for a habit on a given date
export const getCompletedHoursForDate = (habitId, date) => {
  const executions = realm
    .objects('HabitExecution')
    .filtered('habitId == $0 AND date == $1', habitId, date);

  return Array.from(executions).map(e => e.hour);
};

// Resets executions for all habits on a given date (keeps history)
export const resetExecutionsForDate = date => {
  // This function keeps history and can be used for other purposes in the future
  return true;
};

// Deletes a specific habit execution and updates counters accordingly
export const deleteExecution = (executionId, habitId) => {
  realm.write(() => {
    const exec = realm.objectForPrimaryKey('HabitExecution', executionId);
    if (!exec) return;

    const habit = realm.objectForPrimaryKey('Habit', habitId);
    if (habit) {
      if (exec.status === 'good')
        habit.goodCounter = Math.max(0, habit.goodCounter - 1);
      if (exec.status === 'bad')
        habit.badCounter = Math.max(0, habit.badCounter - 1);
      if (exec.status === 'skip')
        habit.skipCounter = Math.max(0, habit.skipCounter - 1);
    }

    realm.delete(exec);
  });
};

// Returns string: "Habit name - YYYY-MM-DD - HH:mm"
export const getExecutionLabel = executionId => {
  const execution = realm.objectForPrimaryKey('HabitExecution', executionId);
  if (!execution) return null;

  const habit = realm.objectForPrimaryKey('Habit', execution.habitId);
  if (!habit) return null;

  const habitName = habit.habitName;
  const date = execution.date;
  const hour = execution.hour;

  return `${habitName} - ${date} - ${hour}`;
};
