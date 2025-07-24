import React from 'react';
import {View} from 'react-native';
import {Chip} from 'react-native-paper';

const HoursSelector = ({repeatHours, setRepeatHours}) => {
  const handleToggleHour = hourStr => {
    if (Array.isArray(repeatHours)) {
      setRepeatHours(
        repeatHours.includes(hourStr)
          ? repeatHours.filter(h => h !== hourStr)
          : [...repeatHours, hourStr],
      );
    } else {
      setRepeatHours([hourStr]);
    }
  };

  const timeSlots = [];
  for (let h = 5; h <= 23; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
      {timeSlots.map(hourStr => (
        <Chip
          key={hourStr}
          style={{margin: 4}}
          selected={Array.isArray(repeatHours) && repeatHours.includes(hourStr)}
          onPress={() => handleToggleHour(hourStr)}>
          {hourStr}
        </Chip>
      ))}
    </View>
  );
};

export default HoursSelector;
