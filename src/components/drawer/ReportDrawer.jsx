import {View, Text} from 'react-native';
import React, {useEffect, useState} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import CustomOrder from '../custom/CustomOrder';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DCRReport from '../../screens/DCRReport';
import LogoutScreen from '../../screens/LogoutScreen';
import DocMissReport from '../../screens/DocMissReport';
import CallDurationReport from '../../screens/CallDurationReport';
import VisitFrequencyReport from '../../screens/VisitFrequencyReport';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DCRManagerReport from '../../screens/DCRManagerReport';
import CallDurationManager from '../../screens/CallDurationManager';
import DocMissManagerReport from '../../screens/DocMissManagerReport';

const Drawer = createDrawerNavigator();
const ReportDrawer = ({navigation}) => {
  const [useManagerAccess, setuseManagerAccess] = useState('');
  useEffect(() => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setuseManagerAccess(user.ManagerAccess);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <Drawer.Navigator drawerContent={props => <CustomOrder {...props} />}>
      {useManagerAccess ? (
        <Drawer.Screen
          name="DCR Report"
          //component={BottomTabNavigator}
          component={DCRManagerReport}
          //options={{headerShown: true}}
          options={{
            drawerIcon: ({color}) => (
              <AntDesign name="dashboard" size={22} color={color} />
            ),
          }}
        />
        
      ) : (
        <Drawer.Screen
          name="DCR Report"
          //component={BottomTabNavigator}
          component={DCRReport}
          //options={{headerShown: true}}
          options={{
            drawerIcon: ({color}) => (
              <AntDesign name="dashboard" size={22} color={color} />
            ),
          }}
        />
      )}

{useManagerAccess ? (
      <Drawer.Screen
        name="Missed Call Client"
        //component={BottomTabNavigator}
        component={DocMissManagerReport}
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
       ) : (
        <Drawer.Screen
        name="Missed Call Client"
        //component={BottomTabNavigator}
        component={DocMissReport}
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
      )}
       {useManagerAccess ? (
         <Drawer.Screen
         name="Call Duration Report"
         //component={BottomTabNavigator}
         component={CallDurationManager}
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
       ):
       <Drawer.Screen
       name="Call Duration Report"
       //component={BottomTabNavigator}
       component={CallDurationReport}
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
     />}
     
      {/* <Drawer.Screen
        name="Visit Frequency Report"
        //component={BottomTabNavigator}
        component={VisitFrequencyReport}
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
      /> */}
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

export default ReportDrawer;
