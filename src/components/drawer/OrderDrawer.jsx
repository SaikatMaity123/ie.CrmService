import {View, Text,TouchableOpacity} from 'react-native';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LogoutScreen from '../../screens/LogoutScreen';

import CustomOrder from '../custom/CustomOrder';
import OrderBookingScreen from '../../screens/OrderBookingScreen';
import OrderList from '../../screens/OrderList';

const Drawer = createDrawerNavigator();
const OrderDrawer = ({navigation}) => {
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
      drawerContent={props => <CustomOrder {...props} />}>
      <Drawer.Screen
        name="Order DashBoard"
        //component={BottomTabNavigator}
        component={OrderBookingScreen}
        //component={OrderBookingScreenNew}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <AntDesign name="dashboard" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Order List"
        //component={BottomTabNavigator}
        component={OrderList}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={22}
              color={color}
            />
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
    </Drawer.Navigator>
  );
};

export default OrderDrawer;
