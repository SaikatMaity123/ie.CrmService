import React, {useCallback, useEffect, useState, useLayoutEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  BackHandler,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {CommonActions} from '@react-navigation/native';
import {Sales_URL, BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {openDatabase} from 'react-native-sqlite-storage';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const {width} = Dimensions.get('window');

const SalesDashBoard = () => {
  const [useSubmenu, setSubmenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // <-- Use the useNavigation hook
  const [managerAccess, setManagerAccess] = useState(false);
  const route = useRoute();
  const selectedEmployee = route.params?.selectedEmployee;
  const [userName, setUserName] = useState('');
  const [saleDivision, setSaleDivision] = useState('');

  const goBackSmart = async () => {
    try {
      const value = await AsyncStorage.getItem('UserDataSales');
      if (value) {
        const userSales = JSON.parse(value);
        console.log(userSales);
        const division = (userSales?.Division || '')
          .toString()
          .trim()
          .toUpperCase();

        if (division === 'ADMIN') {
          // If the selected user context belongs to ADMIN, go back to AdminSalesDashboard
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'ADMIN SALES REPORT'}],
            }),
          );
          return true;
        }
      }
    } catch {}
    // fallback
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: 'AppNavScreen'}],
      }),
    );
    return true;
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        goBackSmart();
        return true; // block default
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            goBackSmart();
            return true;
          }}
          style={{marginLeft: 15}}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // useEffect(() => {
  //   AsyncStorage.getItem('UserData').then(value => {
  //     if (value != null) {

  //       let user = JSON.parse(value);
  //       // console.log(user);
  //       setUserName(user.Empname);
  //       setManagerAccess(user.ManagerAccess);
  //       fetchModules(user.BusinessID, user.IDEmployee);
  //     }
  //   });
  // }, []);

  // useEffect(() => {
  //   AsyncStorage.getItem('UserData').then(value => {
  //     if (value != null) {
  //       let user = JSON.parse(value);

  //       // If no selectedEmployee from params, fallback to logged-in user
  //       if (!selectedEmployee || !selectedEmployee.empname) {
  //         setUserName(user.Empname);
  //       } else {
  //         setUserName(selectedEmployee.empname);
  //       }

  //       setManagerAccess(user.ManagerAccess);
  //       fetchModules(user.BusinessID, user.IDEmployee);
  //     }
  //     const value = await AsyncStorage.getItem('UserDataSales');
  //           if (value) {
  //               const user1 = JSON.parse(value);
  //               //setUserInfo(user1);
  //               console.log(user1);
  //               }

  //   });
  // }, [selectedEmployee]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get UserData
        const value = await AsyncStorage.getItem('UserData');
        if (value) {
          let user = JSON.parse(value);

          // If no selectedEmployee from params, fallback to logged-in user
          if (!selectedEmployee || !selectedEmployee.empname) {
            setUserName(user.Empname);
          } else {
            setUserName(selectedEmployee.empname);
          }

          setManagerAccess(user.ManagerAccess);
          fetchModules(user.BusinessID, user.IDEmployee);
        }

        // Get UserDataSales
        const salesValue = await AsyncStorage.getItem('UserDataSales');
        if (salesValue) {
          const user1 = JSON.parse(salesValue);
          console.log('UserDataSales:', user1);
          // setUserInfo(user1); // enable if you need to store it
          setSaleDivision(user1.Division);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [selectedEmployee]);

  const fetchModules = (businessID, IDEmployee) => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        setLoading(true);
        try {
          const url =
            BASE_URL +
            'user/MobileSubMenuList?Businessid=' +
            businessID +
            '&IDEmployee=' +
            IDEmployee +
            '&Module=SALES REPORT';
          console.log('URL:', url);
          const response = await axios.get(url);
          setSubmenu(response.data);
          console.log(response.data);
          const dashBoardJsonArray = response.data;

          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS SALESModuleData', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS SALESModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
              [],
            );
          });

          var _value = [];
          _value = dashBoardJsonArray;
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO SALESModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
            let params = [array.SubMenu, array.SubMenuSRL];
            db.executeSql(sql, params);
          }
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch modules:', error);
        }
      } else {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT SubMenu, SubMenuSRL FROM SALESModuleData',
            [],
            (tx, results) => {
              const rows = results.rows;
              let temp = [];

              for (let i = 0; i < rows.length; i++) {
                temp.push(rows.item(i));
              }
              console.log(temp);

              setSubmenu(temp);
            },
            error => {
              console.log('Error fetching modules: ', error);
            },
          );
        });
      }
    }, []);
  };

  const submit = async module => {
    switch (module.SubMenu) {
      case 'MY STATUS':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {name: 'MY STATUS', params: {employee: selectedEmployee}},
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'MY STATUS'}],
            }),
          );
        }
        break;

      case 'COMPARATIVE SALES':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Comparative Sales',
                  params: {employee: selectedEmployee},
                },
              ], // or whatever your main screen is
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Comparative Sales'}],
            }),
          );
        }
        break; // The break should be inside the case block

      case 'PRODUCT WISE SALES':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'ProductWise Sales',
                  params: {employee: selectedEmployee},
                },
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'ProductWise Sales'}],
            }),
          );
        }
        break;
      case 'HIERARCHY WISE SALES':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'HierarchyWise Sales',
                  params: {employee: selectedEmployee},
                },
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'HierarchyWise Sales'}],
            }),
          );
        }
        break;

      case 'OUTSTANDING REPORTS':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'OutStanding Reports',
                  params: {employee: selectedEmployee},
                },
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'OutStanding Reports'}],
            }),
          );
        }
        break;
      case 'STOCK REPORTS':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {name: 'Stock Reports', params: {employee: selectedEmployee}},
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Stock Reports'}],
            }),
          );
        }
        break;
      case 'SALES ORDER TRANSACTION':
        if (saleDivision === 'ADMIN') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'SalesOrderTransaction',
                  params: {employee: selectedEmployee},
                },
              ],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'SalesOrderTransaction'}],
            }),
          );
        }
        break;

      default:
        Alert.alert(module.SubMenu, 'This module is under development');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#33767C" />
      </View>
    );
  }

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => submit(item)}>
      <View style={[styles.menu, {backgroundColor: '#f4f4f4'}]}>
        <HomeImg height={30} width={30} style={styles.imageDesign} />
        <Text style={styles.menuItem}>{item.SubMenu}</Text>
      </View>
    </TouchableOpacity>
  );
  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Roboto-Medium',
            marginTop: 10,
            marginBottom: 5,
            color: '#005696',
          }}>
          Welcome
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontFamily: 'Roboto-Medium',
            marginBottom: 5,
            color: '#005696',
          }}>
          {userName}
        </Text>
        <CRMImg height={100} width={100} />
        <FlatList
          data={useSubmenu}
          keyExtractor={item => item.SubMenuSRL.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      </View>
    </>
  );
};

export default SalesDashBoard;

const styles = StyleSheet.create({
  menu: {
    margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    fontSize: 15,
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
    backgroundColor: '#ffffff',
  },
  list: {
    justifyContent: 'center',
  },
});
