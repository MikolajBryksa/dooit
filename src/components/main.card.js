import React from 'react';
import {Card} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useStyles} from '@/styles';
import {useTheme} from 'react-native-paper';
import GradientCard from '../gradients/card.gradient';

const MainCard = ({
  style = null,
  animatedStyle = null,
  iconContent = null,
  subtitleContent = null,
  titleContent = null,
  textContent = null,
  buttonsContent = null,
}) => {
  const styles = useStyles();
  const theme = useTheme();

  const ContentWrapper = animatedStyle ? Animated.View : View;
  const wrapperStyle = animatedStyle || {};

  // Helper to add textAlign: 'center' to Text components
  const centerText = content => {
    if (!content) return null;
    if (React.isValidElement(content)) {
      const existingStyle = content.props.style || {};
      return React.cloneElement(content, {
        style: [{textAlign: 'center'}, existingStyle],
      });
    }
    return content;
  };

  // Helper to add textAlign: 'center' and primary color to subtitle
  const centerAndHighlightText = content => {
    if (!content) return null;
    if (React.isValidElement(content)) {
      const existingStyle = content.props.style || {};
      return React.cloneElement(content, {
        style: [
          {textAlign: 'center', color: theme.colors.primary},
          existingStyle,
        ],
      });
    }
    return content;
  };

  return (
    <GradientCard style={style}>
      <ContentWrapper style={wrapperStyle}>
        <Card.Content style={styles.card__center}>
          {/* Icon container - reserved space */}
          <View style={styles.card__iconContainer}>{iconContent}</View>

          {/* Subtitle container - reserved space */}
          <View style={styles.card__subtitleContainer}>
            {centerAndHighlightText(subtitleContent)}
          </View>

          {/* Title container - reserved space */}
          <View style={styles.card__titleContainer}>
            {centerText(titleContent)}
          </View>

          {/* Text content */}
          {textContent && (
            <View style={styles.card__textContainer}>{textContent}</View>
          )}

          {/* Buttons container */}
          {buttonsContent && (
            <View style={styles.card__buttonsContainer}>{buttonsContent}</View>
          )}
        </Card.Content>
      </ContentWrapper>
    </GradientCard>
  );
};

export default MainCard;
