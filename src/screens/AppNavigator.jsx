import React from 'react';
import { View, StyleSheet, Platform, Linking } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

import DashBoard from './DashBoard';
import Attendance from './Attendance';
import AppNavMaster from './AppNavMaster';
import AppNavLead from './AppNavLead';
import ViewCustomerVisitList from './ViewCustomerVisitList';

const DummyComponent = () => null;
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    const handleOpenReports = () => {
        const url = 'https://iecrmservice.iecsl.in/Login';
        Linking.openURL(url).catch(err => console.error('An error occurred', err));
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: styles.tabBar,
            }}>
            {/* Home / Dashboard */}
            <Tab.Screen
                name="Dashboard"
                component={DashBoard}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />

            {/* Attendance Screen */}
            <Tab.Screen
                name="Attendance"
                component={Attendance}
                listeners={({ navigation }) => ({
                    tabPress: async (e) => {
                        try {
                            const value = await AsyncStorage.getItem('DAY_INFO');
                            if (value === null) {
                                // Prevent navigating to Attendance screen if day hasn't started
                                e.preventDefault();
                                // Redirect to Dashboard and open Start Day Modal
                                navigation.navigate('Dashboard', { openStartDayModal: true });
                            }
                            // If value exists, do NOT call e.preventDefault()!
                            // React Navigation will smoothly open the Attendance tab automatically.
                        } catch (error) {
                            console.error('Error reading DAY_INFO:', error);
                        }
                    },
                })}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'calendar' : 'calendar-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />

            {/* Client Visit List */}
            <Tab.Screen
                name="Client Visit List"
                component={ViewCustomerVisitList}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'briefcase' : 'briefcase-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />

            {/* Master */}
            <Tab.Screen
                name="AppNavMaster"
                component={AppNavMaster}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'settings' : 'settings-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />

            {/* Lead Sourcing */}
            <Tab.Screen
                name="AppNavLead"
                component={AppNavLead}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'people' : 'people-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />

            {/* Reports */}
            <Tab.Screen
                name="Reports"
                component={DummyComponent}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        handleOpenReports();
                    },
                }}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={[styles.tabIconWrapper, focused && styles.tabIconActive]}>
                            <Ionicons
                                name={focused ? 'bar-chart' : 'bar-chart-outline'}
                                size={20}
                                color={focused ? '#FFFFFF' : '#8A99AD'}
                            />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 12,
        right: 12,
        height: 64,
        backgroundColor: '#222B35',
        borderRadius: 32,
        borderTopWidth: 0,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    tabIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIconActive: {
        backgroundColor: '#FF5B37',
    },
});