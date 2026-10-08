import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import {openDatabase} from 'react-native-sqlite-storage';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {CheckBox} from 'react-native-elements';
import CustomButton from '../components/custom/CustomButton';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import axios from 'axios';
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

// const data = [
//   {label: 'DOCTOR', value: '1'},
//   {label: 'WHOLESELLER/STOCKLIST', value: '2'},
//   {label: 'RETAILER', value: '3'},
//   {label: 'SUB STOCKLIST', value: '4'},
// ];

const UnlistedScreen = props => {
  const [isFocus, setIsFocus] = useState(false);
  const [useCode, setCode] = useState('');
  const [selectedAreaData, setSelectedAreaData] = useState([]);
  const [selectedMAreaData, setSelectedMAreaData] = useState([]);
  const [areaLabel, setareaLabel] = useState('');
  const [areaValue, setareaValue] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useName, setName] = useState('');
  const [useMobile, setMobile] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [checked, setChecked] = useState(false);
  const [custTLabel, setcustTLabel] = useState('');
  const [custTValue, setcustTValue] = useState('');
  const [shouldShowWT, setshouldShowWT] = useState(false);
  const [useData, setData] = useState([]);
  const [useQData, setQData] = useState([]);
  const [useQValue, setQValue] = useState('');
  const [useQLabel, setQLabel] = useState('');
  const [useSData, setSData] = useState([]);
  const [useSValue, setSValue] = useState('');
  const [useSLabel, setSLabel] = useState('');
  const [currTime, setcurrTime] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [divisionID, setdivisionID] = useState('');
  const [useIDHQ, setIDHQ] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [usemVwtData, setusemVwtData] = useState([]);
  const [useMVWT, setMVWT] = useState([]);
  const [useMVWTIDEmployee, setMVWTIDEmployee] = useState([]);
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useCData, setCData] = useState([]);
  const [useCValue, setCValue] = useState('');
  const [useCLabel, setCLabel] = useState('');

  var cdate = moment().format('D/MMM/YYYY');

  useEffect(() => {
    getData();
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();

    setInterval(() => {
      setcurrTime(new Date().toLocaleTimeString());
      //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
    }, 1000);

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDHQ(user.IDHQ);
          setDivision(user.Division);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setdivisionID(user.IDDivision);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setIDEmployee(user.IDEmployee);
          //console.warn(user);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const turl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=UNLISTED';
              //console.log(turl);
              var config = {
                method: 'get',
                url: turl,
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
                  setData(wtNameArray);
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
                      value: response.data[i].IDArea,
                      label: response.data[i].Name,
                    });
                  }
                  setSelectedAreaData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const qurl =
                BASE_URL +
                'Qualification/QualificationList?Businessid=' +
                user.BusinessID;
              //console.log(qurl);
              var config = {
                method: 'get',
                url: qurl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDQualification,
                      label: response.data[i].Name,
                    });
                  }
                  setQData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const curl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=PRODUCTCLASS';
              //console.log(curl);
              var config = {
                method: 'get',
                url: curl,
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
                  setCData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const surl =
                BASE_URL +
                'Speciality/SpecialityList?Businessid=' +
                user.BusinessID;
              //console.log(surl);
              var config = {
                method: 'get',
                url: surl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDSpeciality,
                      label: response.data[i].Name,
                    });
                  }
                  setSData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const empurl =
                BASE_URL +
                'Employee/DivisionWiseEmployeeList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&IDEmployeeDesignation=0';
              //console.log(empurl);
              var config = {
                method: 'get',
                url: empurl,
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
                  setMvisitWTDataSelected(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
            } else {
              fetchOfflineTableData();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  const fetchOfflineTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Unlisted_Type',
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
            setData(temp);
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
                value: results.rows.item(i).IDArea,
                label: results.rows.item(i).Name,
              });
            setSelectedAreaData(temp);
            console.log('Data is inserted:', temp);
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
        'SELECT * FROM CRM_Qualification',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDQualification,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setQData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Category',
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
            setCData(temp);
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Speciality',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDSpeciality,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setSData(temp);
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

    //Retrieve data from MangerVisitWithTBL
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM MangerVisitWithTBL',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push({
                value: results.rows.item(i).EmployeeName,
                key: results.rows.item(i).IDEmployee,
              });
            setMvisitWTDataSelected(temp);
            console.log('Manger Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setSelectedMAreaData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
  };
  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
        props.navigation.navigate('AppNavScreen');
      } else if (checkEnabled === true) {
        //Alert.alert('GPS Active');
        //getOneTimeLocation();
        getMultipleTimeLocation();
      }
    }
  };

  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        //console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    }
  };

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
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 1000},
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
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const multiSelectMVWT = () => {
    let mvwt = usemVwtData;
    let mvwtList = mvwt.toString();
    //console.log(mvwt);

    // Example array of values for the IN clause
    const values = mvwt;

    // Construct the SQL query dynamically with the values
    const sqlQuery = `SELECT * FROM MangerVisitWithTBL WHERE IDEmployee IN (${values
      .map(() => '?')
      .join(',')})`;

    // Execute the query
    db.transaction(tx => {
      //tx.executeSql(sqlQuery, values, (_, { rows }) => {
      tx.executeSql(
        sqlQuery,
        values,
        (_, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                //value: results.rows.item(i).Name,
                Name: results.rows.item(i).Name,
                //IDEmployee: results.rows.item(i).IDEmployee,
                //label: results.rows.item(i).Name,
              });
            }
            setMVWT(temp);
            console.log(temp);

            var tempIDEmployee = [];
            for (let i = 0; i < results.rows.length; ++i) {
              tempIDEmployee.push({
                IDEmployee: results.rows.item(i).IDEmployee,
              });
            }
            setMVWTIDEmployee(tempIDEmployee);
            console.log(tempIDEmployee);
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

    //mvwtAreaListAPI(mvwtList);
    mvwtAreaListAPI(mvwt);
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
                value: response.data[i].IDArea,
                label: response.data[i].Name,
              });
            }
            setSelectedMAreaData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
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
              // console.log('Query results:', results.rows.length);
              // console.log('Query values:', values);
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDArea,
                    label: results.rows.item(i).Name,
                  });
                }
                setSelectedMAreaData(temp);
                //console.log(temp);
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

  const saveCustomer = () => {
    if (currentLongitude == 0.0 && currentLatitude == 0.0) {
      Alert.alert(
        'Invalid Location',
        'Latitude and Longitude are both 0.00. Closing the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              BackHandler.exitApp(); // This will close the app
              props.navigation.navigate('AppNavScreen');
            },
          },
        ],
        {cancelable: false},
      );
    } else if (custTLabel === '') {
      Alert.alert('Select Customer Type');
    } else if (areaLabel === '') {
      Alert.alert('Select Area');
    } else if (useName === '') {
      Alert.alert('Type Name');
    } else if (useMobile === '') {
      Alert.alert('Type Mobile');
    } else {
      db.transaction(txn => {
        ///txn.executeSql('DELETE from CRM_UnlistedCode');
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_UnlistedCode(id INTEGER PRIMARY KEY AUTOINCREMENT,TestValue VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_UnlistedCode(TestValue) VALUES (?)';
      let params = [useName]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_UnlistedCode',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i).id);
              }
              var res = temp.toString();
              //setCode(res);
              //console.log(res);
              saveData(res);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };

  const saveData = res => {
    let deviceId = DeviceInfo.getDeviceId();
    let IDCode = deviceId + res;
    let mvwt = usemVwtData;
    let mvwtList = mvwt.toString();

    var apprv_value;
    if (checked) {
      //apprv_value = 'True';
      apprv_value = true;
    } else {
      //apprv_value = 'False';
      apprv_value = false;
    }

    if (currentLongitude == 0.0 && currentLatitude == 0.0) {
      Alert.alert(
        'Invalid Location',
        'Latitude and Longitude are both 0.00. Closing the app.',
        [
          {
            text: 'OK',
            onPress: () => {
              BackHandler.exitApp(); // This will close the app
            },
          },
        ],
        {cancelable: false},
      );
    } else {
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            if (useManagerAccess === true) {
              if (shouldShowWT === true) {
                let param = {
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  IDDivision: divisionID,
                  Code: IDCode,
                  Name: useName,
                  IDArea: areaValue,
                  Mobile: useMobile,
                  IDCategory: useCValue,
                  Employee: {IDEmployee: useIDEmployee},
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  IDQualification: useQValue,
                  IDSpeciality: useSValue,
                  IDHQ: 0,
                  SendForApproval: apprv_value,
                };
                console.log('Doc User', param);

                let result = await fetch(
                  BASE_URL + 'Doctor/UNListedDoctorAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let idDoctor = result.doctorid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });

                  try {
                    AsyncStorage.getItem('IDday').then(value => {
                      if (value != null) {
                        let IDday = JSON.parse(value);
                        Alert.alert(
                          'Success',
                          'Record Successfully Saved',
                          [
                            {
                              text: 'Ok',
                              //onPress: () => navigation.navigate('AppNavDCRScreen'),
                              onPress: () =>
                                props.navigation.navigate('Doctor Unlisted', {
                                  useName,
                                  IDCode,
                                  useMVWT,
                                  useMVWTIDEmployee,
                                  mvwt,
                                  IDday,
                                  idDoctor,
                                }),
                            },
                          ],
                          {cancelable: false},
                        );
                      }
                    });
                  } catch (error) {
                    Alert.alert(error);
                  }
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              } else {
                let param = {
                  IDRetailer: 0,
                  Code: IDCode,
                  Name: useName,
                  IDRetailerType: custTValue,
                  IDDivision: divisionID,
                  IDArea: areaValue,
                  Employee: {IDEmployee: useIDEmployee},
                  Mobile: useMobile,
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  UNListed: true,
                  SendForApproval: apprv_value,
                };
                console.log('Ret User', param);

                let result = await fetch(
                  BASE_URL + 'Retailer/UNListedRetailerAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let RetailerId = result.retailerid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  try {
                    AsyncStorage.getItem('IDday').then(value => {
                      if (value != null) {
                        let IDday = JSON.parse(value);
                        Alert.alert(
                          'Success',
                          'Record Successfully Saved',
                          [
                            {
                              text: 'Ok',
                              //onPress: () => navigation.navigate('AppNavDCRScreen'),
                              onPress: () =>
                                props.navigation.navigate('Retailer Unlisted', {
                                  useName,
                                  IDCode,
                                  useMVWT,
                                  useMVWTIDEmployee,
                                  mvwt,
                                  IDday,
                                  RetailerId,
                                }),
                            },
                          ],
                          {cancelable: false},
                        );
                      }
                    });
                  } catch (error) {
                    Alert.alert(error);
                  }
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              }
            } else {
              if (shouldShowWT === true) {
                let param = {
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  IDDivision: divisionID,
                  Code: IDCode,
                  Name: useName,
                  IDArea: areaValue,
                  Mobile: useMobile,
                  IDCategory: useCValue,
                  Employee: {IDEmployee: useIDEmployee},
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  IDQualification: useQValue,
                  IDSpeciality: useSValue,
                  IDHQ: 0,
                  SendForApproval: apprv_value,
                };
                console.log('Doc User', param);

                let result = await fetch(
                  BASE_URL + 'Doctor/UNListedDoctorAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let idDoctor = result.doctorid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(
                    'Success',
                    'Record Successfully Saved',
                    [
                      {
                        text: 'Ok',
                        //onPress: () => navigation.navigate('AppNavDCRScreen'),
                        onPress: () =>
                          props.navigation.navigate('Doctor Unlisted', {
                            useName,
                            IDCode,
                            useMVWT,
                            useMVWTIDEmployee,
                            mvwt,
                            idDoctor,
                            apprv_value,
                          }),
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              } else {
                let param = {
                  IDRetailer: 0,
                  Code: IDCode,
                  Name: useName,
                  IDRetailerType: custTValue,
                  IDDivision: divisionID,
                  Employee: {IDEmployee: useIDEmployee},
                  IDArea: areaValue,
                  Mobile: useMobile,
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  UNListed: true,
                  SendForApproval: apprv_value,
                };
                console.log('Ret User', param);

                let result = await fetch(
                  BASE_URL + 'Retailer/UNListedRetailerAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let RetailerId = result.retailerid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(
                    'Success',
                    'Record Successfully Saved',
                    [
                      {
                        text: 'Ok',
                        //onPress: () => navigation.navigate('AppNavDCRScreen'),
                        onPress: () =>
                          props.navigation.navigate('Retailer Unlisted', {
                            useName,
                            IDCode,
                            useMVWT,
                            useMVWTIDEmployee,
                            mvwt,
                            RetailerId,
                            apprv_value,
                          }),
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(result.result);
                }
              }
            }
          } else {
            Alert.alert('You Are Offline Contact With Administrator!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            if (useManagerAccess === true) {
              if (shouldShowWT === true) {
                let param = {
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  IDDivision: divisionID,
                  Code: IDCode,
                  Name: useName,
                  IDArea: areaValue,
                  Mobile: useMobile,
                  IDCategory: useCValue,
                  Employee: {IDEmployee: useIDEmployee},
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  IDQualification: useQValue,
                  IDSpeciality: useSValue,
                  IDHQ: 0,
                  SendForApproval: apprv_value,
                };
                console.log('Doc UserM', param);

                let result = await fetch(
                  BASE_URL + 'Doctor/UNListedDoctorAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let idDoctor = result.doctorid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });

                  try {
                    AsyncStorage.getItem('IDday').then(value => {
                      if (value != null) {
                        let IDday = JSON.parse(value);
                        Alert.alert(
                          'Success',
                          'Record Successfully Saved',
                          [
                            {
                              text: 'Ok',
                              //onPress: () => navigation.navigate('AppNavDCRScreen'),
                              onPress: () =>
                                props.navigation.navigate('Doctor Unlisted', {
                                  useName,
                                  IDCode,
                                  useMVWT,
                                  useMVWTIDEmployee,
                                  mvwt,
                                  IDday,
                                  idDoctor,
                                }),
                            },
                          ],
                          {cancelable: false},
                        );
                      }
                    });
                  } catch (error) {
                    Alert.alert(error);
                  }
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(result.result);
                }
              } else {
                let param = {
                  IDRetailer: 0,
                  Code: IDCode,
                  Name: useName,
                  IDRetailerType: custTValue,
                  IDDivision: divisionID,
                  Employee: {IDEmployee: useIDEmployee},
                  IDArea: areaValue,
                  Mobile: useMobile,
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  UNListed: true,
                  SendForApproval: apprv_value,
                };
                console.log('Ret User', param);

                let result = await fetch(
                  BASE_URL + 'Retailer/UNListedRetailerAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let RetailerId = result.retailerid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  try {
                    AsyncStorage.getItem('IDday').then(value => {
                      if (value != null) {
                        let IDday = JSON.parse(value);
                        Alert.alert(
                          'Success',
                          'Record Successfully Saved',
                          [
                            {
                              text: 'Ok',
                              //onPress: () => navigation.navigate('AppNavDCRScreen'),
                              onPress: () =>
                                props.navigation.navigate('Retailer Unlisted', {
                                  useName,
                                  IDCode,
                                  useMVWT,
                                  useMVWTIDEmployee,
                                  mvwt,
                                  IDday,
                                  RetailerId,
                                }),
                            },
                          ],
                          {cancelable: false},
                        );
                      }
                    });
                  } catch (error) {
                    console.log(error);
                  }
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              }
            } else {
              if (shouldShowWT === true) {
                let param = {
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  IDDivision: divisionID,
                  Code: IDCode,
                  Name: useName,
                  IDArea: areaValue,
                  Mobile: useMobile,
                  IDCategory: useCValue,
                  Employee: {IDEmployee: useIDEmployee},
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  IDQualification: useQValue,
                  IDSpeciality: useSValue,
                  IDHQ: 0,
                  SendForApproval: apprv_value,
                };
                console.log('Doc User', param);

                let result = await fetch(
                  BASE_URL + 'Doctor/UNListedDoctorAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let idDoctor = result.doctorid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(
                    'Success',
                    'Record Successfully Saved',
                    [
                      {
                        text: 'Ok',
                        //onPress: () => navigation.navigate('AppNavDCRScreen'),
                        onPress: () =>
                          props.navigation.navigate('Doctor Unlisted', {
                            useName,
                            IDCode,
                            useMVWT,
                            useMVWTIDEmployee,
                            mvwt,
                            idDoctor,
                            apprv_value,
                          }),
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              } else {
                let param = {
                  IDRetailer: 0,
                  Code: IDCode,
                  Name: useName,
                  IDRetailerType: custTValue,
                  IDDivision: divisionID,
                  Employee: {IDEmployee: useIDEmployee},
                  IDArea: areaValue,
                  Mobile: useMobile,
                  Latitude: currentLatitude,
                  Longitude: currentLongitude,
                  CreatedBy: empEmail,
                  Businessid: useBusinessID,
                  UNListed: true,
                  SendForApproval: apprv_value,
                };
                console.log('Ret User', param);

                let result = await fetch(
                  BASE_URL + 'Retailer/UNListedRetailerAddEdit',
                  {
                    method: 'POST',
                    headers: {
                      Accept: 'application/json',
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(param),
                  },
                );
                result = await result.json();
                //console.log(result);
                let RetailerId = result.retailerid;
                if (result.result === '') {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert(
                    'Success',
                    'Record Successfully Saved',
                    [
                      {
                        text: 'Ok',
                        //onPress: () => navigation.navigate('AppNavDCRScreen'),
                        onPress: () =>
                          props.navigation.navigate('Retailer Unlisted', {
                            useName,
                            IDCode,
                            useMVWT,
                            useMVWTIDEmployee,
                            mvwt,
                            RetailerId,
                            apprv_value,
                          }),
                      },
                    ],
                    {cancelable: false},
                  );
                } else {
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_UnlistedCode');
                  });
                  Alert.alert('Else : ' + result.result);
                }
              }
            }
          } else {
            if (useManagerAccess === true) {
              if (shouldShowWT === true) {
                //CREATE TABLE for CRM_UnlistedDoctor
                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
                  //IDCategory: useCValue,
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_ManagerUnlistedDoctor(CreatedBy VARCHAR,Businessid VARCHAR,IDDivision VARCHAR,Code VARCHAR,VisitWith VARCHAR,IDArea VARCHAR,Name VARCHAR,Mobile VARCHAR,IDCategory VARCHAR,Latitude VARCHAR,Longitude VARCHAR,IDQualification VARCHAR,IDSpeciality VARCHAR,IDHQ VARCHAR,IDEmployee VARCHAR)',
                    [],
                  );
                });

                let sql =
                  'INSERT INTO CRM_ManagerUnlistedDoctor(CreatedBy,Businessid,IDDivision,Code,VisitWith,IDArea,Name,Mobile,IDCategory,Latitude,Longitude,IDQualification,IDSpeciality,IDHQ,IDEmployee) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                let params = [
                  empEmail,
                  useBusinessID,
                  divisionID,
                  IDCode,
                  mvwtList,
                  areaValue,
                  useName,
                  useMobile,
                  useCValue,
                  currentLatitude,
                  currentLongitude,
                  useQValue,
                  useSValue,
                  useIDHQ,
                  useIDEmployee,
                ]; //storing user data in an array

                db.executeSql(sql, params);
                console.log(params);
                db.transaction(tx => {
                  tx.executeSql('DELETE from CRM_UnlistedCode');
                });
                props.navigation.navigate('Doctor Unlisted', {
                  useName,
                  IDCode,
                  useMVWT,
                  useMVWTIDEmployee,
                  mvwt,
                });
              } else {
                //CREATE TABLE for CRM_UnlistedRetailer
                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_ManagerUnlistedRetailer(CreatedBy VARCHAR,Businessid VARCHAR,IDDivision VARCHAR,Code VARCHAR,VisitWith VARCHAR,IDArea VARCHAR,Name VARCHAR,Mobile VARCHAR,Latitude VARCHAR,Longitude VARCHAR,IDRetailerType VARCHAR,IDEmployee VARCHAR)',
                    [],
                  );
                });

                let sql =
                  'INSERT INTO CRM_ManagerUnlistedRetailer(CreatedBy,Businessid,IDDivision,Code,VisitWith,IDArea,Name,Mobile,Latitude,Longitude,IDRetailerType,IDEmployee) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                let params = [
                  empEmail,
                  useBusinessID,
                  divisionID,
                  IDCode,
                  mvwtList,
                  areaValue,
                  useName,
                  useMobile,
                  currentLatitude,
                  currentLongitude,
                  custTValue,
                  useIDEmployee,
                ]; //storing user data in an array
                db.executeSql(sql, params);
                console.log(params);
                db.transaction(tx => {
                  tx.executeSql('DELETE from CRM_UnlistedCode');
                });
                props.navigation.navigate('Retailer Unlisted', {
                  useName,
                  IDCode,
                  useMVWT,
                  useMVWTIDEmployee,
                  mvwt,
                });
              }
            } else {
              if (shouldShowWT === true) {
                //CREATE TABLE for CRM_UnlistedDoctor
                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_UnlistedDoctor(CreatedBy VARCHAR,Businessid VARCHAR,IDDivision VARCHAR,Code VARCHAR,Name VARCHAR,IDArea VARCHAR,Mobile VARCHAR,IDCategory VARCHAR,Latitude VARCHAR,Longitude VARCHAR,IDQualification VARCHAR,IDSpeciality VARCHAR,IDHQ VARCHAR,SendForApproval NUMERIC,IDEmployee VARCHAR)',
                    [],
                  );
                });

                let sql =
                  'INSERT INTO CRM_UnlistedDoctor(CreatedBy,Businessid,IDDivision,Code,Name,IDArea,Mobile,IDCategory,Latitude,Longitude,IDQualification,IDSpeciality,IDHQ,SendForApproval,IDEmployee) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
                let params = [
                  empEmail,
                  useBusinessID,
                  divisionID,
                  IDCode,
                  useName,
                  areaValue,
                  useMobile,
                  useCValue,
                  currentLatitude,
                  currentLongitude,
                  useQValue,
                  useSValue,
                  useIDHQ,
                  apprv_value,
                  useIDEmployee,
                ]; //storing user data in an array

                db.executeSql(sql, params);
                console.log(params);
                db.transaction(tx => {
                  tx.executeSql('DELETE from CRM_UnlistedCode');
                });
                props.navigation.navigate('Doctor Unlisted', {useName, IDCode});
              } else {
                //CREATE TABLE for CRM_UnlistedRetailer
                db.transaction(txn => {
                  //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
                  txn.executeSql(
                    'CREATE TABLE IF NOT EXISTS CRM_UnlistedRetailer(CreatedBy VARCHAR,Businessid VARCHAR,IDDivision VARCHAR,Code VARCHAR,Name VARCHAR,IDArea VARCHAR,Mobile VARCHAR,Latitude VARCHAR,Longitude VARCHAR,IDRetailerType VARCHAR,SendForApproval NUMERIC,IDEmployee VARCHAR)',
                    [],
                  );
                });

                let sql =
                  'INSERT INTO CRM_UnlistedRetailer(CreatedBy,Businessid,IDDivision,Code,Name,IDArea,Mobile,Latitude,Longitude,IDRetailerType,SendForApproval,IDEmployee) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                let params = [
                  empEmail,
                  useBusinessID,
                  divisionID,
                  IDCode,
                  useName,
                  areaValue,
                  useMobile,
                  currentLatitude,
                  currentLongitude,
                  custTValue,
                  apprv_value,
                  useIDEmployee,
                ]; //storing user data in an array
                db.executeSql(sql, params);
                console.log(params);
                db.transaction(tx => {
                  tx.executeSql('DELETE from CRM_UnlistedCode');
                });
                props.navigation.navigate('Retailer Unlisted', {
                  useName,
                  IDCode,
                });
              }
            }
          }
        }, []);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        props.navigation.navigate('AppNavDCRScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [props.navigation]),
  );
  return (
    <>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <ScrollView
        style={{flex: 1, backgroundColor: false, margin: 10}}
        showsVerticalScrollIndicator={false}>
        <ImageBackground
          source={require('../images/bg2.png')}
          style={{height: Dimensions.get('window').height}}>
          {useManagerAccess ? (
            <View
              style={{
                backgroundColor: '#ffffff',
                padding: 8,
                //margin: 8,
                borderRadius: 14,
                // 🟢 3D EFFECT BELOW
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
                borderWidth: 0.5,
                borderColor: '#e0e0e0',
                //transform: [{ perspective: 800 }, { rotateX: '3deg' }, { rotateY: '-2deg' }],
                transform:
                  Platform.OS === 'android'
                    ? [
                        {perspective: 800},
                        {rotateX: '3deg'},
                        {rotateY: '-2deg'},
                      ]
                    : [], // ❗ No 3D transform on iOS
              }}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Customer Type' : '...'}
                searchPlaceholder="Search Customer Type"
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  setcustTLabel(item.label);
                  setcustTValue(item.value);
                  setIsFocus(false);
                  if (item.label === 'DOCTOR') {
                    setshouldShowWT(true);
                  } else {
                    setshouldShowWT(false);
                  }
                }}
              />
              <View style={{marginTop: 5, paddingTop: 5}}>
                <MultipleSelectList
                  setSelected={val => setusemVwtData(val)}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={() =>
                    //console.log(usevisitWTData)
                    multiSelectMVWT()
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{backgroundColor: 'green'}}
                  labelStyles={{fontWeight: '800', color: 'black'}}
                />
              </View>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={selectedMAreaData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Area' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setareaValue(item.value);
                  setareaLabel(item.label);
                  // handleState(item.value);
                  setIsFocus(false);
                }}
              />

              <TextInput
                label="Name"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                value={useName}
                onChangeText={text => setName(text)}
              />

              <View style={{marginTop: 2, paddingTop: 2}}>
                <TextInput
                  label="Mobile"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  value={useMobile}
                  keyboardType="numeric"
                  onChangeText={text => setMobile(text)}
                />
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useQData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Qualification' : '...'}
                      searchPlaceholder="Search..."
                      //value={wtdataLabel}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setQValue(item.value);
                        setQLabel(item.label);
                        // handleState(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>

              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useSData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Speciality' : '...'}
                      searchPlaceholder="Search..."
                      //value={wtdataLabel}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setSValue(item.value);
                        setSLabel(item.label);
                        // handleState(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useCData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Category' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.label);
                        setCLabel(item.label);
                        setCValue(item.value);
                        console.log(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                <CustomButton
                  //label={'Save Customer and Move Next'}
                  label={'Save'}
                  onPress={() => saveCustomer()}
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#ffffff',
                padding: 8,
                //margin: 8,
                borderRadius: 14,
                // 🟢 3D EFFECT BELOW
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 4},
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 8,
                borderWidth: 0.5,
                borderColor: '#e0e0e0',
                transform:
                  Platform.OS === 'android'
                    ? [
                        {perspective: 800},
                        {rotateX: '3deg'},
                        {rotateY: '-2deg'},
                      ]
                    : [], // ❗ No 3D transform on iOS
                // transform: [
                //   {perspective: 800},
                //   {rotateX: '3deg'},
                //   {rotateY: '-2deg'},
                // ],
              }}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Customer Type' : '...'}
                searchPlaceholder="Search Customer Type"
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  setcustTLabel(item.label);
                  setcustTValue(item.value);
                  setIsFocus(false);
                  if (item.label === 'DOCTOR') {
                    setshouldShowWT(true);
                  } else {
                    setshouldShowWT(false);
                  }
                }}
              />
              <View style={{marginTop: 5, paddingTop: 5}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={selectedAreaData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select Area' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setareaValue(item.value);
                    setareaLabel(item.label);
                    // handleState(item.value);
                    setIsFocus(false);
                  }}
                />
              </View>
              {/* <View style={{marginTop: 2, paddingTop: 2}}>
          <TextInput
            label="Division"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useDivision}
            editable={false}
          />
        </View> */}
              <View style={{marginTop: 2, paddingTop: 2}}>
                <TextInput
                  label="Name"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={useName}
                  onChangeText={text => setName(text)}
                />
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                <TextInput
                  label="Mobile"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  value={useMobile}
                  keyboardType="numeric"
                  onChangeText={text => setMobile(text)}
                />
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useQData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Qualification' : '...'}
                      searchPlaceholder="Search..."
                      //value={wtdataLabel}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setQValue(item.value);
                        setQLabel(item.label);
                        // handleState(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>

              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useSData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Speciality' : '...'}
                      searchPlaceholder="Search..."
                      //value={wtdataLabel}
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        setSValue(item.value);
                        setSLabel(item.label);
                        // handleState(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>

              <View style={{marginTop: 2, paddingTop: 2}}>
                {shouldShowWT ? (
                  <View style={{marginTop: 2, paddingTop: 2}}>
                    <Dropdown
                      style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={useCData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Category' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.label);
                        setCLabel(item.label);
                        setCValue(item.value);
                        console.log(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                ) : null}
              </View>
              <View style={style.wrapper}>
                <CheckBox
                  title="Approval Required"
                  checked={checked}
                  onPress={() => {
                    setChecked(!checked);
                    //checkBoxVal(!checked);
                  }}
                />
              </View>
              <View style={{marginTop: 2, paddingTop: 2}}>
                <CustomButton
                  //label={'Save Customer and Move Next'}
                  label={'Save'}
                  onPress={() => saveCustomer()}
                />
              </View>
            </View>
          )}
        </ImageBackground>
      </ScrollView>
    </>
  );
};

export default UnlistedScreen;

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
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 2,
    paddingTop: 2,
  },
});
