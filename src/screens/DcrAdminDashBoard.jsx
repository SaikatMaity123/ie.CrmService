import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
    View, Text, TouchableOpacity, StyleSheet,
    Dimensions, BackHandler,
    FlatList,
    ActivityIndicator,
    Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { CommonActions } from '@react-navigation/native';
import { Sales_URL, BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase(
    {
        name: 'CRM_db',
        location: 'default',
    },
    () => {
        //console.log('Database connected!');
    }, //on success
    error => console.log('Database error', error), //on error
);

const DcrAdminDashBoard = () => {
    const navigation = useNavigation(); // <-- Use the useNavigation hook
    const staticMenu = [
        { SubMenu: 'Admin Doctor', SubMenuSRL: 1 },
        { SubMenu: 'Admin Retailer', SubMenuSRL: 2 },
        { SubMenu: 'Admin Others', SubMenuSRL: 3 },
        { SubMenu: 'Admin View Dcr', SubMenuSRL: 4 },
    ];

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
               navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'AppNavScreen' }], // or whatever your screen is
                    }),
                ); // <-- Your main screen
                return true; // prevent default back behavior
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [navigation]),
    );

    const handleNavigation = (item) => {
        switch (item.SubMenu) {
            case 'Admin Doctor':
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'AdminDoctor' }], // or whatever your screen is
                    }),
                );
                break;
            case 'Admin Retailer':
                 navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'AdminRetailer' }], // or whatever your screen is
                    }),
                );
                break;
            case 'Admin Others':
                //navigation.navigate('AdminOthers');
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'AdminOthers' }], // or whatever your screen is
                    }),
                );
                break;

            case 'Admin View Dcr':
                //navigation.navigate('AdminOthers');
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'AdminViewDcr' }], // or whatever your screen is
                    }),
                );
                break;
            default:
                Alert.alert('Coming Soon', `${item.SubMenu} is under development`);
        }
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleNavigation(item)}>
            <View style={[styles.menu, { backgroundColor: '#ecf0f1' }]}>
                <HomeImg height={30} width={30} style={styles.imageDesign} />
                <Text style={styles.menuItem}>{item.SubMenu}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CRMImg height={100} width={100} />
            <FlatList
                data={staticMenu}
                keyExtractor={item => item.SubMenuSRL.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={styles.list}
            />
        </View>
    );
};

export default DcrAdminDashBoard;


const styles = StyleSheet.create({
    menu: {
       margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
    hadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    },
    menuItem: {
        fontSize: 16,
        fontFamily: 'Lato-Regular',
        color: '#000',
        margin: 5,
        padding: 5,
        textAlignVertical: 'center',
        textAlign: 'center',
        alignItems: 'center',
    },
    imageDesign: {
        width: 40,
        height: 40,
        marginTop: 15,
        padding: 5,
        justifyContent: 'center',
        alignSelf: 'center',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    list: {
        justifyContent: 'center',
    },
});