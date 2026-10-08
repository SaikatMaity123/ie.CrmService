import {View, Text} from 'react-native';
import React from 'react';
import DCRDrawer from '../components/drawer/DCRDrawer';
import {AppProvider} from '../components/custom/AppContext';

const AppNavDCRScreen = () => {
  return (
    <AppProvider>
      <DCRDrawer />
    </AppProvider>
  );
};

export default AppNavDCRScreen;
