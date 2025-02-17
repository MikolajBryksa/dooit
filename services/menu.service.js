import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addMenu = (when, meal1, meal2, meal3, meal4, meal5) => {
  const id = getNextId('Menu');
  when = new Date(when);

  let newMenu;
  realm.write(() => {
    newMenu = realm.create('Menu', {
      id,
      when,
      meal1,
      meal2,
      meal3,
      meal4,
      meal5,
    });
  });
  return newMenu;
};

export const getEveryMenu = () => {
  const sortFields = [['when', false]];
  const results = realm.objects('Menu').sorted(sortFields);
  return results;
};

export const getMenu = id => {
  const menu = realm.objectForPrimaryKey('Menu', id);
  if (!menu) return null;

  return {
    ...menu,
    when: menu.when.toString(),
  };
};

export const updateMenu = (id, when, meal1, meal2, meal3, meal4, meal5) => {
  when = new Date(when);

  let updatedMenu;
  realm.write(() => {
    updatedMenu = realm.create(
      'Menu',
      {
        id,
        when,
        meal1,
        meal2,
        meal3,
        meal4,
        meal5,
      },
      'modified',
    );
  });
  return updatedMenu;
};

export const deleteMenu = id => {
  let deletedMenu;
  realm.write(() => {
    const menuToDelete = realm.objectForPrimaryKey('Menu', id);
    if (menuToDelete) {
      deletedMenu = {...menuToDelete};
      realm.delete(menuToDelete);
    }
  });
  return deletedMenu;
};

export const getTodayMenu = selectedDay => {
  const today = new Date(selectedDay);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const results = realm
    .objects('Menu')
    .filtered('when >= $0 && when < $1', today, tomorrow);
  return results;
};
