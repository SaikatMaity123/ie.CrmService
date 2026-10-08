import React from 'react';
import {
  View,
  StatusBar,
} from 'react-native';

import {
  createDrawerNavigator,
} from '@react-navigation/drawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import DashBoard from '../../screens/DashBoard';
import LogoutScreen from '../../screens/LogoutScreen';

import CustomServiceDrawer from '../custom/CustomServiceDrawer';

const Drawer = createDrawerNavigator();

const DrawerDash = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8FAFC',
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Drawer.Navigator
        initialRouteName="Dashboard"

        drawerContent={(props) => (
          <CustomServiceDrawer {...props} />
        )}

        screenOptions={{
          headerShown: false,

          drawerType: 'front',

          drawerStyle: {
            width: '73%',
            backgroundColor: 'transparent',
            borderTopRightRadius: 30,
            borderBottomRightRadius: 30,
            overflow: 'hidden',
          },

          overlayColor: 'rgba(20,25,55,0.48)',

          drawerActiveBackgroundColor:
            'rgba(232,225,255,0.82)',

          drawerActiveTintColor:
            '#5B45E6',

          drawerInactiveTintColor:
            '#5E6B99',

          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '800',
            marginLeft: -8,
            includeFontPadding: false,
          },

          drawerItemStyle: {
            borderRadius: 22,
            paddingHorizontal: 8,
            marginVertical: 5,
            height: 68,
            justifyContent: 'center',
          },

          sceneStyle: {
            backgroundColor: '#F8FAFC',
          },
        }}
      >

        {/* Dashboard */}

        <Drawer.Screen
          name="Dashboard"
          component={DashBoard}
          options={{
            drawerLabel: 'Dashboard',

            sceneStyle: {
              backgroundColor: '#F8FAFC',
            },

            drawerIcon: ({
              color,
              focused,
            }) => (
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',

                  backgroundColor: focused
                    ? 'rgba(213,204,255,0.85)'
                    : 'rgba(239,242,255,0.75)',

                  borderWidth: 1,
                  borderColor:
                    'rgba(255,255,255,0.85)',
                }}
              >
                <Ionicons
                  name="grid-outline"
                  size={25}
                  color={color}
                />
              </View>
            ),
          }}
        />

        {/* Logout */}

        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          options={{
            drawerLabel: 'Log Out',

            sceneStyle: {
              backgroundColor: '#F8FAFC',
            },

            drawerIcon: () => (
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',

                  backgroundColor:
                    'rgba(255,239,244,0.85)',

                  borderWidth: 1,
                  borderColor:
                    'rgba(255,255,255,0.85)',
                }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={25}
                  color="#EF476F"
                />
              </View>
            ),

            drawerLabelStyle: {
              fontSize: 16,
              fontWeight: '800',
              marginLeft: -8,
              color: '#EF476F',
              includeFontPadding: false,
            },

            drawerItemStyle: {
              borderRadius: 22,
              paddingHorizontal: 8,
              marginVertical: 5,
              height: 68,
              justifyContent: 'center',
              backgroundColor:
                'rgba(255,246,248,0.70)',
            },
          }}
        />

      </Drawer.Navigator>
    </View>
  );
};

export default DrawerDash;