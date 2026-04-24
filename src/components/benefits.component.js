import React, {useState, useEffect, useRef} from 'react';
import {View, Animated, PanResponder, useWindowDimensions} from 'react-native';
import {Text, Icon, useTheme} from 'react-native-paper';
import {useTranslation} from 'react-i18next';
import {useStyles} from '@/styles';

const FEATURE_ICONS = [
  'lightning-bolt',
  'chart-arc',
  'tune-variant',
  'rocket-launch',
];
const AUTOPLAY_INTERVAL_MS = 3500;
const SLIDE_ANIMATION_DURATION = 300;
const SWIPE_THRESHOLD_RATIO = 1 / 3;

const Benefits = ({paused = false}) => {
  const {t} = useTranslation();
  const styles = useStyles();
  const theme = useTheme();
  const {width: screenWidth} = useWindowDimensions();

  const features = t('onboarding.features', {returnObjects: true});
  const cardCount = features.length;

  const extendedCards = useRef([
    features[cardCount - 1],
    ...features,
    features[0],
  ]).current;

  const [dotIndex, setDotIndex] = useState(0);
  const translateX = useRef(new Animated.Value(-screenWidth)).current;

  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const autoplayTimerRef = useRef(null);
  const screenWidthRef = useRef(screenWidth);
  const cardCountRef = useRef(cardCount);

  useEffect(() => {
    screenWidthRef.current = screenWidth;
  }, [screenWidth]);

  const positionForIndex = index => -(index + 1) * screenWidthRef.current;

  const slideTo = useRef(null);
  slideTo.current = (targetX, onComplete) => {
    isAnimatingRef.current = true;
    Animated.timing(translateX, {
      toValue: targetX,
      duration: SLIDE_ANIMATION_DURATION,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) onComplete?.();
      isAnimatingRef.current = false;
    });
  };

  const wrapToFirstCard = useRef(null);
  wrapToFirstCard.current = () => {
    const width = screenWidthRef.current;
    const count = cardCountRef.current;
    slideTo.current(-(count + 1) * width, () => {
      translateX.setValue(-width);
      activeIndexRef.current = 0;
      setDotIndex(0);
    });
  };

  const wrapToLastCard = useRef(null);
  wrapToLastCard.current = () => {
    const width = screenWidthRef.current;
    const count = cardCountRef.current;
    slideTo.current(0, () => {
      translateX.setValue(-count * width);
      activeIndexRef.current = count - 1;
      setDotIndex(count - 1);
    });
  };

  const advanceToNextCard = useRef(null);
  advanceToNextCard.current = () => {
    const nextIndex = (activeIndexRef.current + 1) % cardCountRef.current;
    if (nextIndex === 0) {
      wrapToFirstCard.current();
    } else {
      slideTo.current(positionForIndex(nextIndex), () => {
        activeIndexRef.current = nextIndex;
        setDotIndex(nextIndex);
      });
    }
  };

  const goToPreviousCard = useRef(null);
  goToPreviousCard.current = () => {
    const currentIndex = activeIndexRef.current;
    if (currentIndex === 0) {
      wrapToLastCard.current();
    } else {
      const previousIndex = currentIndex - 1;
      slideTo.current(positionForIndex(previousIndex), () => {
        activeIndexRef.current = previousIndex;
        setDotIndex(previousIndex);
      });
    }
  };

  const startAutoplay = useRef(null);
  startAutoplay.current = () => {
    clearInterval(autoplayTimerRef.current);
    autoplayTimerRef.current = setInterval(() => {
      if (!isAnimatingRef.current) {
        advanceToNextCard.current();
      }
    }, AUTOPLAY_INTERVAL_MS);
  };

  useEffect(() => {
    startAutoplay.current();
    return () => clearInterval(autoplayTimerRef.current);
  }, []);

  useEffect(() => {
    if (paused) {
      clearInterval(autoplayTimerRef.current);
    } else {
      startAutoplay.current();
    }
  }, [paused]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, {dx, dy}) =>
        !isAnimatingRef.current &&
        Math.abs(dx) > Math.abs(dy) &&
        Math.abs(dx) > 5,
      onPanResponderGrant: () => {
        clearInterval(autoplayTimerRef.current);
      },
      onPanResponderMove: (_, {dx}) => {
        const dragBasePosition =
          -(activeIndexRef.current + 1) * screenWidthRef.current;
        translateX.setValue(dragBasePosition + dx);
      },
      onPanResponderRelease: (_, {dx}) => {
        const swipeThreshold = screenWidthRef.current * SWIPE_THRESHOLD_RATIO;

        if (dx < -swipeThreshold) {
          advanceToNextCard.current();
        } else if (dx > swipeThreshold) {
          goToPreviousCard.current();
        } else {
          Animated.spring(translateX, {
            toValue: -(activeIndexRef.current + 1) * screenWidthRef.current,
            useNativeDriver: true,
          }).start();
        }

        startAutoplay.current();
      },
    }),
  ).current;

  const iconForExtendedIndex = extendedIndex =>
    FEATURE_ICONS[(extendedIndex - 1 + cardCount) % cardCount];

  return (
    <View style={styles.carousel}>
      <View style={[styles.carousel__list, {overflow: 'hidden'}]}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{flexDirection: 'row', transform: [{translateX}]}}>
          {extendedCards.map((card, extendedIndex) => (
            <View
              key={extendedIndex}
              style={[styles.center, {width: screenWidth}]}>
              <View style={styles.carousel__card__inner}>
                <Icon
                  source={iconForExtendedIndex(extendedIndex)}
                  size={32}
                  color={theme.colors.primary}
                />
                <Text
                  variant="titleMedium"
                  style={styles.carousel__card__title}>
                  {card.title}
                </Text>
                <Text variant="bodySmall" style={styles.carousel__card__body}>
                  {card.body}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
      <View style={styles.carousel__dots}>
        {features.map((_, index) => (
          <View
            key={index}
            style={[
              styles.carousel__dot,
              index === dotIndex
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
