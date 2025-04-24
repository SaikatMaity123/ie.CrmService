import {View, Text,TouchableOpacity} from 'react-native';
import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';
import LogoutScreen from '../../screens/LogoutScreen';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import ReportScreen from '../../screens/ReportScreen';

const Drawer = createDrawerNavigator();
const DCRDrawer = ({navigation}) => {
  return (
    <Drawer.Navigator
      screenOptions={({navigation}) => ({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{marginRight: 15}}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={{marginLeft: 15}}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity>
        ),
      })}
      drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen
        name="Report DashBoard"
        //component={BottomTabNavigator}
        component={ReportScreen}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LogOut"
        component={LogoutScreen}
        // options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="exit-outline" size={22} color={color} />
          ),
        }}
      />
      {/* <Drawer.Screen name="Article" component={Article} /> */}
    </Drawer.Navigator>
  );
};

export default DCRDrawer;
