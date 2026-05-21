import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../custom/AppContext';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { openDatabase } from 'react-native-sqlite-storage';
import { CommonActions } from '@react-navigation/native';
import CustomDrawer from '../custom/CustomDrawer';
import ReportScreen from '../../screens/ReportScreen';
import LogoutScreen from '../../screens/LogoutScreen';
import UserInfoScreen from '../../screens/UserInfoScreen';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from 'react-native';
const Drawer = createDrawerNavigator();

// //database connection
// const db = openDatabase(
//   {
//     name: 'CRM_db',
//     location: 'default',
//   },
//   () => {
//     //console.log('Database connected!');
//   }, //on success
//   error => console.log('Database error', error), //on error
// );

const DCRDrawer = () => {
  // const [useSubmenu, setSubmenu] = useState([]);
  // const [hasFetched, setHasFetched] = useState(false);
  // const navigation = useNavigation();
  // const {
  //   useBusinessID,
  //   useEmpemail,
  //   useSecurityKey,
  //   useManagerAccess,
  //   useIDEmployee,
  //   useEmpname,
  //   useMobileAccess,
  //   useDivision,
  // } = useAppContext();

  // useEffect(() => {
  //   AsyncStorage.getItem('UserData').then(value => {
  //     if (value != null) {
  //       let user = JSON.parse(value);
  //       fetchModules(user.BusinessID, user.IDEmployee);
  //     }
  //   });
  // }, []);

  // const fetchModules = (businessID, IDEmployee) => {
  //   NetInfo.fetch().then(async state => {
  //     if (state.isConnected) {
  //       try {
  //         const url =
  //           BASE_URL +
  //           'user/MobileSubMenuList?Businessid=' +
  //           businessID +
  //           '&IDEmployee=' +
  //           IDEmployee +
  //           '&Module=DCR';
  //         const response = await axios.get(url);
  //         setSubmenu(response.data);
  //         console.log(response.data);
  //         console.log(url);
  //         const dashBoardJsonArray = response.data;
  //         //CREATE TABLE for CRM_TourPlanDate
  //         db.transaction(txn => {
  //           txn.executeSql('DROP TABLE IF EXISTS DCRModuleData', []);
  //           txn.executeSql(
  //             'CREATE TABLE IF NOT EXISTS DCRModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
  //             [],
  //           );
  //         });

  //         //SQLITE INSERT CRM_TourPlanDate
  //         var _value = [];
  //         _value = dashBoardJsonArray;
  //         //console.log(_value);
  //         for (var j = 0; j < _value.length; j++) {
  //           const array = _value[j];
  //           let sql =
  //             'INSERT INTO DCRModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
  //           let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
  //           db.executeSql(sql, params);
  //         }
  //       } catch (error) {
  //         console.error('Failed to fetch modules:', error);
  //       }
  //     } else {
  //       db.transaction(tx => {
  //         tx.executeSql(
  //           'SELECT SubMenu, SubMenuSRL FROM DCRModuleData',
  //           [],
  //           (tx, results) => {
  //             const rows = results.rows;
  //             let temp = [];

  //             for (let i = 0; i < rows.length; i++) {
  //               temp.push(rows.item(i));
  //             }
  //             console.log(temp);

  //             setSubmenu(temp);
  //           },
  //           error => {
  //             console.log('Error fetching modules: ', error);
  //           },
  //         );
  //       });
  //     }
  //   }, []);
  // };

  // const renderScreen = module => {
  //   const CustomScreen = () => {
  //     useEffect(() => {
  //       if (!hasFetched) {
  //         handleNavigation();
  //         setHasFetched(true);
  //       }
  //     }, [hasFetched]);

  //     const handleNavigation = async () => {
  //       switch (module.SubMenu) {
  //         case 'DOCTOR':
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'Doctor Daily Call Report'}], // or whatever your main screen is
  //             }),
  //           );
  //           db.transaction(txn => {
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
  //           });
  //           break;
  //         case 'PARTY':
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'Retailer Daily Call Report'}], // or whatever your main screen is
  //             }),
  //           );
  //           db.transaction(txn => {
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
  //           });
  //           break;
  //         case 'UNLISTED':
  //           db.transaction(txn => {
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
  //             txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
  //           });
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'Unlisted Screen'}], // or whatever your main screen is
  //             }),
  //           );
  //           break;
  //         case 'OTHERS':
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'Others'}], // or whatever your main screen is
  //             }),
  //           );
  //           break;
  //         case 'STAY':
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'Stay'}], // or whatever your main screen is
  //             }),
  //           );
  //           break;
  //         case 'RCPA':
  //           if (useBusinessID.trim() === 'GENI-QST-536') {
  //             Alert.alert('You are not authorized to access the module');
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //           } else if (useBusinessID.trim() === 'DEV-GENI-536') {
  //             Alert.alert('You are not authorized to access the module');
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
  //               }),
  //             );
  //           } else {
  //             navigation.dispatch(
  //               CommonActions.reset({
  //                 index: 0,
  //                 routes: [{name: 'RCPA'}], // or whatever your main screen is
  //               }),
  //             );
  //           }
  //           break;
  //         case 'VIEW DCR':
  //           navigation.dispatch(
  //             CommonActions.reset({
  //               index: 0,
  //               routes: [{name: 'View DCR'}], // or whatever your main screen is
  //             }),
  //           );
  //           break;
  //         default:
  //           Alert.alert(module.Module);
  //       }
  //     };

  //     return null;
  //   };

  //   return (
  //     <Drawer.Screen
  //       key={module.SubMenuSRL}
  //       name={module.SubMenu}
  //       component={CustomScreen}
  //       options={{
  //         drawerIcon: ({color}) => (
  //           <Ionicons name="apps-outline" size={22} color={color} />
  //         ),
  //       }}
  //     />
  //   );
  // };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <Drawer.Navigator
        screenOptions={({ navigation }) => ({
          headerRight: () => (
            <TouchableOpacity
              //onPress={() => navigation.goBack()}
              onPress={() => navigation.navigate('AppNavScreen')}
              style={{ marginRight: 15 }}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}>
              <Ionicons name="menu" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        })}
        drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen
          name="Report Dashboard"
          component={ReportScreen}
          options={{
            headerTintColor: '#ffffff',
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
            headerTitle: () => (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  justifyContent: 'center',
                  color: '#ffffff', // white title text
                  paddingRight: 10,
                }}>
                Report Dashboard
              </Text>
            ),
          }}
        />
        <Drawer.Screen
          name="User Info"
          component={UserInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="person-outline" size={22} color={color} />
            ),
          }}
        />
        {/* {useSubmenu.map(renderScreen)} */}
        <Drawer.Screen
          name="LogOut"
          component={LogoutScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Ionicons name="exit-outline" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
};

export default DCRDrawer;


