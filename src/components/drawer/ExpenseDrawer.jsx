import {View, Text,TouchableOpacity} from 'react-native';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomExpense from '../custom/CustomExpense';
import ExpenseScreen from '../../screens/ExpenseScreen';
import ExpenseList from '../../screens/ExpenseList';
import LogoutScreen from '../../screens/LogoutScreen';
import RequestExpenseApproval from '../../screens/RequestExpenseApproval';

const Drawer = createDrawerNavigator();

const ExpenseDrawer = ({navigation}) => {
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
      drawerContent={props => <CustomExpense {...props} />}>
      <Drawer.Screen
        name="Expense DashBoard"
        //component={BottomTabNavigator}
        component={ExpenseScreen}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <AntDesign name="dashboard" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Expense List"
        //component={BottomTabNavigator}
        component={ExpenseList}
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
        name="Request Expense"
        //component={BottomTabNavigator}
        component={RequestExpenseApproval}
        //options={{headerShown: true}}
        options={{
          drawerIcon: ({color}) => (
            <MaterialCommunityIcons
              name="format-list-checks"
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

export default ExpenseDrawer;
