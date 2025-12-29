import React, {useEffect, useMemo} from 'react';
import {View, ScrollView} from 'react-native';
import {Chip, useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {useStyles} from '@/styles';

const HoursSelector = ({repeatHours, setRepeatHours, onResetRef}) => {
  const styles = useStyles();
  const theme = useTheme();
  const clockFormat = useSelector(state => state.settings.clockFormat);

  useEffect(() => {
    if (onResetRef) {
      onResetRef.current = () => setRepeatHours([]);
    }
  }, [onResetRef, setRepeatHours]);

  const toDisplay = (h, m) => {
    if (clockFormat === '12 h') {
      const period = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
    }
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const allSlots = useMemo(() => {
    const slots = [];
    for (let h = 5; h <= 23; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour24 = `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}`;
        slots.push({hour24, display: toDisplay(h, m)});
      }
    }
    return slots;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clockFormat]);

  const handleToggleHour = hour24 => {
    setRepeatHours(prev =>
      prev.includes(hour24)
        ? prev.filter(h => h !== hour24)
        : [...prev, hour24],
    );
  };

  return (
    <View style={{marginBottom: 16}}>
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={false}
        style={styles.selector__scroll}>
        <View style={styles.selector__grid}>
          {allSlots.map(({hour24, display}) => {
            const selected = repeatHours.includes(hour24);
            return (
              <Chip
                key={hour24}
                style={[
                  styles.selector__chip,
                  {
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.secondaryContainer,
                  },
                ]}
                mode={selected ? 'outlined' : 'flat'}
                selected={false}
                onPress={() => handleToggleHour(hour24)}>
                {display}
              </Chip>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default HoursSelector;
