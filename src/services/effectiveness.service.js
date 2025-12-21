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

// Calculates weekly effectiveness for a habit (returns effectiveness %, goodCount, totalExpected, missedCount, badCount)
export const calculateWeeklyEffectiveness = (
  habitId,
  habit = null,
  daysBack = 7,
) => {
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
      };
    }
    habit = {
      id: realmHabit.id,
      repeatDays: Array.from(realmHabit.repeatDays),
      repeatHours: Array.from(realmHabit.repeatHours),
    };
  }

  const today = getLocalDateKey();

  // Get first execution date - only count expected executions from that date forward
  const firstExecDate = getFirstExecutionDate(habitId);
  const startDate = firstExecDate || today; // If no executions yet, start from today

  // Calculate how many days to look back (from first execution to today)
  const [y1, m1, d1] = startDate.split('-').map(Number);
  const [y2, m2, d2] = today.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const daysSinceStart =
    Math.floor((date2 - date1) / (1000 * 60 * 60 * 24)) + 1;
  const effectiveDaysBack = Math.min(daysSinceStart, daysBack);

  // Generate list of expected executions only from start date
  const expectedExecutions = generateExpectedExecutions(
    habit,
    effectiveDaysBack,
    today,
  );

  // Fetch actual executions first (we need this for filtering)
  const actualExecutions = getHabitExecutions(habitId, effectiveDaysBack);

  // Filter expected executions: for today, include if:
  // 1. Time has already passed, OR
  // 2. User already executed it (good, bad, or skip)
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const filteredExpected = expectedExecutions.filter(exp => {
    // For past dates, include all
    if (exp.date < today) return true;

    // For today, check if already executed
    const hasBeenExecuted = actualExecutions.some(
      actual => actual.date === exp.date && actual.hour === exp.hour,
    );
    if (hasBeenExecuted) return true;

    // For today, only include if the time has passed
    if (exp.date === today) {
      const [h, m] = exp.hour.split(':').map(Number);
      const expMinutes = h * 60 + (m || 0);
      return expMinutes <= currentMinutes;
    }

    // Future dates shouldn't be in the list anyway
    return false;
  });

  if (filteredExpected.length === 0) {
    return {
      effectiveness: null,
      goodCount: 0,
      totalExpected: 0,
      missedCount: 0,
      badCount: 0,
    };
  }

  // Count "good" executions that match expected ones
  const goodCount = actualExecutions.filter(
    actual =>
      actual.status === 'good' &&
      filteredExpected.some(
        exp => exp.date === actual.date && exp.hour === actual.hour,
      ),
  ).length;

  // Count "bad" executions that match expected hours (these replace "missed")
  const badCountAtExpectedHours = actualExecutions.filter(
    actual =>
      actual.status === 'bad' &&
      filteredExpected.some(
        exp => exp.date === actual.date && exp.hour === actual.hour,
      ),
  ).length;

  // Count all "bad" executions (including those outside expected hours)
  const badCount = actualExecutions.filter(
    actual => actual.status === 'bad',
  ).length;

  const totalExpected = filteredExpected.length;
  const missedCount = totalExpected - goodCount - badCountAtExpectedHours;

  // Calculate effectiveness percentage (only good counts towards effectiveness)
  const effectiveness = Math.round((goodCount / totalExpected) * 100);

  return {
    effectiveness,
    goodCount,
    totalExpected,
    missedCount,
    badCount,
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

  return calculateWeeklyEffectiveness(habitId, habit);
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

  return executions[executions.length - 1].date;
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
