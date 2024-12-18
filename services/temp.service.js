import realm from '../storage/schemas';

export const getTemp = () => {
  const temp = realm.objects('Temp')[0];
  if (!temp) return null;

  return {
    id: temp.id,
    habitId: temp.habitId,
    habitPlay: temp.habitPlay,
  };
};

export const updateTemp = (habitId, habitPlay) => {
  let updatedTemp;
  realm.write(() => {
    updatedTemp = realm.create('Temp', {id: 1, habitId, habitPlay}, 'modified');
  });
  return updatedTemp;
};
