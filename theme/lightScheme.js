import {hexToRgba} from '../utils';
import {colors} from './colors';

const backgroundColor = colors.shade1;
const mediumColor = colors.shade2;
const mainColor = colors.shade3;
const textColor = colors.shade4;
const extraColor = colors.extra;

export const lightScheme = {
  primary: mainColor, // buttons
  onPrimary: backgroundColor, // text on buttons
  primaryContainer: backgroundColor, // clock selected background
  onPrimaryContainer: textColor, // clock outline
  surfaceVariant: backgroundColor, // clock and progress backround
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
