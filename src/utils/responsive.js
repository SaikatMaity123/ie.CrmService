import { Dimensions, PixelRatio } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export const isTablet = DeviceInfo.isTablet();

/**
 * Balanced max width
 * - Phone  → full width
 * - Tablet → nice centered card (not too narrow, not stretched)
 */
export const getMaxContentWidth = (windowWidth = SCREEN_WIDTH) => {
  if (!isTablet) {
    return windowWidth;
  }

  // Sweet spot for Login + most screens on iPad
  if (windowWidth >= 1100) {
    return 580; // large landscape
  }
  if (windowWidth >= 900) {
    return 540; // normal landscape
  }
  return 500; // portrait
};

export const scale = (size) => {
  const newSize = (size * SCREEN_WIDTH) / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const moderateScale = (size, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

export const verticalScale = (size) => {
  return Math.round(PixelRatio.roundToNearestPixel((size * SCREEN_HEIGHT) / BASE_HEIGHT));
};

export const horizontalPadding = isTablet ? 28 : 16;

export const fontSize = {
  xs: moderateScale(11),
  sm: moderateScale(13),
  md: moderateScale(15),
  lg: moderateScale(17),
  xl: moderateScale(20),
  xxl: moderateScale(24),
  title: moderateScale(22),
};