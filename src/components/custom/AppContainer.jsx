import React from 'react';
import { View, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import { isTablet, getMaxContentWidth } from '../../utils/responsive';

/**
 * Balanced tablet layout
 * - Phone  → full width
 * - Tablet → elegant centered card (500-580px)
 */
const AppContainer = ({ children }) => {
  const { width, height } = useWindowDimensions();
  const maxWidth = getMaxContentWidth(width);

  if (!isTablet) {
    return <View style={styles.phone}>{children}</View>;
  }

  return (
    <View style={styles.tabletOuter}>
      <View
        style={[
          styles.tabletInner,
          {
            width: Math.min(width, maxWidth),
            maxHeight: height,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  phone: {
    flex: 1,
  },
  tabletOuter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#EEF2F7',
  },
  tabletInner: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});

export default AppContainer;