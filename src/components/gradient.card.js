import React from 'react';
import {Card} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from 'react-native-paper';
import {useStyles} from '@/styles';

const GradientCard = ({style = null, children}) => {
  const theme = useTheme();
  const styles = useStyles();

  const cardStyle = [styles.card, styles.card__modern, style].filter(Boolean);

  return (
    <Card style={cardStyle}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.background]}
        locations={[0, 1]}
        start={{x: 0.5, y: 0}}
        end={{x: 0.5, y: 1}}
        style={styles.card__gradient}>
        {children}
      </LinearGradient>
    </Card>
  );
};

export default GradientCard;
