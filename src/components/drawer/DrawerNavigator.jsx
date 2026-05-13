import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfoScreen from '../../screens/UserInfoScreen';
import LogoutScreen from '../../screens/LogoutScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import { useAppContext } from '../custom/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import { BASE_URL } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import { CommonActions } from '@react-navigation/native';
import CRMDashBoard from '../../screens/CRMDashBoard';
import BirthDayScreen from '../../screens/BirthDayScreen';
import { StatusBar, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  
  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />

      <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen
          name="Dashboard"
          component={CRMDashBoard}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
            headerBackground: () => (
              <LinearGradient
                colors={['#a9ddfaff', '#005696']} // light → dark
                style={{ flex: 1 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            ),
            headerTintColor: '#ffffff', // white back button and title
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: 22,
              textAlign: 'center',
              justifyContent: 'center',
            },
          }}
        />
        <Drawer.Screen
          name="BirthDay List"
          component={BirthDayScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="calendar-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="User Info"
          component={UserInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        />
        {/* {modules.map(renderScreen)} */}
        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="exit-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
};

export default DrawerNavigator;
