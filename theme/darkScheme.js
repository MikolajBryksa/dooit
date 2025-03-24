import {hexToRgba} from '../utils';

const backgroundColor = '#635147';
const mediumColor = '#3C342E';
const mainColor = '#FAEBD7';
const textColor = '#FFFAFA';
const extraColor = '#E5AA70';

export const darkScheme = {
  primary: mainColor, // buttons
  onPrimary: backgroundColor, // text on buttons
  primaryContainer: mainColor, // clock background
  onPrimaryContainer: textColor, // clock outline
  surfaceVariant: backgroundColor, // clock backround
  background: backgroundColor, // app background
  surface: mediumColor, // card backround
  onSurface: textColor, // card text, selected icon text, clock text
  secondaryContainer: backgroundColor, // selected icon background
  onSecondaryContainer: textColor, // selected icon
  secondary: extraColor, // progress bar
  outline: mainColor, // lines
  onSurfaceVariant: mainColor, // icons
  surfaceDisabled: backgroundColor, // disabled button
  onSurfaceDisabled: mainColor, // text on disabled button
  backdrop: hexToRgba(textColor, 0.5), // background under modal
  elevation: {
    level0: 'transparent',
    level1: mediumColor,
    level2: mediumColor, // bottom nav background
    level3: mediumColor,
    level4: mediumColor,
    level5: mediumColor,
  },
};
