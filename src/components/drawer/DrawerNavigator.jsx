import { View, Text } from 'react-native';
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
//import LogoutScreen from '../../screens/LogoutScreen';
import CustomDrawer from '../custom/CustomDrawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DashBoardNew from '../../screens/DashBoardNew';
import LogoutScreen from '../../screens/LogoutScreen';
import UserInfoScreen from '../../screens/UserInfoScreen';
//import DashBoardNew from '../../screens/DashBoardNew';


const Drawer = createDrawerNavigator();

const DrawerNavigator = ({ navigation }) => {
  return (
    <Drawer.Navigator drawerContent={props => <CustomDrawer {...props} />}
    // screenOptions={{
    //   headerShown: false,
    //   drawerActiveBackgroundColor: '#aa18ea',
    //   drawerActiveTintColor: '#fff',
    //   drawerInactiveTintColor: '#333',
    //   drawerLabelStyle: {
    //     marginLeft: -25,
    //     fontFamily: 'Roboto-Medium',
    //     fontSize: 15,
    //   },
    // }}
    >
      <Drawer.Screen
        name="DashBoard"
        //component={BottomTabNavigator}
        //component={DashBoard}
        component={DashBoardNew}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="User Info"
        //component={BottomTabNavigator}
        //component={DashBoard}
        component={UserInfoScreen}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />

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
  );
};

export default DrawerNavigator;
