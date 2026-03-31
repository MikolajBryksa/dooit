import React from 'react';
import {Text, Button} from 'react-native-paper';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';
import {dismissTip} from '@/services/settings.service';
import {setSettings} from '@/redux/actions';

const TipComponent = ({tipId, children}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settings);

  if (settings?.dismissedTips?.includes(tipId)) {
    return null;
  }

  const handleDismiss = () => {
    const updated = dismissTip(tipId, settings);
    if (updated) {
      dispatch(setSettings(updated));
    }
  };

  return (
    <View style={styles.tip}>
      <View style={styles.tip__content}>
        <Text variant="bodyMedium">{children}</Text>
      </View>
      <View style={styles.tip__footer}>
        <Button mode="text" compact onPress={handleDismiss}>
          {t('button.understand')}
        </Button>
      </View>
    </View>
  );
};

export default TipComponent;
