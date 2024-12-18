import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addHabit = (when, what) => {
  const id = getNextId('Habit');
  when = id;

  let newHabit;
  realm.write(() => {
    newHabit = realm.create('Habit', {
      id,
      when,
      what,
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

export const updateHabit = (id, when, what) => {
  when = parseInt(when, 10);

  let updatedHabit;
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);
    updatedHabit = realm.create(
      'Habit',
      {
        id,
        when,
        what,
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
