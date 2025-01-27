import realm from '../storage/schemas';
import {getNextId, formatDate} from '../utils';

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
      check: false,
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
  return results;
};

export const getPlan = id => {
  const plan = realm.objectForPrimaryKey('Plan', id);
  if (!plan) return null;

  const serializablePlan = {
    ...plan,
    when: plan.when instanceof Date ? formatDate(plan.when) : plan.when,
  };

  return serializablePlan;
};

export const updatePlan = (id, when, what, time, check) => {
  when = new Date(when);

  let updatedPlan;
  realm.write(() => {
    const plan = realm.objectForPrimaryKey('Plan', id);
    check = check !== null ? check : plan.check;
    updatedPlan = realm.create(
      'Plan',
      {
        id,
        when,
        what,
        time,
        check,
      },
      'modified',
    );
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

export const getTodayPlans = selectedDay => {
  const today = new Date(selectedDay);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const results = realm
    .objects('Plan')
    .filtered('when >= $0 && when < $1', today, tomorrow)
    .sorted('time');
  return results;
};
