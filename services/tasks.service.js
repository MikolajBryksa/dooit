import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addTask = (when, what, category) => {
  const id = getNextId('Task');
  when = id;

  let newTask;
  realm.write(() => {
    newTask = realm.create('Task', {
      id,
      when,
      what,
      check: false,
      category,
    });
  });
  return newTask;
};

export const getEveryTask = () => {
  const sortFields = [['when', false]];
  const results = realm.objects('Task').sorted(sortFields);
  return results.slice(0, 180);
};

export const getTask = id => {
  const task = realm.objectForPrimaryKey('Task', id);
  if (!task) return null;

  return {
    ...task,
    when: task.when.toString(),
  };
};

export const updateTask = (id, when, what, check) => {
  when = parseInt(when, 10);

  let updatedTask;
  realm.write(() => {
    const task = realm.objectForPrimaryKey('Task', id);
    check = check !== null ? check : task.check;
    updatedTask = realm.create(
      'Task',
      {
        id,
        when,
        what,
        category: task.category,
        check,
      },
      'modified',
    );
  });
  return updatedTask;
};

export const deleteTask = id => {
  let deletedTask;
  realm.write(() => {
    const taskToDelete = realm.objectForPrimaryKey('Task', id);
    if (taskToDelete) {
      deletedTask = {...taskToDelete};
      realm.delete(taskToDelete);
    }
  });
  return deletedTask;
};
