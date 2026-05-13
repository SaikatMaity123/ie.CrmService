import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../custom/AppContext';
import { useNavigation } from '@react-navigation/native';
import LogoutScreen from '../../screens/LogoutScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import MasterDashBoard from '../../screens/MasterDashBoard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import { CommonActions } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import UserInfoScreen from '../../screens/UserInfoScreen';
import LinearGradient from 'react-native-linear-gradient';
import MasterClientDashBoard from '../../screens/MasterClientDashBoard';
const Drawer = createDrawerNavigator();


const MasterDrawer = () => {
   return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity
              //onPress={() => navigation.goBack()}
              onPress={() => navigation.navigate('AppNavDash')}
              style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={24} color='#ffffff' />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}>
              <Ionicons name="menu" size={24} color='#ffffff' />
            </TouchableOpacity>
          ),
        })}
        drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen
          name="Master Dashboard"
          //component={BottomTabNavigator}
          //component={MasterDashBoard}
          component={MasterClientDashBoard}
          //options={{headerShown: true}}
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
            headerTintColor: '#ffffff',
          }}
        />
        {/* <Drawer.Screen
          name="User Info"
          component={UserInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        /> */}
        {/* {useSubmenu.map(renderScreen)} */}
        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          // options={{headerShown: true}}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="exit-outline" size={22} color={color} />
            ),
          }}
        />
        {/* <Drawer.Screen name="Article" component={Article} /> */}
      </Drawer.Navigator>
    </>
  );
};

export default MasterDrawer;
