import realm from '../storage/schemas';

export const getTemp = () => {
  const temp = realm.objects('Temp')[0];
  if (!temp) return null;

  return {
    id: temp.id,
    habitIndex: temp.habitIndex,
    habitPlay: temp.habitPlay,
  };
};

export const updateTemp = (habitIndex, habitPlay) => {
  let updatedTemp;
  realm.write(() => {
    updatedTemp = realm.create(
      'Temp',
      {id: 1, habitIndex, habitPlay},
      'modified',
    );
  });
  return updatedTemp;
};
