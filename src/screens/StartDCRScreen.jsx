import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  BackHandler,
  Alert,
  Platform,
  StatusBar,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
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
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {BASE_URL} from '@env';
import {openDatabase} from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import Ionicons from 'react-native-vector-icons/Ionicons';
//import PushNotification from 'react-native-push-notification';
//import { showLocalNotification } from './NotificationService';
//import messaging from '@react-native-firebase/messaging';
import {showLocalNotification} from '../services/notifications';

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

const StartDCRScreen = ({navigation}) => {
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [currTime, setcurrTime] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useManagerToken, setuseManagerToken] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [username, setUsername] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useWTData, setWTData] = useState([]);
  const [selectedAreaData, setSelectedAreaData] = useState('');
  const [selectedMAreaData, setSelectedMAreaData] = useState('');
  const [selectedArea, setSelectedArea] = useState([]);
  const [selectedMArea, setSelectedMArea] = useState([]);
  const [wtdataLabel, setwtdataLabel] = useState('');
  const [wtdataELabel, setwtdataELabel] = useState('');
  const [wtdataValue, setwtdataValue] = useState('');
  const [wtdataEValue, setwtdataEValue] = useState('');
  const [useMvisitWTvalue, setMvisitWTvalue] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [usevisitMVWTDataSelected, setvisitMVWTDataSelected] = useState([]);
  const [error, setError] = useState(null);
  const [deviceType, setDevice] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [empEmail, setuseEmailID] = useState('');
  const [empPassword, setusePassword] = useState('');
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  var cdate = moment().format('D/MMM/YYYY');
  const locationInterval = useRef(null);
  const retryPermissionInterval = useRef(null);
  const failureCount = useRef(0);

  useEffect(() => {
    requestNotificationPermission();
    getAccessToken();
    //getOneTimeLocation();
    //handleEnabledPressed();
    //askLocationPermissionFirstTime(); // ← NEW LOGIC
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
          setUsername(user.Empname);
          setuseManagerToken(user.ManagerToken);
          setuseEmailID(user.Empemail);
          setusePassword(user.Password);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
                // const empurl =
                //   BASE_URL +
                //   'Employee/Hierarchy/All?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                const empurl =
                  BASE_URL +
                  'Employee/ManagerVisitwithList?Businessid=' +
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
                        // value: response.data[i].IDEmployee,
                        // label: response.data[i].EmployeeName,

                        value: response.data[i].IDEmployee,
                        label: response.data[i].Name,
                      });
                    }
                    setvisitMVWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
                // const vwturl =
                //   BASE_URL +
                //   'Employee/EmployeeUpwardManagerList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                //console.log(vwturl);
                const vwturl =
                  BASE_URL +
                  'Employee/MSRVisitwithList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
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
              fetchOfflineTableData();
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

    // const interval = setInterval(() => {
    //   handleCheckPressed();
    // }, 10000);
    // return () => clearInterval(interval);
    if (Platform.OS === 'android') {
      startLocationFlow();
    } else {
      // iOS: trigger popup automatically the first time
      getCurrentLocation();
      startLocationUpdates();
    }

    return () => {
      if (retryPermissionInterval.current) {
        clearInterval(retryPermissionInterval.current);
        retryPermissionInterval.current = null;
      }
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
        locationInterval.current = null;
      }
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (!hasPermission) {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'This app wants to send you notifications',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (result === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Permission granted');
            } else {
              Alert.alert('Notification permission denied');
            }
          }
        } catch (err) {
          console.warn('Permission request error:', err);
        }
      }
    }
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}Authentication/Generatetoken`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Token request failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data && data.Token) {
        console.log('Access Token:', data.Token);

        // Optionally store in AsyncStorage or state
        // await AsyncStorage.setItem('AccessToken', data.Token);
        setAccessToken(data.Token);

        return data.Token;
      } else {
        console.warn('No token returned from API');
        return null;
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
    }
  };

  const startLocationFlow = async () => {
    try {
      const gpsEnabled = await isLocationEnabled();
      if (!gpsEnabled) {
        await promptForEnableLocationIfNeeded();
      }
    } catch {}

    setTimeout(() => {
      getCurrentLocation();
      startLocationUpdates();
    }, 1000);
  };

  const startLocationUpdates = () => {
    if (locationInterval.current) return; // Prevent duplicate intervals

    locationInterval.current = setInterval(() => {
      getCurrentLocation();
    }, 15000); // 15 seconds refresh
  };
  // ========= REQUEST PERMISSION =========
  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Required',
          message: 'Enable location to continue using the app',
          buttonPositive: 'OK',
        },
      );

      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        handleGPSCheck();
        getCurrentLocation();
      } else if (result === PermissionsAndroid.RESULTS.DENIED) {
        // Can still ask gain
        console.log('Permission Denied: Retrying...');
        showRetryAlert(); // Show a clear dialog instead of silent retry
      } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.log('Permission set to NEVER ASK AGAIN');
        stopLocationUpdates(); // Important!
        showSettingsPopup(); // Must redirect to settings
      }
    } catch (err) {
      console.log('Permission Error:', err);
    }
  };

  // ========= SHOW SETTINGS POPUP =========
  const showSettingsPopup = () => {
    Alert.alert(
      'Location Required',
      'Please enable location permission from Settings to continue',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings();
          },
        },
      ],
    );
  };

  const showRetryAlert = () => {
    Alert.alert(
      'Permission Required',
      'Location permission is needed for visit tracking.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Try Again',
          onPress: () => requestLocationPermission(),
        },
      ],
    );
  };

  const stopLocationUpdates = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
      console.log('Location updates stopped');
    }
  };

  // ========= GET CURRENT LOCATION =========
  const getCurrentLocation = () => {
    setLocationStatus('Getting Location...');

    // Try network FIRST → fast indoors
    Geolocation.getCurrentPosition(
      position => {
        updateLocation(position, false);
      },
      error => {
        console.log('Network Location failed => switching to GPS:', error);

        // Fallback to GPS satellite → works offline
        Geolocation.getCurrentPosition(
          gpsPos => {
            updateLocation(gpsPos, true);
          },
          gpsErr => {
            console.log('GPS also failed:', gpsErr);
            setLocationStatus(gpsErr.message);
            showSettingsPopup();
          },
          {
            enableHighAccuracy: true, // ← Satellite GPS
            timeout: 25000,
            maximumAge: 5000,
            distanceFilter: 0,
          },
        );
      },
      {
        enableHighAccuracy: false, // fast first
        timeout: 10000,
        maximumAge: 15000,
        distanceFilter: 0,
      },
    );
  };

  const updateLocation = (pos, isGPS) => {
    const lat = pos.coords.latitude.toFixed(6);
    const lng = pos.coords.longitude.toFixed(6);
    console.log(`Location obtained: ${lat}, ${lng} (GPS: ${isGPS})`);
    setCurrentLatitude(lat);
    setCurrentLongitude(lng);

    setLocationStatus(
      isGPS ? 'GPS (Offline Ready)' : 'Network Location (Fast)',
    );
  };

  // ========= CHECK GPS ENABLED (ANDROID) =========
  const handleGPSCheck = async () => {
    if (Platform.OS === 'android') {
      try {
        const gpsEnabled = await isLocationEnabled();
        if (!gpsEnabled) {
          promptForEnableLocationIfNeeded();
        }
      } catch {}
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

  const fetchOfflineTableData = () => {
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

  const mvwtAreaListAPI = IDEmployeeList => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          IDEmployeeList;
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
            'CREATE TABLE IF NOT EXISTS CRM_offlineAreaList(IDArea INTEGER,IDHQ INTEGER,IDEmployee INTEGER,Name VARCHAR,EmployeeName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineAreaList(IDArea,IDHQ,IDEmployee,Name,EmployeeName) VALUES (?,?,?,?,?)';
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

  const startingDay = () => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    console.log(date);
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
                // console.log(result);
                if (!isNaN(result)) {
                  console.log('Start day success:', result);
                  // 🔔 Show local notification
                  showLocalNotification(
                    `Hi ${username}`,
                    `Successfully started your day!\nDate & Time: ${
                      date || 'N/A'
                    }.`,
                  );

                  const token = await getAccessToken(); // get Bearer token
                  const messageTitle = 'New StartDay Submitted';
                  const messageBody = `Employee ${username} started the day successfully at ${date}`;
                  await sendNotificationToManager(
                    useManagerToken,
                    messageTitle,
                    messageBody,
                    token,
                  );

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
                    // 🔔 Show local notification
                    showLocalNotification(
                      `Hi ${username}`,
                      `Successfully started your day!\nDate & Time: ${
                        date || 'N/A'
                      }.`,
                    );

                    const token = await getAccessToken(); // get Bearer token
                    const messageTitle = 'New StartDay Submitted';
                    const messageBody = `Employee ${username} started the day successfully at ${date}`;
                    await sendNotificationToManager(
                      useManagerToken,
                      messageTitle,
                      messageBody,
                      token,
                    );

                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              } else {
                try {
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
                    // 🔔 Show local notification
                    showLocalNotification(
                      `Hi ${username}`,
                      `Successfully started your day!\nDate & Time: ${
                        date || 'N/A'
                      }.`,
                    );

                    const token = await getAccessToken(); // get Bearer token
                    const messageTitle = 'New StartDay Submitted';
                    const messageBody = `Employee ${username} started the day successfully at ${date}`;
                    await sendNotificationToManager(
                      useManagerToken,
                      messageTitle,
                      messageBody,
                      token,
                    );

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
                  // 🔔 Show local notification
                  showLocalNotification(
                    `Hi ${username}`,
                    `Successfully started your day!\nDate & Time: ${
                      date || 'N/A'
                    }.`,
                  );

                  const token = await getAccessToken(); // get Bearer token
                  const messageTitle = 'New StartDay Submitted';
                  const messageBody = `Employee ${username} started the day successfully at ${date}`;
                  await sendNotificationToManager(
                    useManagerToken,
                    messageTitle,
                    messageBody,
                    token,
                  );

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
                    // 🔔 Show local notification
                    showLocalNotification(
                      `Hi ${username}`,
                      `Successfully started your day!\nDate & Time: ${
                        date || 'N/A'
                      }.`,
                    );

                    const token = await getAccessToken(); // get Bearer token
                    const messageTitle = 'New StartDay Submitted';
                    const messageBody = `Employee ${username} started the day successfully at ${date}`;
                    await sendNotificationToManager(
                      useManagerToken,
                      messageTitle,
                      messageBody,
                      token,
                    );

                    navigateBasedOnLeave();
                  } else {
                    Alert.alert('Else : ' + result.status);
                  }
                } catch (error) {
                  Alert.alert(error);
                }
              } else {
                try {
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
                    // 🔔 Show local notification
                    showLocalNotification(
                      `Hi ${username}`,
                      `Successfully started your day!\nDate & Time: ${
                        date || 'N/A'
                      }.`,
                    );

                    const token = await getAccessToken(); // get Bearer token
                    const messageTitle = 'New StartDay Submitted';
                    const messageBody = `Employee ${username} started the day successfully at ${date}`;
                    await sendNotificationToManager(
                      useManagerToken,
                      messageTitle,
                      messageBody,
                      token,
                    );

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
              // 🔔 Show local notification
              showLocalNotification(
                `Hi ${username}`,
                `Successfully started your day!\nDate & Time: ${
                  date || 'N/A'
                }.`,
              );

              navigateBasedOnLeave();
            } else {
              Alert.alert('You are offline contact with Admin!');
            }
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
      }
    }
  };

  // const sendNotificationToManager = async (managerToken, title, body, accessToken) => {
  //   try {
  //     const url = 'https://fcm.googleapis.com/v1/projects/iecrmnotificationapp-5ed0c/messages:send';

  //     const message = {
  //       message: {
  //         token: managerToken,
  //         notification: {
  //           title: title,
  //           body: body,
  //         },
  //       },
  //     };

  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify(message),
  //     });

  //     if (response.ok) {
  //       console.log('✅ Notification sent successfully');
  //     } else {
  //       const errTxt = await response.text();
  //       console.warn('❌ Failed to send notification:', errTxt);
  //     }
  //   } catch (error) {
  //     console.error('Error sending notification:', error);
  //   }
  // };

  const sendNotificationToManager = async (
    managerToken,
    title,
    body,
    accessToken,
  ) => {
    if (!managerToken || managerToken.trim() === '') {
      console.warn(
        '⚠️ No manager FCM token available — skipping notification.',
      );
      return;
    }
    try {
      const url =
        'https://fcm.googleapis.com/v1/projects/iecrmnotificationapp-5ed0c/messages:send';

      const message = {
        message: {
          token: managerToken,
          notification: {title, body},
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('✅ Notification sent successfully');
        return;
      }

      // Parse FCM error response
      let err;
      try {
        err = await response.json();
      } catch {
        console.warn('⚠️ FCM error not JSON');
        return;
      }

      console.warn('❌ Notification failed:', JSON.stringify(err, null, 2));

      const isUnregistered = err?.error?.details?.some(
        d => d.errorCode === 'UNREGISTERED',
      );

      if (isUnregistered) {
        console.log('⚠️ Manager token invalid — attempting refresh.');
        await regenerateManagerTokenLocal(managerToken);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const regenerateManagerTokenLocal = async oldToken => {
    try {
      const loginBody = {
        businessid: useBusinessID,
        email: empEmail,
        password: empPassword,
      };

      const response = await fetch(`${BASE_URL}/login/validlogin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginBody),
      });

      const data = await response.json();

      if (data?.Success && data?.Token) {
        const newToken = data.Token.trim();
        const oldTrimmed = oldToken?.trim();

        if (newToken === oldTrimmed) {
          console.log('ℹ️ New FCM token same as previous — skipping update.');
        } else {
          console.log('✅ New FCM token detected:', newToken);
          // Update locally only
          useManagerToken = newToken; // or setManagerToken(newToken);
        }
      } else {
        console.warn('⚠️ Failed to regenerate FCM token.');
      }
    } catch (error) {
      console.error('Error regenerating FCM token:', error);
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

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <View
        style={{
          backgroundColor: '#ffffff',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.3,
          margin: 10,
          elevation: 2,
          borderRadius: 8,
        }}>
        <View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons
              name="location-outline"
              size={30}
              color="#005696"
              style={{marginRight: 8}}
            />
            <Text style={{padding: 5}}>Time : {currTime}</Text>
            {/* <Text style={{ padding: 5 }}>Latitude : {currentLatitude}</Text>
            <Text style={{ padding: 5 }}>Longitude : {currentLongitude} </Text> */}
          </View>
          <View style={{flexDirection: 'row', padding: 10}}>
            {/* <Text style={{ padding: 5 }}>Time : {currTime}</Text> */}
            <Text style={{padding: 5}}>Latitude : {currentLatitude}</Text>
            <Text style={{padding: 5}}>Longitude : {currentLongitude} </Text>
          </View>
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
            multiline={true}
            numberOfLines={3}
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
    </KeyboardAwareLayout>
  );
};

export default StartDCRScreen;
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
    backgroundColor: '#b3b6c2ff',
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
    backgroundColor: '#b3b6c2ff',
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
