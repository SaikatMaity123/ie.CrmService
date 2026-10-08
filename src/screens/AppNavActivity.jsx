import {View, Text} from 'react-native';
import React from 'react';
import {AppProvider} from '../components/custom/AppContext';
import ActivityDrawer from '../components/drawer/ActivityDrawer';

const AppNavActivity = () => {
  return (
    <AppProvider>
      <ActivityDrawer />
    </AppProvider>
  );
};

export default AppNavActivity;
