import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Chip, SegmentedButtons, useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const HoursSelector = ({repeatHours, setRepeatHours, onResetRef}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const clockFormat = useSelector(state => state.settings.clockFormat);

  // 'morning' | 'afternoon' | 'evening'
  const [partOfDay, setPartOfDay] = useState('morning');

  useEffect(() => {
    // Expose reset method via ref
    if (onResetRef) {
      onResetRef.current = () => {
        setRepeatHours([]);
      };
    }
  }, [onResetRef, setRepeatHours]);

  const to24h = str => {
    if (!/AM|PM/.test(str)) return str;
    const [time, period] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const toDisplay = (h, m) => {
    if (clockFormat === '12 h') {
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleToggleHour = hourStr => {
    const hour24 = to24h(hourStr);
    setRepeatHours(
      repeatHours.includes(hour24)
        ? repeatHours.filter(h => h !== hour24)
        : [...repeatHours, hour24],
    );
  };

  const allSlots = [];
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      allSlots.push({h, m});
    }
  }

  const inMorning = ({h}) => h >= 5 && h < 12; // 05:00–11:45
  const inAfternoon = ({h}) => h >= 12 && h < 18; // 12:00–17:45
  const inEvening = ({h}) => h >= 18 && h <= 23; // 18:00–23:45

  const filterFn =
    partOfDay === 'morning'
      ? inMorning
      : partOfDay === 'afternoon'
      ? inAfternoon
      : inEvening;

  const visibleSlots = allSlots.filter(filterFn);

  return (
    <View>
      <SegmentedButtons
        value={partOfDay}
        onValueChange={setPartOfDay}
        style={styles.segmentButtons}
        buttons={[
          {value: 'morning', label: t('hour.morning')},
          {value: 'afternoon', label: t('hour.afternoon')},
          {value: 'evening', label: t('hour.evening')},
        ]}
      />

      <View style={{flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16}}>
        {visibleSlots.map(({h, m}) => {
          const display = toDisplay(h, m);
          const hour24 = `${h.toString().padStart(2, '0')}:${m
            .toString()
            .padStart(2, '0')}`;
          const selected = repeatHours.includes(hour24);
          return (
            <Chip
              key={hour24}
              style={{
                margin: 4,
                borderWidth: 1,
                borderColor: selected
                  ? theme.colors.outline
                  : theme.colors.secondaryContainer,
              }}
              mode={selected ? 'outlined' : 'flat'}
              selected={false}
              onPress={() => handleToggleHour(display)}>
              {display}
            </Chip>
          );
        })}
      </View>
    </View>
  );
};

export default HoursSelector;
