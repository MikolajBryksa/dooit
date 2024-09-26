import realm from './schemas';
import {habits, weights, costs, plans, tasks} from './initialData';

export const seedDatabase = () => {
  realm.write(() => {
    habits.forEach((habit, index) => {
      realm.create('Habit', {id: index + 1, ...habit});
    });

    weights.forEach((weight, index) => {
      realm.create('Weight', {
        id: index + 1,
        when: new Date(weight.when),
        what: weight.what,
      });
    });

    costs.forEach((cost, index) => {
      realm.create('Cost', {
        id: index + 1,
        when: new Date(cost.when),
        what: cost.what,
      });
    });

    plans.forEach((plan, index) => {
      realm.create('Plan', {
        id: index + 1,
        when: new Date(plan.when),
        what: plan.what,
      });
    });

    tasks.forEach((task, index) => {
      realm.create('Task', {id: index + 1, ...task});
    });
  });
};
