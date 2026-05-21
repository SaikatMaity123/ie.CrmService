import {View, Text} from 'react-native';
import React from 'react';
import DrawerNavigator from '../components/drawer/DrawerNavigator';
import {AppProvider} from '../components/custom/AppContext';

const AppNavScreen = () => {
  return (
    <AppProvider>
      <DrawerNavigator />
    </AppProvider>
  );
};

export default AppNavScreen;
