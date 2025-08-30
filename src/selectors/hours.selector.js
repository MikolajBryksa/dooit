import React from 'react';
import {View} from 'react-native';
import {Chip} from 'react-native-paper';
import {useSelector} from 'react-redux';

const HoursSelector = ({repeatHours, setRepeatHours}) => {
  const clockFormat = useSelector(state => state.settings.clockFormat);
  const to24h = str => {
    if (clockFormat !== '12h') return str;
    const [time, period] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleToggleHour = hourStr => {
    const hour24 = to24h(hourStr);
    if (Array.isArray(repeatHours)) {
      setRepeatHours(
        repeatHours.includes(hour24)
          ? repeatHours.filter(h => h !== hour24)
          : [...repeatHours, hour24],
      );
    } else {
      setRepeatHours([hour24]);
    }
  };

  const timeSlots = [];
  if (clockFormat === '12h') {
    for (let h = 5; h <= 23; h++) {
      let hour12 = h % 12 === 0 ? 12 : h % 12;
      let period = h < 12 ? 'AM' : 'PM';
      timeSlots.push(`${hour12}:00 ${period}`);
      timeSlots.push(`${hour12}:30 ${period}`);
    }
  } else {
    for (let h = 5; h <= 23; h++) {
      timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
      timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
      {timeSlots.map(hourStr => {
        const hour24 = to24h(hourStr);
        const selected =
          Array.isArray(repeatHours) && repeatHours.includes(hour24);
        return (
          <Chip
            key={hourStr}
            style={{margin: 4}}
            selected={selected}
            onPress={() => handleToggleHour(hourStr)}>
            {hourStr}
          </Chip>
        );
      })}
    </View>
  );
};

export default HoursSelector;
