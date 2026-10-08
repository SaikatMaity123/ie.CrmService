import React from 'react';
import { View } from 'react-native';
import DrawerDash from '../components/drawer/DrawerDash';

const AppNavDash = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
      }}
    >
      <DrawerDash />
    </View>
  );
};

export default AppNavDash;