import { TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import LogoutScreen from '../../screens/LogoutScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../custom/CustomDrawer';
import LinearGradient from 'react-native-linear-gradient';
import LeadGeneration from '../../screens/LeadGeneration';
import LeadFollowup from '../../screens/LeadFollowup';
const Drawer = createDrawerNavigator();

const LeadDrawer = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity
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
          name="Lead Generation"
          component={LeadGeneration}
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
        <Drawer.Screen
          name="Lead Followup"
          component={LeadFollowup}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="call-outline" size={22} color={color} />
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
}

export default LeadDrawer