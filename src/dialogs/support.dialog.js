import React, {useState, useEffect, useRef} from 'react';
import {Button, Text} from 'react-native-paper';
import {Linking} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import DialogComponent from '@/components/dialog.component';
import {AD_UNITS} from '@/services/ads.service';

const SupportDialog = ({visible, onDismiss, onDone}) => {
  const {t} = useTranslation();
  const userName = useSelector(state => state.settings.userName);

  const [adLoaded, setAdLoaded] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adError, setAdError] = useState(false);
  const rewardedRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    setAdLoaded(false);
    setAdWatched(false);
    setAdError(false);

    const rewarded = RewardedAd.createForAdRequest(AD_UNITS.REWARDED_SUPPORT);
    rewardedRef.current = rewarded;

    const unsubLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => setAdLoaded(true),
    );
    const unsubEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => setAdWatched(true),
    );
    const unsubError = rewarded.addAdEventListener(AdEventType.ERROR, () =>
      setAdError(true),
    );
    const unsubClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      setAdError(false);
      const next = RewardedAd.createForAdRequest(AD_UNITS.REWARDED_SUPPORT);
      rewardedRef.current = next;
      next.addAdEventListener(RewardedAdEventType.LOADED, () =>
        setAdLoaded(true),
      );
      next.addAdEventListener(AdEventType.ERROR, () => setAdError(true));
      next.load();
    });

    rewarded.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubError();
      unsubClosed();
    };
  }, [visible]);

  const handleSupport = () => {
    Linking.openURL('https://buymeacoffee.com/dooit');
    onDone();
  };

  const handleWatchAd = async () => {
    if (rewardedRef.current && adLoaded) {
      await rewardedRef.current.show();
    }
  };

  return (
    <DialogComponent
      visible={visible}
      onDismiss={onDismiss}
      title={t('title.support')}>
      <DialogComponent.Content>
        <Text variant="bodyMedium">{t('message.support', {userName})}</Text>
      </DialogComponent.Content>
      <DialogComponent.Actions>
        <Button onPress={onDismiss}>{t('button.cancel')}</Button>
        <Button
          onPress={handleWatchAd}
          disabled={!adLoaded || adWatched || adError}
          loading={!adLoaded && !adWatched && !adError}>
          {adWatched ? t('button.thanks') : t('button.watch')}
        </Button>
        <Button onPress={handleSupport}>{t('button.buy')}</Button>
      </DialogComponent.Actions>
    </DialogComponent>
  );
};

export default SupportDialog;
