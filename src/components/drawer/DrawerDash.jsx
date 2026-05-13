import {View, Text, StatusBar} from 'react-native';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import DashBoard from '../../screens/DashBoard';
import LogoutScreen from '../../screens/LogoutScreen';
import CustomDrawer from '../custom/CustomDrawer';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomServiceDrawer from '../custom/CustomServiceDrawer';
const Drawer = createDrawerNavigator();
const DrawerDash = () => {
  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <Drawer.Navigator drawerContent={props => <CustomServiceDrawer {...props} />}>
        <Drawer.Screen
          name="Dashboard"
          component={DashBoard}
          options={{
            drawerIcon: ({color}) => (
              <Ionicons name="home-outline" size={22} color={color} />
            ),
            headerBackground: () => (
              <LinearGradient
                colors={['#a9ddfaff', '#005696']} // light → dark
                style={{flex: 1}}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}
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

        {/* <Drawer.Screen
          name="User Info"
          component={UserInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        /> */}
        {/* {modules.map(renderScreen)} */}
        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          options={{
            drawerIcon: ({color}) => (
              <Ionicons name="exit-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
};

export default DrawerDash;
