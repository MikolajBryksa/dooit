import React, {useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from 'react-native-paper';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const Banner = React.memo(({unitId, enabled = true}) => {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const adsEnabled = useSelector(state => state.settings.adsEnabled);
  const theme = useTheme();

  if (!adsEnabled || !enabled) return null;

  return (
    <View
      style={{
        minHeight: bannerLoaded ? 50 : 0,
        borderTopWidth: bannerLoaded ? 2 : 0,
        borderTopColor: theme.colors.background,
      }}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setBannerLoaded(true)}
        onAdFailedToLoad={() => setBannerLoaded(false)}
      />
    </View>
  );
});

export default Banner;
