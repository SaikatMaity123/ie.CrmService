import {
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import React, {useEffect, useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native'; // <-- Import useNavigation
import CRMImg from '../images/CRMNEW.svg';
import {CommonActions} from '@react-navigation/native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '@env';
import {openDatabase} from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import HomeImg from '../images/home.svg';
import {useAppContext} from '../components/custom/AppContext';
import axios from 'axios';
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

const ApprovalDashboard = () => {
  // const { useBusinessID } = useAppContext();
  const [useSubmenu, setSubmenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // <-- Use the useNavigation hook
  const [managerAccess, setManagerAccess] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  useEffect(() => {
    AsyncStorage.getItem('UserData').then(value => {
      if (value != null) {
        let user = JSON.parse(value);
        console.log(user);
        setManagerAccess(user.ManagerAccess);
        fetchModules(user.BusinessID, user.IDEmployee);
      }
    });
  }, []);

  const fetchModules = (businessID, IDEmployee) => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        try {
          const url =
            BASE_URL +
            'user/MobileSubMenuList?Businessid=' +
            businessID +
            '&IDEmployee=' +
            IDEmployee +
            '&Module=APPROVAL';
          const response = await axios.get(url);
          setSubmenu(response.data);
          console.log(response.data);
          console.log(url);
          const dashBoardJsonArray = response.data;

          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS APPROVALModuleData', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS APPROVALModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
              [],
            );
          });

          var _value = [];
          _value = dashBoardJsonArray;
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO APPROVALModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
            let params = [array.SubMenu, array.SubMenuSRL];
            db.executeSql(sql, params);
          }
        } catch (error) {
          console.error('Failed to fetch modules:', error);
        }
      } else {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT SubMenu, SubMenuSRL FROM APPROVALModuleData',
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

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => submit(item)}>
      <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
        <HomeImg height={30} width={30} style={styles.imageDesign} />
        <Text style={styles.menuItem}>{item.SubMenu}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#33767C" />
      </View>
    );
  }

  const submit = async module => {
    switch (module.SubMenu) {
      case 'LEAVE APPROVAL':
        if (managerAccess === true) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'leaveApproval'}],
            }),
          );
        } else {
          Alert.alert('Unauthorized', 'You are unauthorized to the module');
        }
        break;

      case 'LEAVE STATUS':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'leaveStatus'}], // or whatever your main screen is
          }),
        );
        break; // The break should be inside the case block

      case 'LEAVE APPLY':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Leave Application'}],
          }),
        );
        break;

      default:
        Alert.alert(module.SubMenu, 'This module is under development');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />

      <View style={styles.container}>
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

export default ApprovalDashboard;

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
    backgroundColor: '#ffffff',
  },
  list: {
    justifyContent: 'center',
  },
});
