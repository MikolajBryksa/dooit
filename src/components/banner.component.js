import React, {useState} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {BannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const Banner = ({unitId, enabled = true}) => {
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const adsEnabled = useSelector(state => state.settings.adsEnabled);

  if (!adsEnabled || !enabled) return null;

  return (
    <View style={{minHeight: bannerLoaded ? 50 : 0}}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setBannerLoaded(true)}
        onAdFailedToLoad={() => setBannerLoaded(false)}
      />
    </View>
  );
};

export default Banner;
