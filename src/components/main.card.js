import React from 'react';
import {Card} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useStyles} from '@/styles';

const MainCard = ({
  outline = false,
  style = null,
  animatedStyle = null,
  iconContent = null,
  titleContent = null,
  progressContent = null,
  mainContent = null,
  buttonsContent = null,
}) => {
  const styles = useStyles();

  const cardStyle = [
    styles.card,
    outline && styles.card__outline,
    style,
  ].filter(Boolean);

  const ContentWrapper = animatedStyle ? Animated.View : View;
  const wrapperStyle = animatedStyle || {};

  return (
    <Card style={cardStyle}>
      <ContentWrapper style={wrapperStyle}>
        <Card.Content style={styles.card__center}>
          {/* icon container */}
          {iconContent && (
            <View style={styles.card__iconContainer}>{iconContent}</View>
          )}
          {/* title container */}
          {titleContent && (
            <View style={styles.card__titleContainer}>{titleContent}</View>
          )}
          {/* progress container */}
          {progressContent && (
            <View style={styles.card__progressContainer}>
              {progressContent}
            </View>
          )}
          {/* main content container */}
          {mainContent && (
            <View style={styles.card__contentContainer}>{mainContent}</View>
          )}
          {/* buttons container */}
          {buttonsContent && (
            <View style={styles.card__buttonsContainer}>{buttonsContent}</View>
          )}
        </Card.Content>
      </ContentWrapper>
    </Card>
  );
};

export default MainCard;
