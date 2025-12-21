import React from 'react';
import {SegmentedButtons, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

const StatusSelector = ({value, onChange}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <SegmentedButtons
      value={value}
      onValueChange={onChange}
      density="small"
      buttons={[
        {
          value: 'skip',
          icon: 'close',
          checkedColor: theme.colors.primary,
          uncheckedColor: theme.colors.primary,
          style: {minWidth: 45},
        },

        {
          value: 'bad',
          icon: 'minus',
          checkedColor: theme.colors.primary,
          uncheckedColor: theme.colors.primary,
          style: {minWidth: 45},
        },
        {
          value: 'good',
          icon: 'check',
          checkedColor: theme.colors.primary,
          uncheckedColor: theme.colors.primary,
          style: {minWidth: 45},
        },
      ]}
    />
  );
};

export default StatusSelector;
