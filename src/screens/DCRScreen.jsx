import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  PermissionsAndroid,
  TouchableOpacity,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {Dropdown} from 'react-native-element-dropdown';
import {TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import CustomButton from '../components/custom/CustomButton';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {BASE_URL} from '@env';
import {openDatabase} from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';

//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const DCRScreen = ({navigation}) => {
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [currTime, setcurrTime] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useWTData, setWTData] = useState([]);
  const [selectedAreaData, setSelectedAreaData] = useState('');
  const [selectedMAreaData, setSelectedMAreaData] = useState('');
  //const [selectedArea, setSelectedArea] = useState([]);
  const [selectedArea, setSelectedArea] = useState([]);
  const [selectedMArea, setSelectedMArea] = useState([]);
  const [wtdataLabel, setwtdataLabel] = useState('');
  const [wtdataELabel, setwtdataELabel] = useState('');
  const [wtdataValue, setwtdataValue] = useState('');
  const [wtdataEValue, setwtdataEValue] = useState('');
  const [useMvisitWTvalue, setMvisitWTvalue] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [usemVwtData, setusemVwtData] = useState([]);
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  //const [usevisitMVWTDataSelected, setvisitMVWTDataSelected] = useState('');
  const [usevisitMVWTDataSelected, setvisitMVWTDataSelected] = useState([]);
  const [error, setError] = useState(null);
  const [deviceType, setDevice] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useMobileAccess, setuseMobileAccess] = useState('');
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year

  var cdate = moment().format('D/MMM/YYYY');

  // Call the function to request permission
  useEffect(() => {
    // Geolocation.getCurrentPosition(
    //   position => console.log(position),
    //   error => console.log(error),
    //   { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 },
    // );
    getOneTimeLocation();
    handleEnabledPressed();
    //handleCheckPressed();
    //fetchOfflineTableData();
    setcurrDate(date + '/' + month + '/' + year);

    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setIDEmployee(user.IDEmployee);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setIDDivision(user.IDDivision);
          //setempEmail(user.Empemail);
          //console.warn(user.MobileAccess);
          // if (useManagerAccess === true) {
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
                // const empurl =
                //   BASE_URL +
                //   'Employee/DivisionWiseEmployeeList?Businessid=' +
                //   user.BusinessID +
                //   '&IDDivision=' +
                //   user.IDDivision +
                //   '&IDEmployeeDesignation=0';
                // //console.log(empurl);
                // var config = {
                //   method: 'get',
                //   url: empurl,
                // };
                // axios(config)
                //   .then(function (response) {
                //     var count = Object.keys(response.data).length;
                //     let wtNameArray = [];
                //     for (var i = 0; i < count; i++) {
                //       wtNameArray.push({
                //         // value: response.data[i].Name,
                //         // key: response.data[i].IDEmployee,
                //         value: response.data[i].IDEmployee,
                //         label: response.data[i].Name,
                //       });
                //     }
                //     setvisitMVWTDataSelected(wtNameArray);
                //   })
                //   .catch(function (error) {
                //     Alert.alert(error);
                //   });
                const empurl =
                  BASE_URL +
                  'Employee/Hierarchy/All?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                console.log(empurl);
                var config = {
                  method: 'get',
                  url: empurl,
                };
                axios(config)
                  .then(function (response) {
                    //CREATE TABLE for MangerVisitWithTBL
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        value: response.data[i].IDEmployee,
                        label: response.data[i].EmployeeName,
                      });
                    }
                    setvisitMVWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
                const vwturl =
                  BASE_URL +
                  'Employee/EmployeeUpwardManagerList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                //console.log(vwturl);
                var config = {
                  method: 'get',
                  url: vwturl,
                };
                axios(config)
                  .then(function (response) {
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        //value: response.data[i].Value,
                        value: response.data[i].Name,
                        key: response.data[i].IDEmployee,
                      });
                    }
                    setvisitWTDataSelected(wtNameArray);
                    setError(null);
                  })
                  .catch(function (error) {
                    //Alert.alert(error);
                    if (error.response && error.response.status === 400) {
                      setError('No data found');
                    } else {
                      setError('Something went wrong');
                    }
                  });
              }

              const wturl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=WORKTYPE';
              //console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDMisc,
                      label: response.data[i].Name,
                    });
                  }
                  setWTData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const aturl =
                BASE_URL +
                'Employee/EmpAreaList?Businessid=' +
                user.BusinessID +
                '&IDHQ=' +
                user.IDHQ;
              //console.log('aturl ' + aturl);
              var config = {
                method: 'get',
                url: aturl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].Name,
                      key: response.data[i].IDArea,
                    });
                  }
                  setSelectedAreaData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              //console.log(useBusinessID);
            } else {
              Alert.alert('No Internet');
              fetchOfflineTableData(user.ManagerAccess);
            }
          }, []);
          // }
        }
      });
    } catch (error) {
      console.log(error);
    }

    setInterval(() => {
      setcurrTime(new Date().toLocaleTimeString());
      //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
    }, 1000);

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const startingDay = () => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    //console.warn(date);
    if (currentLongitude == 0.0 && currentLatitude == 0.0) {
      Alert.alert(
        'Invalid Location',
        'Latitude and Longitude are both 0.00. Closing the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              BackHandler.exitApp(); // This will close the app
              navigation.navigate('AppNavScreen');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (wtdataLabel === '') {
      Alert.alert('Select Work Type for Morning Shift');
    } else if (wtdataELabel === '') {
      Alert.alert('Select Work Type for Evening Shift');
      // } else if (wtdataLabel === 'LEAVE' && wtdataELabel === 'LEAVE') {
      //   // Navigate to Full Day Leave Apply screen
      //   navigation.navigate('Full Day Leave Application');
      // } else if (wtdataLabel === 'LEAVE' || wtdataELabel === 'LEAVE') {
      //   // Navigate to Half Day Leave Apply screen
      //   navigation.navigate('Half Day Leave Application');
    } else {
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            if (useManagerAccess === false) {
              try {
                let resVWT = usevisitWTData;
                let vwtList = resVWT.toString();

                let resArea = selectedArea;
                let areaList = resArea.toString();

                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS CRM_StartDay', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_StartDayDummy(StartDate VARCHAR)',
                    [],
                  );
                });

                //SQLITE INSERT CRM_StartDay
                let sql = 'INSERT INTO CRM_StartDayDummy(StartDate) VALUES (?)';
                let params = [cdate]; //storing user data in an array
                db.executeSql(sql, params);

                const url =
                  BASE_URL +
                  'DCR/StartDay/Save?Businessid=' +
                  useBusinessID +
                  '&IDEmployee=' +
                  useIDEmployee +
                  '&DeviceType=MOBILE' +
                  '&StartLat=' +
                  currentLatitude +
                  '&StartLong=' +
                  currentLongitude +
                  '&IDWorkingTypeMorning=' +
                  wtdataValue +
                  '&IDWorkingTypeEvening=' +
                  wtdataEValue +
                  '&Remark=' +
                  useRemarks +
                  '&Areas=' +
                  areaList +
                  '&Visitwiths=' +
                  vwtList;

                console.log(url);
                let result = await fetch(url);
                result = await result.json();
                console.log(result);
                if (!isNaN(result)) {
                  navigateBasedOnLeave();
                } else {
                  Alert.alert('Else : ' + result.status);
                }
              } catch (error) {
                Alert.alert(error);
              }
            } else {
              if (
                wtdataLabel === 'WORKING' &&
                wtdataELabel === 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel !== 'WORKING' &&
                wtdataELabel === 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel === 'WORKING' &&
                wtdataELabel !== 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel !== 'WORKING' &&
                wtdataELabel !== 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                try {
                  // let mvwt = usemVwtData;
                  // let mvwtList = mvwt.toString();
                  //setManagerOfflineData();
                  let mArea = selectedMArea;
                  let mareaList = mArea.toString();

                  //CREATE TABLE for CRM_ManagerStartDay
                  db.transaction(txn => {
                    //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
                    txn.executeSql(
                      'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDayDummy(StartDate VARCHAR)',
                      [],
                    );
                  });

                  //SQLITE INSERT CRM_StartDay
                  let sql =
                    'INSERT INTO CRM_ManagerStartDayDummy(StartDate) VALUES (?)';
                  let params = [cdate]; //storing user data in an array
                  db.executeSql(sql, params);

                  const url =
                    BASE_URL +
                    'DCR/StartDay/Save?Businessid=' +
                    useBusinessID +
                    '&IDEmployee=' +
                    useIDEmployee +
                    '&DeviceType=MOBILE' +
                    '&StartLat=' +
                    currentLatitude +
                    '&StartLong=' +
                    currentLongitude +
                    '&IDWorkingTypeMorning=' +
                    wtdataValue +
                    '&IDWorkingTypeEvening=' +
                    wtdataEValue +
                    '&Remark=' +
                    useRemarks +
                    '&Areas=' +
                    mareaList +
                    '&Visitwiths=' +
                    //mvwtList;
                    useMvisitWTvalue;

                  console.log(url);
                  let result = await fetch(url);
                  result = await result.json();
                  console.log(result);
                  // navigation.navigate('AppNavScreen');
                  if (!isNaN(result)) {
                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              } else {
                try {
                  // let mvwt = usemVwtData;
                  // let mvwtList = mvwt.toString();

                  setManagerOfflineData();
                  let mArea = selectedMArea;
                  let mareaList = mArea.toString();

                  //CREATE TABLE for CRM_ManagerStartDay
                  db.transaction(txn => {
                    //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
                    txn.executeSql(
                      'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDayDummy(StartDate VARCHAR)',
                      [],
                    );
                  });

                  //SQLITE INSERT CRM_StartDay
                  let sql =
                    'INSERT INTO CRM_ManagerStartDayDummy(StartDate) VALUES (?)';
                  let params = [cdate]; //storing user data in an array
                  db.executeSql(sql, params);

                  const url =
                    BASE_URL +
                    'DCR/StartDay/Save?Businessid=' +
                    useBusinessID +
                    '&IDEmployee=' +
                    useIDEmployee +
                    '&DeviceType=MOBILE' +
                    '&StartLat=' +
                    currentLatitude +
                    '&StartLong=' +
                    currentLongitude +
                    '&IDWorkingTypeMorning=' +
                    wtdataValue +
                    '&IDWorkingTypeEvening=' +
                    wtdataEValue +
                    '&Remark=' +
                    useRemarks +
                    '&Areas=' +
                    mareaList +
                    '&Visitwiths=' +
                    //mvwtList;
                    useMvisitWTvalue;

                  console.log(url);
                  let result = await fetch(url);
                  result = await result.json();
                  console.log(result);
                  //navigation.navigate('AppNavScreen');
                  if (!isNaN(result)) {
                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              }
            }
          } else {
            Alert.alert('You are offline contact with Admin!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            if (useManagerAccess === false) {
              try {
                let resVWT = usevisitWTData;
                let vwtList = resVWT.toString();

                let resArea = selectedArea;
                let areaList = resArea.toString();

                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS CRM_StartDay', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_StartDayDummy(StartDate VARCHAR)',
                    [],
                  );
                });

                //SQLITE INSERT CRM_StartDay
                let sql = 'INSERT INTO CRM_StartDayDummy(StartDate) VALUES (?)';
                let params = [cdate]; //storing user data in an array
                db.executeSql(sql, params);

                const url =
                  BASE_URL +
                  'DCR/StartDay/Save?Businessid=' +
                  useBusinessID +
                  '&IDEmployee=' +
                  useIDEmployee +
                  '&DeviceType=MOBILE' +
                  '&StartLat=' +
                  currentLatitude +
                  '&StartLong=' +
                  currentLongitude +
                  '&IDWorkingTypeMorning=' +
                  wtdataValue +
                  '&IDWorkingTypeEvening=' +
                  wtdataEValue +
                  '&Remark=' +
                  useRemarks +
                  '&Areas=' +
                  areaList +
                  '&Visitwiths=' +
                  vwtList;

                console.log(url);
                let result = await fetch(url);
                result = await result.json();
                console.log(result);
                //navigation.navigate('AppNavScreen');
                if (!isNaN(result)) {
                  navigateBasedOnLeave();
                } else {
                  Alert.alert('Else : ' + result.status);
                }
              } catch (error) {
                Alert.alert(error);
              }
            } else {
              if (
                wtdataLabel === 'WORKING' &&
                wtdataELabel === 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel !== 'WORKING' &&
                wtdataELabel === 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel === 'WORKING' &&
                wtdataELabel !== 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                Alert.alert('Select Visit With');
              } else if (
                wtdataLabel !== 'WORKING' &&
                wtdataELabel !== 'WORKING' &&
                useMvisitWTvalue === ''
              ) {
                try {
                  // let mvwt = usemVwtData;
                  // let mvwtList = mvwt.toString();
                  //setManagerOfflineData();
                  let mArea = selectedMArea;
                  let mareaList = mArea.toString();

                  //CREATE TABLE for CRM_ManagerStartDay
                  db.transaction(txn => {
                    //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
                    txn.executeSql(
                      'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDayDummy(StartDate VARCHAR)',
                      [],
                    );
                  });

                  //SQLITE INSERT CRM_StartDay
                  let sql =
                    'INSERT INTO CRM_ManagerStartDayDummy(StartDate) VALUES (?)';
                  let params = [cdate]; //storing user data in an array
                  db.executeSql(sql, params);

                  const url =
                    BASE_URL +
                    'DCR/StartDay/Save?Businessid=' +
                    useBusinessID +
                    '&IDEmployee=' +
                    useIDEmployee +
                    '&DeviceType=MOBILE' +
                    '&StartLat=' +
                    currentLatitude +
                    '&StartLong=' +
                    currentLongitude +
                    '&IDWorkingTypeMorning=' +
                    wtdataValue +
                    '&IDWorkingTypeEvening=' +
                    wtdataEValue +
                    '&Remark=' +
                    useRemarks +
                    '&Areas=' +
                    mareaList +
                    '&Visitwiths=' +
                    //mvwtList;
                    useMvisitWTvalue;

                  console.log(url);
                  let result = await fetch(url);
                  result = await result.json();
                  console.log(result);
                  //navigation.navigate('AppNavScreen');
                  if (!isNaN(result)) {
                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              } else {
                try {
                  // let mvwt = usemVwtData;
                  // let mvwtList = mvwt.toString();
                  setManagerOfflineData();
                  let mArea = selectedMArea;
                  let mareaList = mArea.toString();

                  //CREATE TABLE for CRM_ManagerStartDay
                  db.transaction(txn => {
                    //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
                    txn.executeSql(
                      'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDayDummy(StartDate VARCHAR)',
                      [],
                    );
                  });

                  //SQLITE INSERT CRM_StartDay
                  let sql =
                    'INSERT INTO CRM_ManagerStartDayDummy(StartDate) VALUES (?)';
                  let params = [cdate]; //storing user data in an array
                  db.executeSql(sql, params);

                  const url =
                    BASE_URL +
                    'DCR/StartDay/Save?Businessid=' +
                    useBusinessID +
                    '&IDEmployee=' +
                    useIDEmployee +
                    '&DeviceType=MOBILE' +
                    '&StartLat=' +
                    currentLatitude +
                    '&StartLong=' +
                    currentLongitude +
                    '&IDWorkingTypeMorning=' +
                    wtdataValue +
                    '&IDWorkingTypeEvening=' +
                    wtdataEValue +
                    '&Remark=' +
                    useRemarks +
                    '&Areas=' +
                    mareaList +
                    '&Visitwiths=' +
                    //mvwtList;
                    useMvisitWTvalue;

                  console.log(url);
                  let result = await fetch(url);
                  result = await result.json();
                  console.log(result);
                  // navigation.navigate('AppNavScreen');
                  if (!isNaN(result)) {
                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              }
            }
          } else {
            if (useManagerAccess === false) {
              //CREATE TABLE for CRM_StartDay
              db.transaction(txn => {
                //txn.executeSql('DROP TABLE IF EXISTS CRM_StartDay', []);
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_StartDay(StartDate VARCHAR,StartTime VARCHAR,BusinessID VARCHAR,IDEmployee VARCHAR,DeviceType VARCHAR,StartLat VARCHAR,StartLong VARCHAR,IDMorningShift VARCHAR,IDEveningShift VARCHAR,Areas VARCHAR,VisitWiths VARCHAR,Remarks VARCHAR)',
                  [],
                );
              });

              let resArea = selectedArea;
              let areaList = resArea.toString();

              let resVWT = usevisitWTData;
              let vwtList = resVWT.toString();
              //SQLITE INSERT CRM_StartDay
              let sql =
                'INSERT INTO CRM_StartDay(StartDate,StartTime,BusinessID,IDEmployee,DeviceType,StartLat,StartLong,IDMorningShift,IDEveningShift,Areas,VisitWiths,Remarks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
              let params = [
                cdate,
                //currTime,
                date,
                useBusinessID,
                useIDEmployee,
                //DeviceInfo.getModel(),
                deviceType,
                currentLatitude,
                currentLongitude,
                wtdataValue,
                wtdataEValue,
                areaList,
                vwtList,
                useRemarks,
              ]; //storing user data in an array
              db.executeSql(sql, params);

              db.transaction(txn => {
                //txn.executeSql('DROP TABLE IF EXISTS CRM_StartDay', []);
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_StartDayDummy(StartDate VARCHAR)',
                  [],
                );
              });

              //SQLITE INSERT CRM_StartDay
              let sqldummy =
                'INSERT INTO CRM_StartDayDummy(StartDate) VALUES (?)';
              let paramsdummy = [cdate]; //storing user data in an array
              db.executeSql(sqldummy, paramsdummy);
              navigateBasedOnLeave();
              // Alert.alert(
              //   'Success',
              //   '',
              //   [
              //     {
              //       text: 'Ok',
              //       onPress: () => navigation.navigate('AppNavScreen'),
              //     },
              //   ],
              //   {cancelable: false},
              // );
              //console.log(JSON.stringify(params));
            }
            // else {
            //   //CREATE TABLE for CRM_ManagerStartDay
            //   db.transaction(txn => {
            //     //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
            //     txn.executeSql(
            //       'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDay(StartDate VARCHAR,StartTime VARCHAR,BusinessID VARCHAR,IDEmployee VARCHAR,DeviceType VARCHAR,StartLat VARCHAR,StartLong VARCHAR,IDMorningShift VARCHAR,IDEveningShift VARCHAR,Areas VARCHAR,VisitWiths VARCHAR,Remarks VARCHAR)',
            //       [],
            //     );
            //   });

            //   let mvwt = usemVwtData;
            //   let mvwtList = mvwt.toString();

            //   let mArea = selectedMArea;
            //   let mareaList = mArea.toString();
            //   //SQLITE INSERT CRM_StartDay
            //   let sql =
            //     'INSERT INTO CRM_ManagerStartDay(StartDate,StartTime,BusinessID,IDEmployee,DeviceType,StartLat,StartLong,IDMorningShift,IDEveningShift,Areas,VisitWiths,Remarks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
            //   let params = [
            //     cdate,
            //     //currTime,
            //     date,
            //     useBusinessID,
            //     useIDEmployee,
            //     //DeviceInfo.getModel(),
            //     deviceType,
            //     currentLatitude,
            //     currentLongitude,
            //     wtdataValue,
            //     wtdataEValue,
            //     mareaList,
            //     mvwtList,
            //     useRemarks,
            //   ]; //storing user data in an array
            //   db.executeSql(sql, params);
            //   console.log(JSON.stringify(params));

            //   //CREATE TABLE for CRM_ManagerStartDay
            //   db.transaction(txn => {
            //     //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
            //     txn.executeSql(
            //       'CREATE TABLE IF NOT EXISTS CRM_ManagerStartDayDummy(StartDate VARCHAR)',
            //       [],
            //     );
            //   });

            //   //SQLITE INSERT CRM_StartDay
            //   let sqldummy =
            //     'INSERT INTO CRM_ManagerStartDayDummy(StartDate) VALUES (?)';
            //   let paramsdummy = [cdate]; //storing user data in an array
            //   db.executeSql(sqldummy, paramsdummy);
            //   navigation.navigate('AppNavScreen');
            //   // Alert.alert(
            //   //   'Success',
            //   //   '',
            //   //   [
            //   //     {
            //   //       text: 'Ok',
            //   //       onPress: () => navigation.navigate('AppNavScreen'),
            //   //     },
            //   //   ],
            //   //   {cancelable: false},
            //   // );
            // }
            else {
              Alert.alert('You are offline contact with Admin!');
            }
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
      }
    }
  };

  const navigateBasedOnLeave = () => {
    if (wtdataLabel === 'LEAVE' && wtdataELabel === 'LEAVE') {
      navigation.navigate('Full Day Leave Application');
    } else if (wtdataLabel === 'LEAVE' || wtdataELabel === 'LEAVE') {
      navigation.navigate('Half Day Leave Application');
    } else {
      navigation.navigate('AppNavScreen');
    }
  };

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        //navigation.navigate('AppNavScreen');
      } else if (checkEnabled === true) {
        //xAlert.alert('GPS Active');
        //getOneTimeLocation();
        getMultipleTimeLocation();
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
          Alert.alert(error.message);
        }
      }
    }
  };

  // const getOneTimeLocation = () => {
  //   setLocationStatus('Getting Location ...');
  //   Geolocation.getCurrentPosition(
  //     //Will give you the current location
  //     position => {
  //       setLocationStatus('You are Here');
  //       const currentLongitude = JSON.stringify(position.coords.longitude);
  //       //getting the Longitude from the location json
  //       const currentLatitude = JSON.stringify(position.coords.latitude);
  //       //getting the Latitude from the location json
  //       setCurrentLongitude(currentLongitude);
  //       //Setting state Longitude to re re-render the Longitude Text
  //       setCurrentLatitude(currentLatitude);
  //       //Setting state Latitude to re re-render the Longitude Text
  //       console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //       console.log(position);
  //     },
  //     error => {
  //       setLocationStatus(error.message);
  //     },
  //     //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  //     //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
  //     { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
  //     {timeout: 15000}, // 15 seconds timeout
  //   );
  // };
  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
        console.log(position);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      {timeout: 15000}, // 15 seconds timeout
    );
  };
  const getMultipleTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOfflineTableData = ManagerAccess => {
    // if (ManagerAccess === true) {
    //   //Retrieve data from MangerVisitWithTBL
    //   db.transaction(tx => {
    //     tx.executeSql(
    //       'SELECT * FROM MangerVisitWithTBL',
    //       [],
    //       (tx, results) => {
    //         if (results.rows.length > 0) {
    //           var temp = [];
    //           for (let i = 0; i < results.rows.length; ++i)
    //             temp.push({
    //               //value: results.rows.item(i).Name,
    //               value: results.rows.item(i).EmployeeName,
    //               key: results.rows.item(i).IDEmployee,
    //               value: results.rows.item(i).EmployeeName,
    //               key: results.rows.item(i).IDEmployee,
    //             });
    //           setvisitMVWTDataSelected(temp);
    //           console.log('Data is inserted:', temp);
    //         } else {
    //           console.log('No data found');
    //           //setSelectedMAreaData('No data found');
    //         }
    //       },
    //       (tx, error) => {
    //         console.error('Error checking data', error);
    //       },
    //     );
    //   });
    // } else {
    //Retrieve data from CRM_VisitWithList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_VisitWithList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push({
                value: results.rows.item(i).Name,
                key: results.rows.item(i).IDEmployee,
              });
            setvisitWTDataSelected(temp);
            //console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
    // }
    //Retrieve data from CRM_WorkTypeList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_WorkTypeList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDMisc,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setWTData(temp);
            //console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setWTData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });

    //Retrieve data from CRM_AreaList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_AreaList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push({
                value: results.rows.item(i).Name,
                key: results.rows.item(i).IDArea,
              });
            setSelectedAreaData(temp);
            //console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
  };

  // const multiSelectMVWT = () => {
  //   let mvwt = usemVwtData;
  //   let mvwtList = mvwt.toString();
  //   //console.log(mvwtList);
  //   //mvwtAreaListAPI(mvwtList);
  //   mvwtAreaListAPI(mvwt);
  //   //setManagerOfflineData(mvwtList);
  // };

  // const mvwtAreaListAPI = IDEmployeeList => {
  //   // Example array of values for the IN clause
  //   const values = IDEmployeeList;

  //   // Construct the SQL query dynamically with the values
  //   const sqlQuery = `SELECT * FROM ManagerEmployeeWiseAreaList WHERE IDEmployee IN (${values
  //     .map(() => '?')
  //     .join(',')})`;

  //   // Execute the query
  //   db.transaction(tx => {
  //     //tx.executeSql(sqlQuery, values, (_, { rows }) => {
  //     tx.executeSql(
  //       sqlQuery,
  //       values,
  //       (_, results) => {
  //         // Process the result rows here
  //         //const results = rows;
  //         console.log('Query results:', results.rows.length);
  //         console.log('Query values:', values);
  //         if (results.rows.length > 0) {
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push({
  //               value: results.rows.item(i).Name,
  //               key: results.rows.item(i).IDArea,
  //             });
  //           }
  //           setSelectedMAreaData(temp);
  //           console.log(temp);
  //         } else {
  //           console.log('No data found');
  //           //setSelectedMAreaData('No data found');
  //         }
  //       },
  //       (_, error) => {
  //         console.error('Error executing SQL query:', error);
  //       },
  //     );
  //   });
  // };

  const mvwtAreaListAPI = IDEmployeeList => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          IDEmployeeList;
        //console.log('managerAreaList ' + areaurl);
        var config = {
          method: 'get',
          url: areaurl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].Name,
                key: response.data[i].IDArea,
              });
            }
            setSelectedMAreaData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        //console.log(empLoyee);
        // Example array of values for the IN clause
        const values = IDEmployeeList;

        // Construct the SQL query dynamically with the values
        const sqlQuery = `SELECT * FROM ManagerEmployeeWiseAreaList WHERE IDEmployee IN (${values
          .map(() => '?')
          .join(',')})`;

        // Execute the query
        db.transaction(tx => {
          //tx.executeSql(sqlQuery, values, (_, { rows }) => {
          tx.executeSql(
            sqlQuery,
            values,
            (_, results) => {
              // Process the result rows here
              //const results = rows;
              console.log('Query results:', results.rows.length);
              console.log('Query values:', values);
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).Name,
                    key: results.rows.item(i).IDArea,
                  });
                }
                setSelectedMAreaData(temp);
                console.log(temp);
              } else {
                console.log('No data found');
                //setSelectedMAreaData('No data found');
              }
            },
            (_, error) => {
              console.error('Error executing SQL query:', error);
            },
          );
        });
      }
    }, []);
  };

  const setManagerOfflineData = () => {
    const areaurl =
      BASE_URL +
      'Area/ManagerOfflineAreaList?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_offlineAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineAreaList(IDArea INTEGER,IDHQ INTEGER,IDEmployee INTEGER,AreaName VARCHAR,EmployeeName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineAreaList(IDArea,IDHQ,IDEmployee,AreaName,EmployeeName) VALUES (?,?,?,?,?)';
          let params = [
            array.IDArea,
            array.IDHQ,
            array.IDEmployee,
            array.AreaName,
            array.EmployeeName,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const empurl =
      BASE_URL +
      'Employee/Offline/Hierarchy/All?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS MangerVisitWithTBL', []);
          txn.executeSql(
            //'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(Name VARCHAR,IDEmployee VARCHAR)',
            'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(EmployeeName VARCHAR,IDEmployee VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT MangerVisitWithTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            //'INSERT INTO MangerVisitWithTBL(Name,IDEmployee) VALUES (?,?)';
            'INSERT INTO MangerVisitWithTBL(EmployeeName,IDEmployee) VALUES (?,?)';
          //let params = [array.Name, array.IDEmployee]; //storing user data in an array
          let params = [array.EmployeeName, array.IDEmployee]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const docurl =
      BASE_URL +
      'manager/DCR/OfflineManagerVisitwithEmployeeWiseDoctorList?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log('returl ' + docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineManagerDoctorList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineManagerDoctorList(IDDoctor INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineManagerDoctorList(IDDoctor,IDEmployee,IDArea,Name,Latitude,Longitude) VALUES (?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDEmployee,
            array.IDArea,
            array.Name,
            array.Latitude,
            array.Longitude,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const returl =
      BASE_URL +
      'manager/DCR/OfflineManagerVisitwithEmployeeWiseRetailerList?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineManagerRetailerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineManagerRetailerList(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineManagerRetailerList(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDEmployee,
            array.IDArea,
            array.Name,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const unlistedaurl =
      BASE_URL +
      'Area/ManagerVisitWithEmployeeWiseOfflineAreaList?Businessid=' +
      useBusinessID +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log(unlistedaurl);
    var config = {
      method: 'get',
      url: unlistedaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseAreaList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseAreaList(Name VARCHAR,IDArea VARCHAR,IDEmployee VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseAreaList(Name,IDArea,IDEmployee) VALUES (?,?,?)';
          let params = [array.Name, array.IDArea, array.IDEmployee]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const stayareaurl =
      BASE_URL +
      'Manager/OfflineArea/List?Businessid=' +
      useBusinessID +
      '&IDUser=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log('aturl ' + stayareaurl);
    var config = {
      method: 'get',
      url: stayareaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_MangerAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_MangerAreaList(IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_MangerAreaList(IDArea,Name) VALUES (?,?)';
          let params = [array.IDArea, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const mappingURL =
      BASE_URL +
      'Doctor/ManagerDoctorProductMappingNewOfflineList?Businessid=' +
      useBusinessID +
      '&IDManager=' +
      useIDEmployee +
      '&IDEmployee=' +
      useMvisitWTvalue;
    console.log('mappingURL ' + mappingURL);
    var config = {
      method: 'get',
      url: mappingURL,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data.d);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_ManagerDoctorProductMappingOfflineList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorProductMappingOfflineList(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_DoctorProductMappingListt
        var _value = [];
        _value = response.data.d;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_ManagerDoctorProductMappingOfflineList(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDProduct,
            array.IDStage,
            array.ProductName,
            array.StageName,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      {/* <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}> */}
      <View
        style={{
          backgroundColor: '#ecf0f1',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.1,
          margin: 10,
          elevation: 2,
          borderRadius: 1,
        }}>
        <View>
          {/* <Text style={style.boldText}>{locationStatus}</Text> */}
          <Text style={{padding: 5}}>Latitude : {currentLatitude}</Text>
          <Text style={{padding: 5}}>Longitude : {currentLongitude} </Text>
          {/* <Text style={{padding: 5}}>Date : {currDate}</Text> */}
          <Text style={{padding: 5}}>Time : {currTime}</Text>
        </View>
      </View>
      <View style={{padding: 5, margin: 5}}>
        <TextInput
          label="Date"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{marginBottom: 5}}
          value={currDate}
          editable={false}
        />
        <View style={style.btnTab}>
          <Text style={style.textTab}>Morning Shift</Text>
        </View>
        <Dropdown
          style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={useWTData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Work Type' : '...'}
          searchPlaceholder="Search Work Type"
          //value={wtdataLabel}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setwtdataValue(item.value);
            setwtdataLabel(item.label);
            // handleState(item.value);
            setIsFocus(false);
            console.log(
              'Morning Shift Work Type selected:',
              item.label,
              'Value:',
              item.value,
            );
            // if (item.label === 'WORKING') {
            //   setshouldShowMSWT(true);
            // } else {
            //   setshouldShowMSWT(false);
            // }
          }}
        />

        <View style={style.btnTabE}>
          <Text style={style.textTab}>Evening Shift</Text>
        </View>
        <Dropdown
          style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={useWTData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Work Type' : '...'}
          searchPlaceholder="Search Work Type"
          //value={wtdataLabel}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setwtdataEValue(item.value);
            setwtdataELabel(item.label);
            // handleState(item.value);
            setIsFocus(false);
            console.log(
              'Evening Shift Work Type selected:',
              item.label,
              'Value:',
              item.value,
            );
          }}
        />

        <View style={{marginTop: 5, paddingTop: 5}}>
          {useManagerAccess ? (
            <View style={{marginTop: 5, paddingTop: 5}}>
              {/* <MultipleSelectList
                setSelected={val => setusemVwtData(val)}
                data={usevisitMVWTDataSelected}
                placeholder="Select Visit With"
                label="Visit With"
                //save="value"
                save="key"
                onSelect={() =>
                  //console.log(usemVwtData)
                  multiSelectMVWT()
                }
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              /> */}
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={usevisitMVWTDataSelected}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Visit With' : '...'}
                searchPlaceholder="Search Visit With"
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  // setwtdataValue(item.value);
                  // setwtdataLabel(item.label);
                  setMvisitWTvalue(item.value);
                  mvwtAreaListAPI(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
          ) : (
            <View style={{marginTop: 5, paddingTop: 5}}>
              <MultipleSelectList
                setSelected={val => setvisitWTData(val)}
                data={usevisitWTDataSelected}
                placeholder="Select Visit With"
                label="Visit With"
                //save="value"
                save="key"
                onSelect={() => console.log(usevisitWTData)}
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              />
            </View>
          )}
          {useManagerAccess ? (
            <View style={{marginTop: 5, paddingTop: 5}}>
              <MultipleSelectList
                setSelected={val => setSelectedMArea(val)}
                data={selectedMAreaData}
                placeholder="Select Area"
                label="Area"
                //save="value"
                save="key"
                onSelect={
                  () => console.log(selectedMArea)
                  //multiSelectAreaList()
                }
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              />
            </View>
          ) : (
            <View style={{marginTop: 5, paddingTop: 5}}>
              <MultipleSelectList
                setSelected={val => setSelectedArea(val)}
                data={selectedAreaData}
                placeholder="Select Area"
                label="Area"
                //save="value"
                save="key"
                onSelect={
                  () => console.log(selectedArea)
                  //multiSelectList()
                }
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              />
            </View>
          )}

          <TextInput
            label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginBottom: 5}}
            value={useRemarks}
            onChangeText={text => setRemarks(text)}
          />

          <CustomButton
            label={'Start Your Day'}
            onPress={() => startingDay()}
          />
        </View>
      </View>
      {/* </ImageBackground> */}
    </ScrollView>
  );
};

export default DCRScreen;
const style = StyleSheet.create({
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    //marginTop: 5,
  },
  dropdownStage: {
    height: 50,
    width: '40%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    margin: 5,
  },
  cStage: {
    height: 45,
    width: '35%',
    borderColor: 'gray',
    // borderWidth: 0.5,
    borderRadius: 8,
    //paddingHorizontal: 5,
    backgroundColor: '#fff',
    marginBottom: 5,
    // margin: 5,
  },
  menu: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    padding: 5,
    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  btnTab: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 5,
    marginBottom: 5,
  },
  btnTabE: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 10,
    marginBottom: 5,
  },
  textTab: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  menuItemPS: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 2,
    marginBottom: 4,
    //padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
});
