import {
  View,
  Text,
  BackHandler,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
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

const ReportScreen = ({navigation}) => {
  const {useBusinessID} = useAppContext();
  const [useSubmenu, setSubmenu] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // setLoading(true);
    // setTimeout(() => {
    //   setLoading(false);
    // }, 5000);
    handleCheckPressed();
    AsyncStorage.getItem('UserData').then(value => {
      if (value != null) {
        let user = JSON.parse(value);
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
            '&Module=DCR';
          const response = await axios.get(url);
          setSubmenu(response.data);
          console.log(response.data);
          console.log(url);
          const dashBoardJsonArray = response.data;
          //CREATE TABLE for CRM_TourPlanDate
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS DCRModuleData', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS DCRModuleData(SubMenu VARCHAR,SubMenuSRL VARCHAR)',
              [],
            );
          });

          //SQLITE INSERT CRM_TourPlanDate
          var _value = [];
          _value = dashBoardJsonArray;
          //console.log(_value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO DCRModuleData(SubMenu,SubMenuSRL) VALUES (?,?)';
            let params = [array.SubMenu, array.SubMenuSRL]; //storing user data in an array
            db.executeSql(sql, params);
          }
        } catch (error) {
          console.error('Failed to fetch modules:', error);
        }
      } else {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT SubMenu, SubMenuSRL FROM DCRModuleData',
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

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        //BackHandler.exitApp();
        handleEnabledPressed();
      } else if (checkEnabled === true) {
        //Alert.alert('GPS Active');
      }
    }
  };

  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  };

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

  const renderItem = ({item}) => (
    <TouchableOpacity onPress={() => submit(item)}>
      <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
        <HomeImg
          height={30}
          width={30}
          style={styles.imageDesign}
          // style={{transform: [{rotate: '-5deg'}]}}
        />
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
      case 'DOCTOR':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Doctor Daily Call Report'}], // or whatever your main screen is
          }),
        );
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
          txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
        });
        break;
      case 'PARTY':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Retailer Daily Call Report'}], // or whatever your main screen is
          }),
        );
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
          txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
        });
        break;
      case 'UNLISTED':
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
          txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Unlisted Screen'}], // or whatever your main screen is
          }),
        );
        break;
      case 'OTHERS':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Others'}], // or whatever your main screen is
          }),
        );
        break;
      case 'STAY':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'Stay'}], // or whatever your main screen is
          }),
        );
        break;
      case 'RCPA':
        if (useBusinessID.trim() === 'GENI-QST-536') {
          Alert.alert('You are not authorized to access the module');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
            }),
          );
        } else if (useBusinessID.trim() === 'DEV-GENI-536') {
          Alert.alert('You are not authorized to access the module');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'AppNavDCRScreen'}], // or whatever your main screen is
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'RCPA'}], // or whatever your main screen is
            }),
          );
        }
        break;
      case 'VIEW DCR':
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{name: 'View DCR'}], // or whatever your main screen is
          }),
        );
        break;
      default:
        Alert.alert(module.Module);
    }
  };
  return (
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
  );
};

export default ReportScreen;

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
    alignItems: 'center', // Centered horizontally
  },
  imageDesign: {
    width: 40,
    height: 40,
    marginTop: 15,
    padding: 5,
    justifyContent: 'center', //Centered vertically
    alignSelf: 'center', // Centered horizontally
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
