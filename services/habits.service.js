import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addHabit = (when, what, time, days) => {
  const id = getNextId('Habit');
  when = id;

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      when,
      what,
      time,
      check: false,
      monday: days.monday,
      tuesday: days.tuesday,
      wednesday: days.wednesday,
      thursday: days.thursday,
      friday: days.friday,
      saturday: days.saturday,
      sunday: days.sunday,
    });
  });
  return newHabit;
};

export const getEveryHabit = () => {
  const sortFields = [['when', false]];
  const results = realm.objects('Habit').sorted(sortFields);
  return results.slice(0, 180);
};

export const getHabit = id => {
  const habit = realm.objectForPrimaryKey('Habit', id);
  if (!habit) return null;

  return {
    ...habit,
    when: habit.when.toString(),
  };
};

export const updateHabit = (id, when, what, time, days, check) => {
  when = parseInt(when, 10);

  let updatedHabit;
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);
    check = check !== null ? check : habit.check;

    updatedHabit = realm.create(
      'Habit',
      {
        id,
        when,
        what,
        time,
        check,
        monday: days.monday !== undefined ? days.monday : habit.monday,
        tuesday: days.tuesday !== undefined ? days.tuesday : habit.tuesday,
        wednesday:
          days.wednesday !== undefined ? days.wednesday : habit.wednesday,
        thursday: days.thursday !== undefined ? days.thursday : habit.thursday,
        friday: days.friday !== undefined ? days.friday : habit.friday,
        saturday: days.saturday !== undefined ? days.saturday : habit.saturday,
        sunday: days.sunday !== undefined ? days.sunday : habit.sunday,
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

export const getTodayHabits = () => {
  const dayOfWeek = new Date()
    .toLocaleString('en-US', {weekday: 'long'})
    .toLowerCase();
  const results = realm.objects('Habit').filtered(`${dayOfWeek} == true`);
  return results;
};
