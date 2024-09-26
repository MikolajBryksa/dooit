import realm from './schemas';

const getModel = name => {
  const models = {
    habit: 'Habit',
    weight: 'Weight',
    cost: 'Cost',
    plan: 'Plan',
    task: 'Task',
  };
  return models[name];
};

export const addItem = (name, when, what) => {
  const model = getModel(name);
  if (when instanceof Date) {
    realm.write(() => {
      realm.create(model, {id: Date.now(), when, what});
    });
  } else {
    const lastItem = realm.objects(model).sorted('when', true)[0];
    const newWhen = lastItem ? lastItem.when + 1 : 1;
    realm.write(() => {
      realm.create(model, {id: Date.now(), when: newWhen, what});
    });
  }
};

export const getEveryItem = (name, sort) => {
  const model = getModel(name);
  return realm.objects(model).sorted('when', sort);
};

export const getItem = (name, id) => {
  const model = getModel(name);
  return realm.objectForPrimaryKey(model, id);
};

export const updateItem = (name, id, when, what) => {
  const model = getModel(name);
  realm.write(() => {
    const item = realm.objectForPrimaryKey(model, id);
    item.when = when;
    item.what = what;
  });
};

export const deleteItem = (name, id) => {
  const model = getModel(name);
  realm.write(() => {
    const item = realm.objectForPrimaryKey(model, id);
    realm.delete(item);
  });
};

export const getTodaysPlans = () => {
  const today = new Date();
  const plans = realm.objects('Plan').filtered('when == $0', today);
  return plans;
};

// Habits

export const addHabit = what => {
  const lastHabit = realm.objects('Habit').sorted('when', true)[0];
  const when = lastHabit ? lastHabit.when + 1 : 1;
  realm.write(() => {
    realm.create('Habit', {id: Date.now(), when, what});
  });
};

export const getEveryHabit = () => {
  return realm.objects('Habit').sorted('when');
};

export const getHabit = id => {
  return realm.objectForPrimaryKey('Habit', id);
};

export const updateHabit = (id, when, what) => {
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);
    habit.when = when;
    habit.what = what;
  });
};

export const deleteHabit = id => {
  realm.write(() => {
    const habit = realm.objectForPrimaryKey('Habit', id);
    realm.delete(habit);
  });
};

// Weights

export const addWeight = (when, what) => {
  realm.write(() => {
    realm.create('Weight', {id: Date.now(), when, what});
  });
};

export const getEveryWeight = () => {
  return realm.objects('Weight').sorted('when', true);
};

export const getWeight = id => {
  return realm.objectForPrimaryKey('Weight', id);
};

export const updateWeight = (id, when, what) => {
  realm.write(() => {
    const weight = realm.objectForPrimaryKey('Weight', id);
    weight.when = when;
    weight.what = what;
  });
};

export const deleteWeight = id => {
  realm.write(() => {
    const weight = realm.objectForPrimaryKey('Weight', id);
    realm.delete(weight);
  });
};

// Costs

export const addCost = (when, what) => {
  realm.write(() => {
    realm.create('Cost', {id: Date.now(), when, what});
  });
};

export const getEveryCost = () => {
  return realm.objects('Cost').sorted('when', true);
};

export const getCost = id => {
  return realm.objectForPrimaryKey('Cost', id);
};

export const updateCost = (id, when, what) => {
  realm.write(() => {
    const cost = realm.objectForPrimaryKey('Cost', id);
    cost.when = when;
    cost.what = what;
  });
};

export const deleteCost = id => {
  realm.write(() => {
    const cost = realm.objectForPrimaryKey('Cost', id);
    realm.delete(cost);
  });
};

// Plans

export const addPlan = (when, what) => {
  realm.write(() => {
    realm.create('Plan', {id: Date.now(), when, what});
  });
};

export const getEveryPlan = () => {
  return realm.objects('Plan').sorted('when');
};

export const getPlan = id => {
  return realm.objectForPrimaryKey('Plan', id);
};

export const updatePlan = (id, when, what) => {
  realm.write(() => {
    const plan = realm.objectForPrimaryKey('Plan', id);
    plan.when = when;
    plan.what = what;
  });
};

export const deletePlan = id => {
  realm.write(() => {
    const plan = realm.objectForPrimaryKey('Plan', id);
    realm.delete(plan);
  });
};

// Tasks

export const addTask = what => {
  const lastTask = realm.objects('Task').sorted('when', true)[0];
  const when = lastTask ? lastTask.when + 1 : 1;
  realm.write(() => {
    realm.create('Task', {id: Date.now(), when, what});
  });
};

export const getEveryTask = () => {
  return realm.objects('Task').sorted('when');
};

export const getTask = id => {
  return realm.objectForPrimaryKey('Task', id);
};

export const updateTask = (id, when, what) => {
  realm.write(() => {
    const task = realm.objectForPrimaryKey('Task', id);
    task.when = when;
    task.what = what;
  });
};

export const deleteTask = id => {
  realm.write(() => {
    const task = realm.objectForPrimaryKey('Task', id);
    realm.delete(task);
  });
};
