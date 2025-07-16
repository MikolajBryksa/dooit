import realm from '@/storage/schemas';

export const getTemp = () => {
  const temp = realm.objects('Temp')[0];
  if (!temp) return null;

  return {
    id: temp.id,
    selectedDay: temp.selectedDay,
  };
};

export const updateTemp = updates => {
  let updatedTemp;
  realm.write(() => {
    updatedTemp = realm.create('Temp', {id: 1, ...updates}, 'modified');
  });
  return updatedTemp;
};

export const getTempValue = key => {
  const temp = getTemp();
  return temp ? temp[key] : null;
};

export const updateTempValue = (key, value) => {
  const updates = {[key]: value};
  return updateTemp(updates);
};
