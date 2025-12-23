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
export const getHabitExecutions = (habitId, daysBack = 7) => {
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
  daysBack = 7,
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
  // If habit not provided, fetch from database
  if (!habit) {
    const realmHabit = realm.objectForPrimaryKey('Habit', habitId);
    if (!realmHabit) {
      return {
        effectiveness: null,
        goodCount: 0,
        totalExpected: 0,
        missedCount: 0,
        badCount: 0,
        skippedCount: 0,
      };
    }

    habit = {
      id: realmHabit.id,
      repeatDays: Array.from(realmHabit.repeatDays),
      repeatHours: Array.from(realmHabit.repeatHours),
    };
  }

  const today = getLocalDateKey();

  // Full history window: from first execution date to today (inclusive)
  const firstExecDate = getFirstExecutionDate(habitId);
  const startDate = firstExecDate || today;
  const daysBack = inclusiveDaysBetween(startDate, today);

  const actualExecutions = getHabitExecutions(habitId, daysBack);
  const expectedExecutions = generateExpectedExecutions(habit, daysBack, today);

  // Build quick lookup for executions by (date|hour)
  const execByKey = new Map();
  for (const e of actualExecutions) {
    execByKey.set(`${e.date}|${e.hour}`, e.status); // last write wins if duplicates
  }

  // Only count expected executions up to the current time for today (unless already executed)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const filteredExpected = expectedExecutions.filter(exp => {
    if (exp.date < today) return true;
    if (exp.date > today) return false;

    // exp.date === today
    const status = execByKey.get(`${exp.date}|${exp.hour}`);
    if (status) return true; // was executed (good/bad/skip) -> keep in the consideration step

    const [h, m] = exp.hour.split(':').map(Number);
    const expMinutes = h * 60 + (m || 0);
    return expMinutes <= currentMinutes;
  });

  if (filteredExpected.length === 0) {
    return {
      effectiveness: null,
      goodCount: 0,
      totalExpected: 0,
      missedCount: 0,
      badCount: 0,
      skippedCount: 0,
    };
  }

  // Exclude skipped expected occurrences from denominator
  const expectedNonSkipped = [];
  let skippedCount = 0;

  for (const exp of filteredExpected) {
    const status = execByKey.get(`${exp.date}|${exp.hour}`);
    if (status === 'skip') {
      skippedCount += 1;
      continue;
    }
    expectedNonSkipped.push(exp);
  }

  const totalExpected = expectedNonSkipped.length;

  // If everything ended up skipped, effectiveness is null (no basis)
  if (totalExpected === 0) {
    return {
      effectiveness: null,
      goodCount: 0,
      totalExpected: 0,
      missedCount: 0,
      badCount: 0,
      skippedCount,
    };
  }

  // Count good/bad only within expectedNonSkipped
  const expectedKeySet = new Set(
    expectedNonSkipped.map(exp => `${exp.date}|${exp.hour}`),
  );

  const goodCount = actualExecutions.filter(
    a => a.status === 'good' && expectedKeySet.has(`${a.date}|${a.hour}`),
  ).length;

  const badCountAtExpectedHours = actualExecutions.filter(
    a => a.status === 'bad' && expectedKeySet.has(`${a.date}|${a.hour}`),
  ).length;

  // All bad executions (also outside expected hours) - for stats only
  const badCount = actualExecutions.filter(a => a.status === 'bad').length;

  const missedCount = totalExpected - goodCount - badCountAtExpectedHours;

  const effectiveness = Math.round((goodCount / totalExpected) * 100);

  return {
    effectiveness,
    goodCount,
    totalExpected,
    missedCount,
    badCount,
    skippedCount,
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
