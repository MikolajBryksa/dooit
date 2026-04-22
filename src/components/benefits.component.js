import React, {useState, useEffect, useRef} from 'react';
import {View, FlatList, useWindowDimensions} from 'react-native';
import {Text, Icon, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const FEATURE_ICONS = [
  'lightning-bolt',
  'chart-arc',
  'tune-variant',
  'rocket-launch',
];
const AUTOPLAY_INTERVAL = 3500;
const REPEAT_COUNT = 50;

const Benefits = () => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const {width} = useWindowDimensions();
  const flatListRef = useRef(null);
  const timerRef = useRef(null);
  const isPaused = useRef(false);
  const isDragging = useRef(false);

  const features = t('onboarding.features', {returnObjects: true});
  const cardCount = features.length;

  // Repeat features many times so forward scrolling never hits the end.
  // Starting from the middle means ~100 swipes in either direction before edge.
  const extendedData = useRef(
    Array.from({length: REPEAT_COUNT}, () => features).flat(),
  ).current;

  const startIndex = Math.floor(REPEAT_COUNT / 2) * cardCount;
  const [scrollIndex, setScrollIndex] = useState(startIndex);
  const activeIndex = scrollIndex % cardCount;

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPaused.current) {
        setScrollIndex(prev => {
          const next = prev + 1;
          flatListRef.current?.scrollToIndex({index: next, animated: true});
          return next;
        });
      }
    }, AUTOPLAY_INTERVAL);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTouchStart = () => {
    isPaused.current = true;
  };

  const handleTouchEnd = () => {
    // Only resume if user isn't mid-swipe — momentum scroll handles that case
    if (!isDragging.current) {
      isPaused.current = false;
    }
  };

  const handleScrollBeginDrag = () => {
    isDragging.current = true;
    isPaused.current = true;
  };

  const handleMomentumScrollEnd = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setScrollIndex(index);
    isDragging.current = false;
    isPaused.current = false;
    resetTimer();
  };

  const handleScrollEndDrag = event => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setScrollIndex(index);
    isDragging.current = false;
    isPaused.current = false;
    resetTimer();
  };

  const renderItem = ({item, index}) => (
    <View style={[styles.center, {width}]}>
      <View style={styles.carousel__card__inner}>
        <Icon
          source={FEATURE_ICONS[index % cardCount]}
          size={32}
          color={theme.colors.primary}
        />
        <Text variant="titleMedium" style={styles.carousel__card__title}>
          {item.title}
        </Text>
        <Text variant="bodySmall" style={styles.carousel__card__body}>
          {item.body}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.carousel}>
      <FlatList
        ref={flatListRef}
        data={extendedData}
        horizontal
        pagingEnabled
        initialScrollIndex={startIndex}
        showsHorizontalScrollIndicator={false}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({length: width, offset: width * i, index: i})}
        scrollEventThrottle={16}
        bounces={false}
        style={styles.carousel__list}
      />
      <View style={styles.carousel__dots}>
        {features.map((_, i) => (
          <View
            key={i}
            style={[
              styles.carousel__dot,
              i === activeIndex
                ? styles.carousel__dot__active
                : styles.carousel__dot__inactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default Benefits;
