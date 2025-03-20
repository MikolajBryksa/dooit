import {StyleSheet} from 'react-native';

export const COLORS = {
  primary: '#836FFF',
  primary50: '#836FFF50',
  primary25: '#836FFF25',
  secondary: '#15F5BA',
  text: '#F0F3FF',
  background: '#211951',
};

export const DIMENSIONS = {
  height: 60,
  padding: 10,
  margin: 5,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DIMENSIONS.padding,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: DIMENSIONS.height,
  },
  card: {
    width: '100%',
    marginBottom: DIMENSIONS.padding,
  },
  cardChecked: {
    width: '100%',
    marginBottom: DIMENSIONS.padding,
    opacity: 0.5,
  },
  chip: {
    marginBottom: DIMENSIONS.padding,
  },
  time: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    marginVertical: DIMENSIONS.margin,
  },
  button: {
    marginVertical: DIMENSIONS.padding,
  },
  divider: {
    marginVertical: DIMENSIONS.margin,
  },
  gap: {
    height: DIMENSIONS.margin * 3,
  },
  noProgress: {
    marginBottom: DIMENSIONS.padding,
  },
  modal: {
    backgroundColor: 'white',
    margin: DIMENSIONS.padding,
    paddingTop: DIMENSIONS.padding,
    paddingBottom: DIMENSIONS.margin,
    borderRadius: 12,
  },
  calendar: {
    height: DIMENSIONS.height * 7,
  },
});
