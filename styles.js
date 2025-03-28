import {StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.dimensions.padding,
      backgroundColor: theme.colors.background,
    },
    title: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: theme.dimensions.height / 2,
      marginBottom: theme.dimensions.margin,
    },
    card: {
      width: '100%',
      marginBottom: theme.dimensions.padding,
    },
    cardChecked: {
      width: '100%',
      marginBottom: theme.dimensions.padding,
      opacity: 0.5,
    },
    chip: {
      marginBottom: theme.dimensions.padding,
      borderColor: theme.colors.surface,
      borderWidth: 2,
      borderRadius: 12,
    },
    time: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressBar: {
      marginVertical: theme.dimensions.margin,
    },
    progressExcess: {
      color: theme.colors.secondary,
    },
    button: {
      marginVertical: theme.dimensions.padding,
      backgroundColor: theme.colors.primary,
    },
    divider: {
      marginVertical: theme.dimensions.margin,
      backgroundColor: theme.colors.outline,
    },
    gap: {
      height: theme.dimensions.margin * 3,
    },
    noProgress: {
      marginBottom: theme.dimensions.padding,
      color: theme.colors.onSurface,
    },
    modal: {
      backgroundColor: theme.colors.surface,
      margin: theme.dimensions.padding,
      paddingTop: theme.dimensions.padding,
      paddingBottom: theme.dimensions.margin,
      borderRadius: 12,
    },
    daysSelector: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      flexDirection: 'row',
      width: '100%',
      marginTop: theme.dimensions.margin,
    },
    calendar: {
      height: theme.dimensions.height * 7,
    },
  });
};
