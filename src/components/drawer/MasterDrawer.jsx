import {View, Text,TouchableOpacity} from 'react-native';
import React from 'react';
import LogoutScreen from '../../screens/LogoutScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import MasterDashBoard from '../../screens/MasterDashBoard';

const Drawer = createDrawerNavigator();

const MasterDrawer = () => {
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
        name="Master DashBoard"
        //component={BottomTabNavigator}
        component={MasterDashBoard}
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

export default MasterDrawer;
