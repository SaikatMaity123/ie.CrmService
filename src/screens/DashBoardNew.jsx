import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  BackHandler,
  Linking,
  Modal,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import {openDatabase} from 'react-native-sqlite-storage';
import axios from 'axios';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';
import ProgressDialog from '../components/custom/ProgressDialog';

//database connection
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

const DashBoardNew = ({navigation}) => {
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useTrackingTime, setTrackingTime] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useDivision, setDivision] = useState('');
  const [useSecurityKey, setSecurityKey] = useState('');
  const [useEmpemail, setEmpemail] = useState('');
  const [useModalMessage, setModalMessage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [speed, setSpeed] = useState(null);
  const [connectionType, setConnectionType] = useState('');
  const [isPoorConnection, setIsPoorConnection] = useState(false);

  let tableCreated = false;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const measureSpeed = async () => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.log('No connection. Skipping speed check.');
      return;
    }

    const startTime = new Date().getTime();
    try {
      const response = await fetch(
        BASE_URL +
          'user/Mobile/Modulelist?Businessid=MEND-PVTL-890&Type=Mobile',
      );
      const data = await response.blob();
      const endTime = new Date().getTime();

      const duration = (endTime - startTime) / 1000; // in seconds
      const fileSizeInBytes = data.size;
      const speedInKbps = fileSizeInBytes / duration / 1024;

      setSpeed(speedInKbps);
      //console.log(`Internet Speed: ${speedInKbps.toFixed(2)} KB/s`);

      if (speedInKbps < 0.5) {
        setIsPoorConnection(true);
      } else {
        setIsPoorConnection(false);
      }
    } catch (error) {
      console.log('Skipping speed check due to network error.');
      setSpeed(null);
      setIsPoorConnection(false);
    }
  };

  useEffect(() => {
    // Get the current connection type and check if connected
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      console.log(`Connection Type: ${state.type}`);

      if (state.isConnected) {
        measureSpeed(); // Call measureSpeed only if connected
      } else {
        Alert.alert('No Internet');
        setIsPoorConnection(false); // Reset poor connection state if disconnected
      }
    });

    // Set interval to refresh speed every 5 seconds if connected
    const intervalId = setInterval(() => {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          measureSpeed();
        }
      });
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup the event listener and interval on unmount
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  //Get Current Month Name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const d = new Date();
  const month = monthNames[d.getMonth()];
  const cYear = moment().year();
  //console.log(month + ' ' + cYear);
  var cdate = moment().format('D/MMM/YYYY');
  var ctdate = moment().format('DD/MM/YYYY');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 5000);
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setTrackingTime(user.TrackingTime);
          setDivision(user.Division);
          setSecurityKey(user.SecurityKey);
          setEmpemail(user.Empemail);

          if (user.Designation === 'DY_ZSM') {
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                getAPIData(user.BusinessID);
              } else {
                Alert.alert('No Internet');
                fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
                // AsyncStorage.getItem('mainDashBoard')
                //   .then(storedValue => {
                //     if (storedValue !== null) {
                //       const retrievedJsonArray = JSON.parse(storedValue);
                //       console.log('Retrieved JSON array:', retrievedJsonArray);
                //       setData(retrievedJsonArray);
                //     } else {
                //       Alert.alert(
                //         'No data found in AsyncStorage for the specified key.',
                //       );
                //     }
                //   })
                //   .catch(error => {
                //     Alert.alert('Error retrieving JSON array:', error);
                //   });
              }
            }, []);
          } else if (user.Designation === 'ZSM') {
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                getAPIData(user.BusinessID);
              } else {
                Alert.alert('No Internet');
                fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
                // AsyncStorage.getItem('mainDashBoard')
                //   .then(storedValue => {
                //     if (storedValue !== null) {
                //       const retrievedJsonArray = JSON.parse(storedValue);
                //       console.log('Retrieved JSON array:', retrievedJsonArray);
                //       setData(retrievedJsonArray);
                //     } else {
                //       Alert.alert(
                //         'No data found in AsyncStorage for the specified key.',
                //       );
                //     }
                //   })
                //   .catch(error => {
                //     Alert.alert('Error retrieving JSON array:', error);
                //   });
              }
            }, []);
          } else {
            NetInfo.fetch().then(state => {
              if (state.isConnected) {
                getAPIData(user.BusinessID);
                areaList(user.BusinessID, user.IDHQ);
                // mangerareaList(user.BusinessID, user.IDEmployee);
                docList(user.BusinessID, user.IDEmployee);
                retList(user.BusinessID, user.IDEmployee);
                visitWithList(user.BusinessID, user.IDEmployee);
                wtDDOpen(user.BusinessID);
                //productList(user.BusinessID, user.IDDivision);
                getfinalSatge(user.BusinessID);
                doctorProductMappingOfflineList(
                  user.BusinessID,
                  user.Empemail,
                  user.IDEmployee,
                );
                // managerDoctorProductMappingOfflineList(
                //   user.BusinessID,
                //   user.IDEmployee,
                // );
                qualificationDDOpen(user.BusinessID);
                specialityDDOpen(user.BusinessID);
                categoryDDOpen(user.BusinessID);
                productMasterDoctor(user.BusinessID, user.IDDivision);
                areaMaster(user.BusinessID, user.IDDivision, user.IDHQ);
                typeAPI(user.BusinessID);
                unlistedtypeAPI(user.BusinessID);
                //managerVWTDDOpen(user.BusinessID, user.IDDivision);
                //managerVWTDDOpen(user.BusinessID, user.IDEmployee);
                managerEmployeeWiseOfflineAreaList(
                  user.BusinessID,
                  user.IDEmployee,
                );
                managerEmployeeWiseOfflineDoctorList(
                  user.BusinessID,
                  user.IDEmployee,
                );
                managerEmployeeWiseOfflineRetailerList(
                  user.BusinessID,
                  user.IDEmployee,
                );
                viewMasterDocList(
                  user.BusinessID,
                  user.Empemail,
                  user.IDEmployee,
                );
                viewMasterRetList(
                  user.BusinessID,
                  user.Empemail,
                  user.IDEmployee,
                );

                tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
                expenseBookingList(user.BusinessID, user.IDEmployee);
                orderbookingRetailerList(user.BusinessID, user.IDEmployee);
                expenseList(user.BusinessID, user.IDEmployee);
                expenseRequestList(user.BusinessID, user.IDEmployee);
                orderList(user.BusinessID, user.IDEmployee);
                orderBookingPrice(user.BusinessID);
                orderBookingBillingSeries(user.BusinessID);
                orderBookingProductList(user.BusinessID);
                productGift(user.BusinessID, user.IDDivision);
                productSample(user.BusinessID, user.IDDivision);
                ExpenseHead(user.BusinessID);
                doctorViewDCR(user.BusinessID, user.IDEmployee);
                retailerViewDCR(user.BusinessID, user.IDEmployee);
                unlistedViewDCR(user.BusinessID, user.IDEmployee);
                employeeWiseAreaList(user.BusinessID, user.IDEmployee);
                // offlineAreaList(
                //   user.BusinessID,
                //   user.IDDivision,
                //   user.IDEmployee,
                // );
                // offlineManagerDoctorList(
                //   user.BusinessID,
                //   user.IDDivision,
                //   user.IDEmployee,
                // );
                // offlineManagerRetailerList(
                //   user.BusinessID,
                //   user.IDDivision,
                //   user.IDEmployee,
                // );
                offlineOrderBookingCustomerListForManager(
                  user.BusinessID,
                  user.IDDivision,
                  user.IDEmployee,
                );
                offlineOrderBookingCustomerList(
                  user.BusinessID,
                  user.IDEmployee,
                );
                campaignData(user.BusinessID, user.IDEmployee);
                campaignproductData(user.BusinessID, user.IDEmployee);
                offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
                fetchGeofencingData(user.BusinessID, user.IDEmployee);
              } else {
                Alert.alert('No Internet');
                fetchDashboardFromSQLite(); // fatch the Data From the Sqlite
                // AsyncStorage.getItem('mainDashBoard')
                //   .then(storedValue => {
                //     if (storedValue !== null) {
                //       const retrievedJsonArray = JSON.parse(storedValue);
                //       console.log('Retrieved JSON array:', retrievedJsonArray);
                //       setData(retrievedJsonArray);
                //     } else {
                //       Alert.alert(
                //         'No data found in AsyncStorage for the specified key.',
                //       );
                //     }
                //   })
                //   .catch(error => {
                //     Alert.alert('Error retrieving JSON array:', error);
                //   });
              }
            }, []);
          }
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to go back?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  useEffect(() => {
    if (!tableCreated) {
      createTable();
      tableCreated = true; // Set flag to true once the table is created
    }
  }, []);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS DashboardData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ModuleName TEXT)`,
        [],
        () => console.log('DashboardData table created'),
        (_, error) => console.error('Table creation error:', error),
      );
    });
  };
  const getAPIData = async businessID => {
    const url =
      BASE_URL +
      'user/Mobile/Modulelist?Businessid=' +
      businessID +
      '&Type=Mobile';

    try {
      // Fetch data from API
      let result = await fetch(url);
      result = await result.json();
      // console.log('API response:', result);

      // Set data to state
      setData(result.result);

      // Stringify the result and store in AsyncStorage
      const dashBoardJsonArray = result.result;
      const jsonString = JSON.stringify(dashBoardJsonArray);

      await AsyncStorage.setItem('mainDashBoard', jsonString);

      // Store in SQLite (SQLite transaction setup)
      db.transaction(tx => {
        // Clear existing records in the table
        tx.executeSql('DELETE FROM DashboardData');

        // Insert each module into the database
        dashBoardJsonArray.forEach(module => {
          tx.executeSql(
            'INSERT INTO DashboardData (ModuleName) VALUES (?)',
            [module.ModuleName.trim()],
            () => console.log(`✅ Inserted: ${module.ModuleName}`),
            (_, err) => {
              console.error(' Insert error:', err);
              return false;
            },
          );
        });
      });

      // Optional: Update state
      setData(dashBoardJsonArray);
    } catch (error) {
      console.error(' API fetch/save error:', error);
      Alert.alert('Error', 'Failed to fetch or store dashboard modules.');
    }
  };

  // Fetch the Model Names from the Sqlite Database ..
  const fetchDashboardFromSQLite = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM DashboardData',
        [],
        (_, result) => {
          const rows = result.rows.raw();
          console.log(' Dashboard Modules from SQLite:', rows);
          if (rows.length > 0) {
            setData(rows); // Or update your UI
          } else {
            Alert.alert('No data found in SQLite for the specified table.');
          }
        },
        (_, err) => console.error(' Fetch error:', err),
      );
    });
  };

  const submit = async item => {
    if (item.ModuleName === 'TOUR PROGRAM') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          navigation.navigate('Tour Plan Submission');
        } else {
          Alert.alert('Internet Is Required!');
        }
      }, []);
    } else if (item.ModuleName === 'SETTINGS') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          navigation.navigate('SettingScreen');
        } else {
          Alert.alert('Internet Is Required!');
        }
      }, []);
    } else if (item.ModuleName === 'REPORTS') {
      const url =
        'https://crmfieldforceui.mendine.co.in/Login/MobileWebAccess?BusinessID=' +
        useBusinessID +
        '&email=' +
        useEmpemail +
        '&securitykey=' +
        useSecurityKey;
      console.log(url);

      Linking.openURL(url).catch(err =>
        console.error('An error occurred', err),
      );

      // NetInfo.fetch().then(async state => {
      //   if (state.isConnected) {
      //     // setLoading(true);
      //     // setTimeout(() => {
      //     //   setLoading(false);
      //     // }, 5000);
      //     // navigation.navigate('AppNavreport');
      //     //https://crmfieldforceui.mendine.co.in/Login/MobileWebAccess?BusinessID=MEDN-PVTL-890&email=mayukh.chowdhury@iecsl.co.in&securitykey=52DB45BC-14B5-4B7B-8D39-71B762E1558A-08C29BA8-B71A-4BB3-855D-2D12EB81188D
      //     //console.warn(useSecurityKey);

      //   } else {
      //     Alert.alert('Internet Is Required!');
      //   }
      // }, []);
    } else if (item.ModuleName === 'ORDER ') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 5000);
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS CRM_ProductOrder', []);
      });
      //navigation.navigate('AppNavOrder');
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          navigation.navigate('AppNavOrder');
        } else {
          //Alert.alert('No Internet!');
          navigation.navigate('AppNavOrder');
        }
      }, []);
    } else if (item.ModuleName === 'ACTIVITIES') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          if (useDivision === 'MARKETING') {
            navigation.navigate('Activity DashBoard');
          } else {
            Alert.alert('You are not authorized');
          }
        } else {
          Alert.alert('No Internet');
        }
      }, []);
    } else if (item.ModuleName === 'EXPENSE') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 5000);
      navigation.navigate('AppNavExpense');
      //Alert.alert('Work In Progress');
    } else if (item.ModuleName === 'MASTER') {
      if (useManagerAccess === true) {
        Alert.alert('Not Authorized');
      } else {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
        navigation.navigate('AppNavMaster');
      }
    } else if (item.ModuleName === 'DCR') {
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //checkStartDay();
            checkDCRData();
          } else {
            Alert.alert('Contact With Administrator!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            //checkStartDay();
            checkDCRData();
          } else {
            if (useManagerAccess === true) {
              db.transaction(tx => {
                // Execute a query to retrieve table information
                tx.executeSql(
                  //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
                  "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
                  [],
                  (tx, results) => {
                    // Check if any rows are returned
                    if (results.rows.length > 0) {
                      // Table exists
                      //console.warn('Table exists');
                      //navigation.navigate('AppNavDCRScreen');
                      //checkTableData();
                      db.transaction(tx => {
                        tx.executeSql(
                          // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                          'SELECT * FROM CRM_ManagerStartDayDummy where StartDate=?',
                          [cdate],
                          (tx, results) => {
                            // Check if there are rows in the result set
                            if (results.rows.length > 0) {
                              console.log('Table has data');
                              navigation.navigate('AppNavDCRScreen');
                            } else {
                              console.log('Table is empty');
                              //navigation.navigate('DCR Session');
                              Alert.alert(
                                'Start Your Day By Connecting Internet.',
                              );
                            }
                          },
                          error =>
                            console.error(
                              'Error executing SELECT query: ',
                              error,
                            ),
                        );
                      });
                    } else {
                      // Table does not exist
                      //console.warn('Table does not exists');
                      //navigation.navigate('DCR Session');
                      Alert.alert('Start Your Day By Connecting Internet.');
                    }
                  },
                  error => {
                    // Error occurred while executing the query
                    console.log(error);
                  },
                );
              });
            } else {
              // console.log(ctdate);
              db.transaction(tx => {
                tx.executeSql(
                  // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                  'SELECT * FROM CRM_offlinePendingDCRDate',
                  [],

                  (tx, results) => {
                    // Check if there are rows in the result set
                    if (results.rows.length > 0) {
                      console.log('Table has data');
                      Alert.alert('Go to Reports and clear your pending DCR');
                    } else {
                      console.log('Table is empty');
                      db.transaction(tx => {
                        // Execute a query to retrieve table information
                        tx.executeSql(
                          "SELECT name FROM sqlite_master WHERE type='table' AND name='Stay_Table'",
                          [],
                          (tx, results) => {
                            // Check if any rows are returned
                            if (results.rows.length > 0) {
                              // Table exists
                              console.warn('Stay_Table exists');
                              db.transaction(tx => {
                                tx.executeSql(
                                  // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
                                  'SELECT * FROM Stay_Table where StayDate=?',
                                  [cdate],
                                  (tx, results) => {
                                    // Check if there are rows in the result set
                                    if (results.rows.length > 0) {
                                      console.log('Table has data');
                                      Alert.alert(
                                        useEmpname +
                                          ' stay already exist on this date : ' +
                                          cdate,
                                      );
                                    } else {
                                      console.log('Table is empty');
                                      chectTourPlanData();
                                    }
                                  },
                                  error =>
                                    console.error(
                                      'Error executing SELECT query: ',
                                      error,
                                    ),
                                );
                              });
                            } else {
                              // Table does not exist
                              console.warn('Stay_Table does not exists');
                              chectTourPlanData();
                            }
                          },
                          error => {
                            // Error occurred while executing the query
                            Alert.alert(error);
                          },
                        );
                      });
                    }
                  },
                  error =>
                    console.error('Error executing SELECT query: ', error),
                );
              });
            }
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
      }
    } else if (item.ModuleName === 'SURVEY') {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          navigation.navigate('Quiz Dashboard');
        } else {
          Alert.alert('Internet Is Required!');
        }
      }, []);
    } else {
      Alert.alert(item.ModuleName);
    }
  };

  const checkStartDay = async () => {
    const url =
      BASE_URL +
      //'DCR/StartDayChecking?Businessid=' +
      'DCR/StartDay/Check?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      useIDEmployee +
      '&StartDate';
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    if (result.status === 'STARTED') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      checkStayData();
    } else if (result.status === 'NOTSTARTED') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      Alert.alert(result.status);
      navigation.navigate('DCR Session');
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      Alert.alert(result.status);
    }
    try {
      const jsonValue = JSON.stringify(result.idday);
      await AsyncStorage.setItem('IDday', jsonValue);
      //console.log(jsonValue);
    } catch (e) {
      // saving error
      Alert.alert(e);
    }
  };

  const checkDCRData = async () => {
    const url =
      BASE_URL +
      //'DCR/StartDayChecking?Businessid=' +
      'Configuration/LockDCR?Businessid=' +
      useBusinessID +
      '&IdEmployee=' +
      useIDEmployee;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    if (result.d === '') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      checkStartDay();
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      setModalMessage(result.d);
      toggleModal();
      //Alert.alert(result.d+'\n\n'+'Go to Reports and clear you pending DCR');
    }
  };

  const checkStayData = async () => {
    const stay_url =
      BASE_URL +
      'DCR/Stay/Check?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      useIDEmployee +
      '&DCRDate=' +
      cdate;
    console.log(stay_url);
    var config = {
      method: 'post',
      url: stay_url,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        //console.log(response.data.result);
        if (response.data.result === 'False') {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 5000);
          navigation.navigate('AppNavDCRScreen');
        } else if (response.data.result === 'True') {
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
          }, 3000);
          Alert.alert(
            useEmpname + ' stay already exist on this date : ' + cdate,
          );
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const areaList = (businessID, hqID) => {
    const aturl =
      BASE_URL +
      'Employee/EmpAreaList?Businessid=' +
      businessID +
      '&IDHQ=' +
      hqID;
    console.log('aturl ' + aturl);
    var config = {
      method: 'get',
      url: aturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_AreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_AreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_AreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  // const mangerareaList = (businessID, IDEmployee) => {
  //   const aturl =
  //     BASE_URL +
  //     'Manager/Area/List?Businessid=' +
  //     businessID +
  //     '&IDManager=' +
  //     IDEmployee;
  //   console.log('aturl ' + aturl);
  //   var config = {
  //     method: 'get',
  //     url: aturl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_AreaList
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS CRM_MangerAreaList', []);
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_MangerAreaList(IDArea INTEGER,Name VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT AreaListTBL
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql = 'INSERT INTO CRM_MangerAreaList(IDArea,Name) VALUES (?,?)';
  //         let params = [array.IDArea, array.Name]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  const docList = (businessID, empID) => {
    const docurl =
      BASE_URL +
      'Doctor/OfflineDoctorList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('docurl ' + docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_DocList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_DocList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DocList(IDDoctor INTEGER,Code INTEGER,IDArea INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DocList(IDDoctor,Code,IDArea,Latitude,Longitude,Name) VALUES (?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.Code,
            array.IDArea,
            array.Latitude1,
            array.Longitude1,
            array.Name,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const retList = (businessID, empID) => {
    const returl =
      BASE_URL +
      'Retailer/OfflineRetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_RetList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_RetList(IDRetailer INTEGER,Code INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name TEXT,Area TEXT,OtherCode TEXT)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_RetList(IDRetailer,Code,Latitude,Longitude,Name,Area,OtherCode) VALUES (?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.Latitude,
            array.Longitude,
            array.Name,
            array.Area.IDArea,
            array.OtherCode,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const doctorProductMappingOfflineList = (businessID, empEmail, idEmp) => {
    const returl =
      BASE_URL +
      'Doctor/DoctorProductMappingOfflineList?Businessid=' +
      businessID +
      '&employeeEmail=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data.d);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_DoctorProductMappingListt',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DoctorProductMappingListt(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
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
            'INSERT INTO CRM_DoctorProductMappingListt(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
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

  // const managerDoctorProductMappingOfflineList = (businessID, idemp) => {
  //   const returl =
  //     BASE_URL +
  //     'Doctor/ManagerDoctorProductMappingOfflineList?Businessid=' +
  //     businessID +
  //     '&IDManager=' +
  //     idemp;
  //   console.log('returlDhar ' + returl);
  //   var config = {
  //     method: 'get',
  //     url: returl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //console.log(response.data.d);
  //       //CREATE TABLE for CRM_RetList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_ManagerDoctorProductMappingOfflineList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorProductMappingOfflineList(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_DoctorProductMappingListt
  //       var _value = [];
  //       _value = response.data.d;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         //let duplicateData = 'DELETE from CRM_DocList';
  //         let sql =
  //           'INSERT INTO CRM_ManagerDoctorProductMappingOfflineList(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
  //         let params = [
  //           array.IDDoctor,
  //           array.IDProduct,
  //           array.IDStage,
  //           array.ProductName,
  //           array.StageName,
  //         ]; //storing user data in an array

  //         db.executeSql(sql, params);
  //       }
  //       //console.log(_value);
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  const visitWithList = (businessID, idemp) => {
    const vwturl =
      BASE_URL +
      'Employee/EmployeeUpwardManagerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));

        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_VisitWithList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_VisitWithList(IDEmployee INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_VisitWithList(IDEmployee,Name) VALUES (?,?)';
          let params = [array.IDEmployee, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const employeeWiseAreaList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'Area/EmployeeWiseAreaList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeWiseAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_EmployeeWiseAreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_EmployeeWiseAreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  // const offlineAreaList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'Area/OfflineAreaList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS CRM_offlineAreaList', []);
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineAreaList(IDArea INTEGER,IDHQ INTEGER,IDEmployee INTEGER,AreaName VARCHAR,EmployeeName VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineAreaList(IDArea,IDHQ,IDEmployee,AreaName,EmployeeName) VALUES (?,?,?,?,?)';
  //         let params = [
  //           array.IDArea,
  //           array.IDHQ,
  //           array.IDEmployee,
  //           array.AreaName,
  //           array.EmployeeName,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  // const offlineManagerDoctorList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'manager/DCR/OfflineManagerDoctorList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_offlineManagerDoctorList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineManagerDoctorList(IDDoctor INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineManagerDoctorList(IDDoctor,IDEmployee,IDArea,Name,Latitude,Longitude) VALUES (?,?,?,?,?,?)';
  //         let params = [
  //           array.IDDoctor,
  //           array.IDEmployee,
  //           array.IDArea,
  //           array.Name,
  //           array.Latitude,
  //           array.Longitude,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  // const offlineManagerRetailerList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'manager/DCR/OfflineManagerRetailerList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_offlineManagerRetailerList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineManagerRetailerList(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineManagerRetailerList(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
  //         let params = [
  //           array.IDRetailer,
  //           array.IDEmployee,
  //           array.IDArea,
  //           array.Name,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  const offlineOrderBookingCustomerListForManager = (
    businessID,
    idDiv,
    idemp,
  ) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerListForManager?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerListForManager',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerListForManager(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerListForManager(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDEmployee,
            array.IDArea,
            array.Name,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //Alert.alert(sql + ' ' + params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const offlineOrderBookingCustomerList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerList(IDRetailer INTEGER,Code VARCHAR,OtherCode VARCHAR,Name VARCHAR,IDArea INTEGER)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerList(IDRetailer,Code,OtherCode,Name,IDArea) VALUES (?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.OtherCode,
            array.Name,
            array.IDArea,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignData = (businessID, idemp) => {
    const campurl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(campurl);
    var config = {
      method: 'get',
      url: campurl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_Campaign', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Campaign(IDCampaign VARCHAR,Campaign VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_Campaign(IDCampaign,Campaign) VALUES (?,?)';
          let params = [array.IDCampaign, array.Campaign]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignproductData = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_CampaignProduct', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_CampaignProduct(IDProduct VARCHAR,Product VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_CampaignProduct(IDProduct,Product) VALUES (?,?)';
          let params = [array.IDProduct, array.Product]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const offlinePendingDCRDate = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/OfflinePendingDCRDate?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_offlinePendingDCRDate', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlinePendingDCRDate(DCRDate VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_offlinePendingDCRDate
        var _value = [];
        _value = response.data;
        console.log('_value', _value);

        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_offlinePendingDCRDate(DCRDate) VALUES (?)';
          let params = [array.DCRDate]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const fetchGeofencingData = async (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/MobileGeofencing?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    try {
      const response = await fetch(produrl);
      const data = await response.json();

      db.transaction(tx => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS Geofencing (
            IDEmployee INTEGER PRIMARY KEY,
            Geofencing TEXT,
            EmployeeName TEXT,
            DoctorGeoFencing INTEGER,
            RetailerGeoFencing INTEGER
          );`,
        );
      });
      // Save to SQLite
      if (data.length > 0) {
        const item = data[0];
        db.transaction(tx => {
          tx.executeSql(
            `INSERT OR REPLACE INTO Geofencing (IDEmployee, Geofencing, EmployeeName, DoctorGeoFencing, RetailerGeoFencing) VALUES (?, ?, ?, ?, ?)`,
            [
              item.IDEmployee,
              item.Geofencing,
              item.EmployeeName,
              item.DoctorGeoFencing,
              item.RetailerGeoFencing,
            ],
          );
        });
      }
    } catch (error) {
      console.error('Error fetching geofencing data:', error);
    }
  };

  const wtDDOpen = businessID => {
    //console.log(useBusinessID);
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=WORKTYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for WorkTypeTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_WorkTypeList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_WorkTypeList(IDMisc INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT WorkTypeTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_WorkTypeList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const productGift = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=GIFT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_GIFT', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_GIFT(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_GIFT(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const productSample = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=DOCTORPRODUCT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_SAMPLE', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_SAMPLE(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO CRM_SAMPLE(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const getfinalSatge = async businessID => {
    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_finalStageList', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_finalStageList(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_finalStageList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const qualificationDDOpen = businessID => {
    //console.log(useBusinessID);
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
    console.log(qurl);
    var config = {
      method: 'get',
      url: qurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Qualification', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Qualification(IDQualification INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var qualificationArray = [];
        qualificationArray = response.data;
        for (var i = 0; i < qualificationArray.length; i++) {
          const array = qualificationArray[i];

          let sql =
            'INSERT INTO CRM_Qualification(IDQualification,Name) VALUES (?,?)';
          let params = [array.IDQualification, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const specialityDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Speciality', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Speciality(IDSpeciality INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.error('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Speciality(IDSpeciality,Name) VALUES (?,?)';
          let params = [array.IDSpeciality, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const categoryDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Category', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Category(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Category(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const productMasterDoctor = (businessID, IDDivision) => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      IDDivision +
      '&Type=DOCTORPRODUCT';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Doctor_Product', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Doctor_Product(IDProduct INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Master_Doctor_Product(IDProduct,Name) VALUES (?,?)';
          let params = [array.IDProduct, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const areaMaster = (businessID, empEmail, IDHQ) => {
    // const surl =
    //   BASE_URL +
    //   'Area/DivisionWiseAreaList?Businessid=' +
    //   businessID +
    //   '&IDDivision=' +
    //   empEmail;
    const surl =
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      empEmail +
      '&IDHQ=' +
      IDHQ;
    console.log('surllll', surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Area', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Area(IDArea INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Area(IDArea,Name) VALUES (?,?)';
          let params = [array.IDArea, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const typeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=RETAILERTYPE';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const unlistedtypeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=UNLISTED';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Unlisted_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Unlisted_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Unlisted_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  // const managerVWTDDOpen = (businessID, IDEmployee) => {
  //   //console.log(useBusinessID);
  //   const empurl =
  //     // BASE_URL +
  //     // 'Employee/DivisionWiseEmployeeList?Businessid=' +
  //     // businessID +
  //     // '&IDDivision=' +
  //     // IDDivision +
  //     // '&IDEmployeeDesignation=0';

  //     BASE_URL +
  //     'Employee/Hierarchy/All?Businessid=' +
  //     businessID +
  //     '&IDEmployee=' +
  //     IDEmployee;
  //   console.log(empurl);
  //   var config = {
  //     method: 'get',
  //     url: empurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for MangerVisitWithTBL
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS MangerVisitWithTBL', []);
  //         txn.executeSql(
  //           //'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(Name VARCHAR,IDEmployee VARCHAR)',
  //           'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(EmployeeName VARCHAR,IDEmployee VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT MangerVisitWithTBL
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           //'INSERT INTO MangerVisitWithTBL(Name,IDEmployee) VALUES (?,?)';
  //           'INSERT INTO MangerVisitWithTBL(EmployeeName,IDEmployee) VALUES (?,?)';
  //         //let params = [array.Name, array.IDEmployee]; //storing user data in an array
  //         let params = [array.EmployeeName, array.IDEmployee]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  const managerEmployeeWiseOfflineAreaList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Area/ManagerEmployeeWiseOfflineAreaList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
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
  };
  const managerEmployeeWiseOfflineDoctorList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/ManagerEmployeeWiseOfflineDoctorList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseDoctorList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseDoctorList(IDDoctor INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude1 VARCHAR,Longitude1 VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseDoctorList(IDDoctor,IDArea,Name,AreaName,IDEmployee,Code,Latitude1,Longitude1) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude1,
            array.Longitude1,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log('ProductName',array.Product.ProductName);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineRetailerList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/ManagerEmployeeWiseOfflineRetailerList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseRetailerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseRetailerList(IDRetailer INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseRetailerList(IDRetailer,IDArea,Name,AreaName,IDEmployee,Code,Latitude,Longitude) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude,
            array.Longitude,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const viewMasterDocList = (businessID, empEmail, idEmp) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/Mobile/List?Businessid=' +
      businessID +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        // db.transaction(txn => {
        //   //txn.executeSql('DROP TABLE IF EXISTS ViewMasterDocList', []);
        //   txn.executeSql(
        //     'CREATE TABLE IF NOT EXISTS ViewMasterDocList(IDDoctor INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
        //     [],
        //   );
        // });
        // var _value = [];
        // _value = response.data;
        // for (var j = 0; j < _value.length; j++) {
        //   const array = _value[j];
        //   let sql =
        //     'INSERT INTO ViewMasterDocList(IDDoctor,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
        //   let params = [
        //     array.IDDoctor,
        //     array.Code,
        //     array.Name,
        //     array.Area,
        //     array.ApprovalStatus,
        //   ]; //storing user data in an array
        //   db.executeSql(sql, params);
        // }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const viewMasterRetList = (businessID, empEmail, idEmp) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/Mobile/List?Businessid=' +
      businessID +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        // db.transaction(txn => {
        //   //txn.executeSql('DROP TABLE IF EXISTS ViewMasterRetList', []);
        //   txn.executeSql(
        //     'CREATE TABLE IF NOT EXISTS ViewMasterRetList(IDRetailer INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
        //     [],
        //   );
        // });
        // var _value = [];
        // _value = response.data;
        // for (var j = 0; j < _value.length; j++) {
        //   const array = _value[j];
        //   let sql =
        //     'INSERT INTO ViewMasterRetList(IDRetailer,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
        //   let params = [
        //     array.IDRetailer,
        //     array.Code,
        //     array.Name,
        //     array.Area,
        //     array.ApprovalStatus,
        //   ]; //storing user data in an array
        //   db.executeSql(sql, params);
        // }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const expenseBookingList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'ExpenseBooking/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS ViewExpenseBookingList', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ViewExpenseBookingList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ViewExpenseBookingList(IDBooking,Bookingno,BookingDate,BookingAmount) VALUES (?,?,?,?)';
          let params = [
            array.IDBooking,
            array.Bookingno,
            array.BookingDate,
            array.BookingAmount,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderbookingRetailerList = (businessID, idEmp) => {
    const retUrl =
      BASE_URL +
      'Retailer/RetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log('retUrl ' + retUrl);
    var config = {
      method: 'get',
      url: retUrl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingRetList', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingRetList(OtherCode VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingRetList(OtherCode,Name) VALUES (?,?)';
          let params = [array.OtherCode, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderBookingPrice = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=ORDERPRICETYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingPrice', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingPrice(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO OrderBookingPrice(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const orderBookingBillingSeries = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=BILLINGSERIES';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingBillingSeries', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingBillingSeries(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingBillingSeries(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderBookingProductList = async businessID => {
    try {
      const url = BASE_URL + 'Product/Order/List?Businessid=' + businessID;
      console.log(url);
      let result = await fetch(url);
      result = await result.json();

      db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS OrderBookingProductList', []);
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS OrderBookingProductList(IDProduct INTEGER,Code VARCHAR,Name VARCHAR,PackSize VARCHAR,MRP VARCHAR,PurRate VARCHAR)',
          [],
          (tx, results) => {
            //console.log('Table created successfully');
          },
          error => {
            Alert.alert('Error creating table:', error);
          },
        );
      });
      var _value = [];
      _value = result;
      for (var i = 0; i < _value.length; i++) {
        const array = _value[i];

        let sql =
          'INSERT INTO OrderBookingProductList(IDProduct,Code,Name,PackSize,MRP,PurRate) VALUES (?,?,?,?,?,?)';
        let params = [
          array.IDProduct,
          array.Code,
          array.Name,
          array.PackSize,
          array.MRP,
          array.PurRate,
        ]; //storing user data in an array
        db.executeSql(sql, params);
        //console.log(params);
      }
    } catch (error) {
      Alert.alert(error);
    }
  };

  const ExpenseHead = businessID => {
    const wturl = BASE_URL + 'Expensehead/List?Businessid=' + businessID;
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseHead', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_ExpenseHead(IDExpenseHead VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        //console.log('Expense HEAD', _value);
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_ExpenseHead(IDExpenseHead,Name) VALUES (?,?)';
          let params = [array.IDExpenseHead, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const expenseList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    //console.log('result',result);

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseList(IDBooking INTEGER,Bookingno VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,BookingDate VARCHAR)',
        [],
      );
    });
    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseList(IDBooking,Bookingno,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,BookingDate) VALUES (?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.BookingDate,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const orderList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'OrderBooking/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_OrderList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_OrderList(IDBooking INTEGER,BookingNo VARCHAR,BookingDate VARCHAR,EmployeeCode VARCHAR,EmployeeName VARCHAR,CustomerCode VARCHAR,CustomerName VARCHAR,ProductCode VARCHAR,ProductName VARCHAR,Division VARCHAR,Qty VARCHAR,Amount VARCHAR)',
        [],
      );
    });
    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_OrderList(IDBooking,BookingNo,BookingDate,EmployeeCode,EmployeeName,CustomerCode,CustomerName,ProductCode,ProductName,Division,Qty,Amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.BookingNo,
        array.BookingDate,
        array.EmployeeCode,
        array.EmployeeName,
        array.CustomerCode,
        array.CustomerName,
        array.ProductCode,
        array.ProductName,
        array.Division,
        array.Qty,
        array.Amount,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const expenseRequestList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/Requested/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseRequestList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseRequestList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,MonthName VARCHAR)',
        [],
      );
    });

    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseRequestList(IDBooking,Bookingno,BookingDate,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,MonthName) VALUES (?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingDate,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.MonthName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const doctorViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewDocDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewDocDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const retailerViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewRetDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewRetDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const unlistedViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineMangerViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineMangerViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineMangerViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const tourdateCheck = async (businessID, month, year, idEmp) => {
    const url =
      BASE_URL +
      'TourProgram/List?Businessid=' +
      businessID +
      '&Month=' +
      month +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log('tourdateCheck', url);
    let result = await fetch(url);
    result = await result.json();

    //CREATE TABLE for CRM_TourPlanDate
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_TourPlanDate', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_TourPlanDate(TourDate VARCHAR,Approved VARCHAR)',
        [],
      );
    });

    //SQLITE INSERT CRM_TourPlanDate
    var _value = [];
    _value = result;
    //console.log(_value);
    for (var j = 0; j < _value.length; j++) {
      const array = _value[j];
      let sql = 'INSERT INTO CRM_TourPlanDate(TourDate,Approved) VALUES (?,?)';
      let params = [array.TourDate, array.Approved]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const chectTourPlanData = () => {
    // if (useManagerAccess === true) {
    //   db.transaction(tx => {
    //     tx.executeSql(
    //       'SELECT * FROM CRM_TourPlanDate where TourDate=? AND Approved = ?',
    //       [ctdate, true],
    //       (tx, results) => {
    //         // Check if there are rows in the result set
    //         if (results.rows.length > 0) {
    //           console.warn('Tour Program Approved');
    //           db.transaction(tx => {
    //             // Execute a query to retrieve table information
    //             tx.executeSql(
    //               //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
    //               "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_ManagerStartDayDummy'",
    //               [],
    //               (tx, results) => {
    //                 // Check if any rows are returned
    //                 if (results.rows.length > 0) {
    //                   // Table exists
    //                   console.warn('Table exists');
    //                   //navigation.navigate('AppNavDCRScreen');
    //                   checkTableData();
    //                 } else {
    //                   // Table does not exist
    //                   console.warn('Table does not exists');
    //                   navigation.navigate('DCR Session');
    //                 }
    //               },
    //               error => {
    //                 // Error occurred while executing the query
    //                 console.log(error);
    //               },
    //             );
    //           });
    //         } else {
    //           console.log('Table is empty');
    //           Alert.alert('Tour Program not found on this day: ' + ctdate);
    //         }
    //       },
    //       error => console.error('Error executing SELECT query: ', error),
    //     );
    //   });
    // }
    // else {
    db.transaction(tx => {
      tx.executeSql(
        // 'SELECT * FROM CRM_ManagerStartDay where StartDate=?',
        //'SELECT * FROM CRM_TourPlanDate where TourDate=?',
        'SELECT * FROM CRM_TourPlanDate where TourDate=? AND Approved = ?',
        [ctdate, true],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.warn('Tour Program Approved');
            db.transaction(tx => {
              // Execute a query to retrieve table information
              tx.executeSql(
                //"SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDay'",
                "SELECT name FROM sqlite_master WHERE type='table' AND name='CRM_StartDayDummy'",
                [],
                (tx, results) => {
                  // Check if any rows are returned
                  if (results.rows.length > 0) {
                    // Table exists
                    console.warn('Table exists');
                    //navigation.navigate('AppNavDCRScreen');
                    checkTableData();
                  } else {
                    // Table does not exist
                    console.warn('Table does not exists');
                    navigation.navigate('DCR Session');
                  }
                },
                error => {
                  // Error occurred while executing the query
                  console.log(error);
                },
              );
            });
          } else {
            console.log('Table is empty');
            Alert.alert('Tour Program not found on this day: ' + ctdate);
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
    //}
  };

  const checkTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        //'SELECT * FROM CRM_StartDay where StartDate=?',
        'SELECT * FROM CRM_StartDayDummy where StartDate=?',
        [cdate],
        (tx, results) => {
          // Check if there are rows in the result set
          if (results.rows.length > 0) {
            console.log('Table has data');
            navigation.navigate('AppNavDCRScreen');
          } else {
            console.log('Table is empty');
            navigation.navigate('DCR Session');
          }
        },
        error => console.error('Error executing SELECT query: ', error),
      );
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      {/* <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}> */}
      <View style={styles.container}>
        {isPoorConnection && (
          <Text style={styles.warningText}>Poor Internet connection !</Text>
        )}
        <CRMImg height={100} width={100} />
        <FlatList
          data={data}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => submit(item)}>
              <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                <HomeImg
                  height={30}
                  width={30}
                  style={styles.imageDesign}
                  // style={{transform: [{rotate: '-5deg'}]}}
                />
                <Text style={styles.menuItem}>{item.ModuleName}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal
        transparent={true}
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>✖</Text>
            </View>
            <Text style={styles.modalTitle}>Error</Text> */}
            <Text style={styles.modalMessage}>
              {useModalMessage}.Go to Reports and clear your pending DCR.
            </Text>
            <TouchableOpacity onPress={toggleModal} style={styles.okButton}>
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ProgressDialog visible={loading} message="Please Wait..." />
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
  },
  warningText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 10,
    fontFamily: 'Lato-Regular',
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
  card: {
    height: 150,
    width: Dimensions.get('window').width,
    padding: 5,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
  },

  gridView: {
    marginTop: 10,
    flex: 1,
    color: '',
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },

  button: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    backgroundColor: '#fbe4e4',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorIcon: {
    fontSize: 30,
    color: '#ff5252',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  okButton: {
    backgroundColor: '#00796b',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default DashBoardNew;
