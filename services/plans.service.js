import realm from '../storage/schemas';
import {getNextId} from '../utils';

export const addPlan = (when, what, time) => {
  const id = getNextId('Plan');
  when = new Date(when);

  let newPlan;
  realm.write(() => {
    newPlan = realm.create('Plan', {
      id,
      when,
      what,
      time,
    });
  });
  return newPlan;
};

export const getEveryPlan = () => {
  const sortFields = [
    ['when', false],
    ['time', false],
    ['id', true],
  ];
  const results = realm.objects('Plan').sorted(sortFields);
  return results.slice(0, 90);
};

export const getPlan = id => {
  const plan = realm.objectForPrimaryKey('Plan', id);
  if (!plan) return null;

  const serializablePlan = {
    ...plan,
    when: plan.when instanceof Date ? plan.when.toISOString() : plan.when,
  };

  return serializablePlan;
};

export const updatePlan = (id, when, what, time) => {
  when = new Date(when);
  let updatedPlan;
  realm.write(() => {
    updatedPlan = realm.create('Plan', {id, when, what, time}, 'modified');
  });
  return updatedPlan;
};

export const deletePlan = id => {
  let deletedPlan;
  realm.write(() => {
    const planToDelete = realm.objectForPrimaryKey('Plan', id);
    if (planToDelete) {
      deletedPlan = {...planToDelete};
      realm.delete(planToDelete);
    }
  });
  return deletedPlan;
};
