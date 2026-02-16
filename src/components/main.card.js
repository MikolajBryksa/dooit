import React from 'react';
import {Card} from 'react-native-paper';
import {View, Animated} from 'react-native';
import {useStyles} from '@/styles';
import {useTheme} from 'react-native-paper';

const MainCard = ({
  outline = false,
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

  const cardStyle = [
    styles.card,
    outline && styles.card__outline,
    style,
  ].filter(Boolean);

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
    <Card style={cardStyle}>
      <ContentWrapper style={wrapperStyle}>
        <Card.Content style={styles.card__center}>
          {/* Icon container - reserved space */}
          <View style={styles.card__iconContainer}>{iconContent}</View>

          {/* Subtitle container - reserved space */}
          <View style={styles.card__subtitleContainer}>
            {centerAndHighlightText(subtitleContent)}
          </View>

          {/* Title container - reserved space for 2 lines */}
          <View style={styles.card__titleContainer}>
            {centerText(titleContent)}
          </View>

          {/* Text content - optional, no reserved space */}
          {textContent && (
            <View style={styles.card__textContainer}>{textContent}</View>
          )}

          {/* Buttons container - reserved space */}
          <View style={styles.card__buttonsContainer}>{buttonsContent}</View>
        </Card.Content>
      </ContentWrapper>
    </Card>
  );
};

export default MainCard;
