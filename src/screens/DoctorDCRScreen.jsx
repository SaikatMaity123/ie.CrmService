import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Image,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
} from 'react-native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {TextInput} from 'react-native-paper';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import {format} from 'date-fns';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import {FlatList} from 'react-native';
import {id, te} from 'date-fns/locale';
//import all the components we are going to use.
import Geolocation from '@react-native-community/geolocation';
//import Geolocation from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import {openDatabase} from 'react-native-sqlite-storage';
import moment from 'moment';
import CustomDCR from '../components/custom/CustomDCR';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ProgressDialog from '../components/custom/ProgressDialog';
import Snackbar from 'react-native-snackbar';
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

const DoctorDCRScreen = ({navigation}) => {
  const [showData, setshowData] = useState(true);
  const [shouldShowSampleData, setshouldShowSampleData] = useState(false);
  const [shouldShowDocVisitWithData, setshouldShowDocVisitWithData] =
    useState(false);
  const [shouldProdStage, setshouldProdStage] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useMultipleIDEmployee, setMultipleIDEmployee] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [usedoctorData, setdoctorData] = useState([]);
  const [fStageData, setfStageData] = useState([]);
  const [docLabel, setdocLabel] = useState('');
  const [docValue, setdocValue] = useState('');
  const [docCode, setDocCode] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  //const [usevisitWTDataTest, setvisitWTDataTest] = useState([]);
  const [useMAreaLabel, setMAreaLabel] = useState('');
  const [gamesTab, setGamesTab] = useState(1);
  const [fStageLabel, setfStageLabel] = useState([]);
  const [sampleData, setsampleData] = useState([]);
  const [sampleQtyData, setsampleQtyData] = useState([]);
  const [giftQtyData, setgiftQtyDataData] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [giftData, setgiftData] = useState([]);
  const [campData, setcampData] = useState([]);
  const [prodData, setprodData] = useState([]);
  const [dataProduct, setdataProduct] = useState([]);
  const [currTime, setcurrTime] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useQty, setQty] = useState('');
  const [useGQty, setGQty] = useState('');
  const [useCRemarks, setCRemarks] = useState('');
  const [sLabel, setSLabel] = useState('');
  const [sValue, setSValue] = useState('');
  const [gLabel, setGLabel] = useState('');
  const [gValue, setGValue] = useState('');
  const [cLabel, setCLabel] = useState('');
  const [cValue, setCValue] = useState('');
  const [pLabel, setPLabel] = useState('');
  const [pValue, setPValue] = useState('');
  const [useGeofencing, setGeofencing] = useState('');
  const [useDoctorGeofencing, setDoctorGeofencing] = useState('');
  const [useArea, setArea] = useState([]);
  const [useMArea, setMArea] = useState([]);
  const [useAreaLabel, setAreaLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [deviceType, setDevice] = useState('');
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);

  var cdate = moment().format('D/MMM/YYYY');

  useEffect(() => {
    //Disabling VirtualizedLists warning error start
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    //Disabling VirtualizedLists warning error end

    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();
    //deg2rad();
    //fetchOfflineTableData();
    getData();
    setshouldShowDocVisitWithData(true);
    setshouldShowSampleData(true);

    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

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
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          //startDocDCR(user.BusinessID, user.IDEmployee);
          //fetchOfflineTableData(user.ManagerAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
                // const empurl =
                //   BASE_URL +
                //   'Employee/DivisionWiseEmployeeList?Businessid=' +
                //   user.BusinessID +
                //   '&IDDivision=' +
                //   user.IDDivision +
                //   '&IDEmployeeDesignation=0';
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
                        //value: response.data[i].Value,
                        value: response.data[i].EmployeeName,
                        key: response.data[i].IDEmployee,
                      });
                    }
                    setMvisitWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
                const areaurl =
                  BASE_URL +
                  'Area/EmployeeWiseAreaList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                //console.log('returl ' + areaurl);
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
                        value: response.data[i].IDArea,
                        label: response.data[i].Name,
                      });
                    }
                    //console.log(wtNameArray);

                    setArea(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });

                // const returl =
                //   BASE_URL +
                //   'Doctor/OfflineDoctorList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                // console.log('returl ' + returl);
                // var config = {
                //   method: 'get',
                //   url: returl,
                // };
                // axios(config)
                //   .then(function (response) {
                //     var count = Object.keys(response.data.data).length;
                //     let wtNameArray = [];
                //     for (var i = 0; i < count; i++) {
                //       wtNameArray.push({
                //         //value: response.data[i].Value,
                //         value: response.data.data[i].IDDoctor,
                //         label:
                //           response.data.data[i].Name +
                //           ' ' +
                //           response.data.data[i].Code,
                //       });
                //     }
                //     setdoctorData(wtNameArray);
                //   })
                //   .catch(function (error) {
                //     console.log(error);
                //   });

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
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });

                const docurl =
                  BASE_URL +
                  'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&IDArea=0';

                let result = await fetch(docurl);
                result = await result.json();
                console.log(result);
                console.log(docurl);
                setdoctorData(result);
              }

              const finalurl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=TARGET';
              //console.log(finalurl);
              var config = {
                method: 'get',
                url: finalurl,
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
                  setfStageData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const campurl =
                BASE_URL +
                'Campaign/EmployeeWiseCampaignList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: campurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDCampaign,
                      label: response.data[i].Campaign,
                    });
                  }
                  setcampData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const produrl =
                BASE_URL +
                'Campaign/EmployeeWiseCampaignList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: produrl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Product,
                    });
                  }
                  setprodData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const prdurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=GIFT';
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: prdurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  setgiftData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const sampleurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=DOCTORPRODUCT';
              //console.log(sampleurl);
              var config = {
                method: 'get',
                url: sampleurl,
              };

              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  setsampleData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const url =
                BASE_URL +
                'Configuration/MobileGeofencing?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;

              try {
                const response = await axios.get(url);
                console.log('API Response:', response.data[0].Geofencing);
                setGeofencing(response.data[0].Geofencing);
                setDoctorGeofencing(response.data[0].DoctorGeoFencing);
              } catch (error) {
                console.error('Error fetching geofencing data:', error);
              }
            } else {
              fetchOfflineTableData(user.ManagerAccess);
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  const fetchOfflineTableData = ManagerAccess => {
    if (ManagerAccess === true) {
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
                  //value: results.rows.item(i).Name,
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

      //Retrieve data from CRM_finalStageList
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_finalStageList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).IDMisc,
                  label: results.rows.item(i).Name,
                });
              setfStageData(temp);
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

      //Retrieve data from CRM_productList
      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_productList',
      //     [],
      //     (tx, results) => {
      //       if (results.rows.length > 0) {
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i)
      //           //temp.push(results.rows.item(i));
      //           //setdataSample(temp);
      //           setdataSample(results.rows.item(i));
      //         console.log('Data is inserted:', results.rows.item(i));
      //       } else {
      //         console.log('No data found');
      //         //setSelectedMAreaData('No data found');
      //       }
      //     },
      //     (tx, error) => {
      //       console.error('CRM_productListMError checking data', error);
      //     },
      //   );
      // });
    } else {
      //Retrieve data from CRM_EmployeeWiseAreaList
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_EmployeeWiseAreaList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).IDArea,
                  label: results.rows.item(i).Name,
                  // value: results.rows.item(i).Name,
                  // key: results.rows.item(i).IDEmployee,
                });
              setArea(temp);
              //console.log('User Data is inserted:', temp);
            } else {
              console.log('No data found');
            }
          },
          (tx, error) => {
            console.error('Error checking data', error);
          },
        );
      });
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
              //console.log('User Data is inserted:', temp);
            } else {
              console.log('No data found');
            }
          },
          (tx, error) => {
            console.error('Error checking data', error);
          },
        );
      });
      //Retrieve data from CRM_DocList
      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_DocList',
      //     [],
      //     (tx, results) => {
      //       if (results.rows.length > 0) {
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i) {
      //           temp.push({
      //             value: results.rows.item(i).IDDoctor,
      //             label:
      //               results.rows.item(i).Name +
      //               '  ' +
      //               results.rows.item(i).Code,
      //           });
      //         }
      //         setdoctorData(temp);
      //         //console.log('Data is inserted:', temp);
      //       } else {
      //         console.log('No data found');
      //         //setWTData('No data found');
      //       }
      //     },
      //     (tx, error) => {
      //       console.error('Error checking data', error);
      //     },
      //   );
      // });

      //Retrieve data from CRM_finalStageList
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_finalStageList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).IDMisc,
                  label: results.rows.item(i).Name,
                });
              setfStageData(temp);
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
    }
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_GIFT',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            setgiftData(temp);
            //console.log('Data is inserted:', temp);
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
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_SAMPLE',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            setsampleData(temp);
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Campaign',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDCampaign,
                label: results.rows.item(i).Campaign,
              });
            }
            setcampData(temp);
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_CampaignProduct',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              //temp.push(results.rows.item(i));
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Product,
              });
            }
            setprodData(temp);
            //console.log('Data is inserted CRM_SAMPLE:', temp);
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
    db.transaction(tx => {
      //tx.executeSql('SELECT Geofencing FROM Geofencing', [], (tx, results) => {
      tx.executeSql('SELECT * FROM Geofencing', [], (tx, results) => {
        if (results.rows.length > 0) {
          const geo = results.rows.item(0).Geofencing;
          const doc_geo = results.rows.item(0).DoctorGeoFencing;
          console.log('geo ', geo);
          console.log('doc_geo ', doc_geo);

          setGeofencing(geo);
          setDoctorGeofencing(doc_geo);
        }
      });
    });
  };

  const nextPS = () => {
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
    } else {
      if (useManagerAccess === true) {
        if (useMvisitWTData.length === 0) {
          Alert.alert('Select Visit With');
        } else if (docLabel === '') {
          Alert.alert('Select Doctor');
        }
        //  else if (useRemarks === '') {
        //   Alert.alert('Type Remarks');
        // }
        else if (sampleQtyData.length === 0) {
          Alert.alert('Type Sample');
        } else {
          setshouldShowSampleData(false);
          setshouldProdStage(true);
          setshowData(false);
        }
      } else {
        if (docLabel === '') {
          Alert.alert('Select Doctor');
        } else if (usevisitWTData.length === 0) {
          Alert.alert('Select Visit With');
        }
        // else if (useRemarks === '') {
        //   Alert.alert('Type Remarks');
        // }
        // else if (data.length === 0) {
        //   Alert.alert('Type Sample');
        // }
        else if (sampleQtyData.length === 0) {
          Alert.alert('Select Sample & Qty');
        } else {
          setshouldShowSampleData(false);
          setshouldProdStage(true);
          setshowData(false);
        }
      }
    }
  };
  //Hide Gift End

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
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      // {enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      {timeout: 15000}, // 15 seconds timeout
    );
  };

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
        navigation.navigate('AppNavScreen');
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
        //console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    }
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

  const doctorWiseProductListAPI = docID => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          BASE_URL +
          'Doctor/ManagerDCRDoctorProductMappingOfflineList?Businessid=' +
          useBusinessID +
          '&IDDoctor=' +
          docID;

        let result = await fetch(returl);
        result = await result.json();
        // console.log(result.d);
        console.log(returl);
        //setdoctorData(result);
        setdataProduct(result.d);
      } else {
        if (useManagerAccess === true) {
          //Retrieve data from ManagerEmployeeWiseDoctorList
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_ManagerDoctorProductMappingOfflineList where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        } else {
          console.log('docID', docID);

          //Retrieve data from CRM_DoctorProductMappingListt
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_DoctorProductMappingListt where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        }
      }
    }, []);
  };
  const doctorWiseAreaListAPI = docID => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        if (useManagerAccess === true) {
          const areaurl =
            BASE_URL +
            'Area/EmployeeAndDoctorWiseAreaList?Businessid=' +
            useBusinessID +
            '&IDEmployee=' +
            useMultipleIDEmployee +
            '&IDDoctor=' +
            docID;
          console.log('returl ' + areaurl);
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
                  value: response.data[i].IDArea,
                  label: response.data[i].Area,
                });
              }
              //console.log(wtNameArray);

              setMArea(wtNameArray);
            })
            .catch(function (error) {
              Alert.alert(error);
              if (error.response) {
                // Server responded with a status other than 2xx
                console.log('Error Status:', error.response.status);
                console.log('Error Data:', error.response.data);

                if (error.response.status === 400) {
                  // Handle validation errors
                  const errors = error.response.data.errors;
                  if (errors) {
                    Object.keys(errors).forEach(key => {
                      console.log(`${key}: ${errors[key].join(', ')}`);
                    });
                  }
                }
              } else if (error.request) {
                // No response received from server
                console.log('No response received:', error.request);
              } else {
                // Other errors
                console.log('Error:', error.message);
              }
            });
        } else {
          const areaurl =
            BASE_URL +
            'Area/EmployeeAndDoctorWiseAreaList?Businessid=' +
            useBusinessID +
            '&IDEmployee=' +
            useIDEmployee +
            '&IDDoctor=' +
            docID;
          console.log('returl ' + areaurl);
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
                  value: response.data[i].IDArea,
                  label: response.data[i].Area,
                });
              }
              //console.log(wtNameArray);

              setArea(wtNameArray);
            })
            .catch(function (error) {
              Alert.alert(error);
              console.log(error.response);
            });
        }
      } else {
        if (useManagerAccess === true) {
          //Retrieve data from ManagerEmployeeWiseDoctorList
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_ManagerDoctorProductMappingOfflineList where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        } else {
          console.log('docID', docID);

          //Retrieve data from CRM_DoctorProductMappingListt
          db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM CRM_DoctorProductMappingListt where IDDoctor=?',
              [docID],
              (tx, results) => {
                if (results.rows.length > 0) {
                  var temp = [];
                  for (let i = 0; i < results.rows.length; ++i)
                    temp.push(results.rows.item(i));
                  setdataProduct(temp);
                  console.log(temp);
                } else {
                  //Alert.alert('No Products Found');
                  //setSelectedMAreaData('No data found');
                  Snackbar.show({
                    text: 'No Products Found',
                    duration: Snackbar.LENGTH_LONG,
                    action: {
                      text: 'UNDO',
                      textColor: 'red',
                      onPress: () => {
                        console.log('Undo pressed');
                      },
                    },
                  });
                }
              },
              (tx, error) => {
                console.error('Error checking data', error);
              },
            );
          });
        }
      }
      // else {
      //   //Alert.alert('No Internet');
      // }
    }, []);
  };

  const multiSelectVisitWith = async () => {
    let mvwt = useMvisitWTData;
    let mvwtList = mvwt.toString();
    // console.log(mvwt);
    console.log(mvwtList);
    //doctorDDOpenM(useBusinessID, mvwtList);
    //doctorDDOpenM(mvwt);

    const docurl =
      BASE_URL +
      'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
      useBusinessID +
      '&Employees=' +
      mvwtList +
      '&IDArea=0';

    let result = await fetch(docurl);
    result = await result.json();
    console.log('useMultipleIDEmployee', useMultipleIDEmployee);
    console.log(docurl);
    setdoctorData(result);
    setMultipleIDEmployee(mvwtList);
    managerAreaList(mvwtList);
  };

  const managerAreaList = empLoyee => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          empLoyee;
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
                value: response.data[i].IDArea,
                label: response.data[i].Name,
              });
            }
            setMArea(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        //console.log(empLoyee);
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_offlineAreaList where IDEmployee=?',
            [empLoyee],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDArea,
                    label: results.rows.item(i).AreaName,
                  });
                }
                setMArea(temp);
                console.log('Data is inserted:', temp);
              } else {
                // var temp = [];
                // setMArea(temp);
                console.log('No data found');
                //setWTData('No data found');
              }
            },
            (tx, error) => {
              console.error('Error checking data', error);
            },
          );
        });
      }
    }, []);
  };

  //const doctorDDOpenM = (businessID, idemp) => {
  // const doctorDDOpenM = IDEmployee => {
  //   // Example array of values for the IN clause
  //   const values = IDEmployee;
  //   // Construct the SQL query dynamically with the values
  //   const sqlQuery = `SELECT * FROM ManagerEmployeeWiseDoctorList WHERE IDEmployee IN (${values
  //     .map(() => '?')
  //     .join(',')})`;

  //   console.log(sqlQuery);
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
  //               value: results.rows.item(i).IDDoctor,
  //               label:
  //                 results.rows.item(i).Name + '  ' + results.rows.item(i).Code,
  //             });
  //           }
  //           setdoctorData(temp);
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

  const save = () => {
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
    } else {
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            try {
              AsyncStorage.getItem('IDday').then(value => {
                if (value != null) {
                  let IDday = JSON.parse(value);
                  // startDocDCR(
                  //   useBusinessID,
                  //   useIDEmployee,
                  //   IDday,
                  //   currentLatitude,
                  //   currentLongitude,
                  // );
                  EndDocDcr(IDday);
                }
              });
            } catch (error) {
              Alert.alert(error);
            }
          } else {
            Alert.alert('You are Offline Contact With Administrator!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            try {
              AsyncStorage.getItem('IDday').then(value => {
                if (value != null) {
                  let IDday = JSON.parse(value);
                  EndDocDcr(IDday);
                }
              });
            } catch (error) {
              Alert.alert(error);
            }
          } else {
            var date = moment()
              .utcOffset('+05:30')
              .format('YYYY-MM-DD hh:mm:ss A');
            console.warn(date);

            if (useManagerAccess === true) {
              let Mvisitwith = [];
              let GProdID = [];
              let GfStatus = [];
              let ProdID = [];
              let curstageID = [];
              let fStatus = [];
              let SProdID = [];
              let SfStatus = [];
              let idCampaign = [];
              let idProduct = [];
              let idRemarks = [];

              usevisitWTData.map(function (value) {
                //Mvisitwith.push({IDEmployee: value});
                Mvisitwith.push(value);
              });

              if (campaignData.length === 0) {
                idCampaign = [];
                idProduct = [];
                idRemarks = [];
              } else {
                campaignData.map(function (value) {
                  idCampaign.push(value.idCampaign);
                  idProduct.push(value.idProduct);
                  idRemarks.push(value.key);
                });
              }
              //console.log(Mvisitwith);
              if (sampleQtyData.length === 0) {
                SProdID = [];
                SfStatus = [];
              } else {
                sampleQtyData.map(function (value) {
                  // SfStatus.push(value.IDProduct);
                  // SProdID.push(value.Qty);
                  SfStatus.push(value.value);
                  SProdID.push(value.key);
                });
              }

              if (giftQtyData.length === 0) {
                GProdID = [];
                GfStatus = [];
              } else {
                giftQtyData.map(function (value) {
                  // GfStatus.push(value.IDProduct);
                  // GProdID.push(value.Qty);
                  GfStatus.push(value.value);
                  GProdID.push(value.key);
                });
              }

              dataProduct.map(function (value) {
                //ProdID.push({IDProduct: value.IDProduct});
                ProdID.push(value.IDProduct);
              });

              dataProduct.map(function (value) {
                //curstageID.push({IDStage: value.IDStage});
                curstageID.push(value.IDStage);
              });

              fStageLabel.map(function (valueMisc) {
                //fStatus.push({IDMisc: valueMisc});
                fStatus.push(valueMisc);
              });
              const data_api = {
                dcrDate: cdate,
                businessID: useBusinessID,
                dcrType: 'DOCTOR',
                //deviceType: DeviceInfo.getModel(),
                deviceType: 'OFFLINE_' + deviceType,
                //dcrDateTime: currTime,
                dcrDateTime: date,
                userLat: currentLatitude,
                userLong: currentLongitude,
                //idCustomer: docCode,
                idCustomer: docValue,
                idDoctor: docLabel,
                idEmployee: useIDEmployee,
                idWorktype: 57,
                giftsProducts: GfStatus,
                giftsQty: GProdID,
                UNListed: false,
                productsCurrentStatus: curstageID,
                productsFinalStatus: fStatus,
                products: ProdID,
                samplesProduct: SfStatus,
                samplesProductQty: SProdID,
                visitWiths: Mvisitwith,
                entryUser: empEmail,
                Remarks: useRemarks,
                IDCampaign: idCampaign,
                IDProduct: idProduct,
                Remarkss: idRemarks,
              };

              console.log(data_api);
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
                  [],
                  (_, result) => {
                    console.log('Table created successfully:', result);
                  },
                  (_, error) => {
                    Alert.alert('Error creating table:', error);
                  },
                );
              });
              db.transaction(tx => {
                tx.executeSql(
                  'INSERT INTO CRM_ManagerDoctorDataSave (data) VALUES (?);',
                  [JSON.stringify(data_api)],
                  (_, result) => {
                    console.log('Data inserted successfully:', result);
                    navigation.navigate('AppNavDCRScreen');
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                  (_, error) => {
                    console.log('Error inserting data:', error);
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                );
              });

              db.transaction(txn => {
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_ManagerOfflineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_ManagerOfflineViewDocDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useMAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
              //}
            } else {
              let Mvisitwith = [];
              let GProdID = [];
              let GfStatus = [];
              let ProdID = [];
              let curstageID = [];
              let fStatus = [];
              let SProdID = [];
              let SfStatus = [];
              let idCampaign = [];
              let idProduct = [];
              let idRemarks = [];

              usevisitWTData.map(function (value) {
                //Mvisitwith.push({IDEmployee: value});
                Mvisitwith.push(value);
              });

              //console.log(Mvisitwith);
              if (sampleQtyData.length === 0) {
                SProdID = [];
                SfStatus = [];
              } else {
                sampleQtyData.map(function (value) {
                  // SfStatus.push(value.IDProduct);
                  // SProdID.push(value.Qty);
                  SfStatus.push(value.value);
                  SProdID.push(value.key);
                });
              }

              if (giftQtyData.length === 0) {
                GProdID = [];
                GfStatus = [];
              } else {
                giftQtyData.map(function (value) {
                  // GfStatus.push(value.IDProduct);
                  // GProdID.push(value.Qty);
                  GfStatus.push(value.value);
                  GProdID.push(value.key);
                });
              }

              if (campaignData.length === 0) {
                idCampaign = [];
                idProduct = [];
                idRemarks = [];
              } else {
                campaignData.map(function (value) {
                  idCampaign.push(value.idCampaign);
                  idProduct.push(value.idProduct);
                  idRemarks.push(value.key);
                });
              }
              dataProduct.map(function (value) {
                //ProdID.push({IDProduct: value.IDProduct});
                ProdID.push(value.IDProduct);
              });

              dataProduct.map(function (value) {
                //curstageID.push({IDStage: value.IDStage});
                curstageID.push(value.IDStage);
              });

              fStageLabel.map(function (valueMisc) {
                //fStatus.push({IDMisc: valueMisc});
                fStatus.push(valueMisc);
              });
              // if (fStatus.length === 0) {
              //   Alert.alert('Select Final Stage');
              // }
              // else {
              const data_api = {
                dcrDate: cdate,
                businessID: useBusinessID,
                dcrType: 'DOCTOR',
                //deviceType: DeviceInfo.getModel(),
                deviceType: 'OFFLINE_' + deviceType,
                //dcrDateTime: currTime,
                dcrDateTime: date,
                userLat: currentLatitude,
                userLong: currentLongitude,
                //idCustomer: docCode,
                idCustomer: docValue,
                idDoctor: docLabel,

                idEmployee: useIDEmployee,
                idWorktype: 57,
                giftsProducts: GfStatus,
                giftsQty: GProdID,
                UNListed: false,
                productsCurrentStatus: curstageID,
                productsFinalStatus: fStatus,
                products: ProdID,
                samplesProduct: SfStatus,
                samplesProductQty: SProdID,
                visitWiths: Mvisitwith,
                entryUser: empEmail,
                Remarks: useRemarks,
                IDCampaign: idCampaign,
                IDProduct: idProduct,
                Remarkss: idRemarks,
              };

              console.log(data_api);
              db.transaction(tx => {
                tx.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_DoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
                  [],
                  (_, result) => {
                    console.log('Table created successfully:', result);
                  },
                  (_, error) => {
                    Alert.alert('Error creating table:', error);
                  },
                );
              });
              db.transaction(tx => {
                tx.executeSql(
                  'INSERT INTO CRM_DoctorDataSave (data) VALUES (?);',
                  [JSON.stringify(data_api)],
                  (_, result) => {
                    console.log('Data inserted successfully:', result);
                    console.warn('Data inserted successfully:', result);
                    navigation.navigate('AppNavDCRScreen');
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                  (_, error) => {
                    console.log('Error inserting data:', error);
                    console.warn('Error inserting data:', error);
                    db.transaction(txn => {
                      txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
                      txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
                    });
                  },
                );
              });
              //}

              db.transaction(txn => {
                txn.executeSql(
                  'CREATE TABLE IF NOT EXISTS CRM_OfflineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,Area VARCHAR,CustomerType VARCHAR)',
                  [],
                );
              });

              let sql =
                'INSERT INTO CRM_OfflineViewDocDCR(Customer,Code,DCRDate,Area,CustomerType) VALUES (?,?,?,?,?)';
              let params = [docLabel, docValue, cdate, useAreaLabel, '']; //storing user data in an array
              db.executeSql(sql, params);
            }
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
        //Alert.alert(useMobileAccess);
      }
    }
  };

  const EndDocDcr = async IDday => {
    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    console.warn(date);
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
    } else {
      if (useManagerAccess === true) {
        let samples = [];
        let gifts = [];
        let status = [];
        let Mvisitwith = [];
        let ProdID = [];
        let curstageID = [];
        let fStatus = [];
        let campaign = [];

        useMvisitWTData.map(function (value) {
          Mvisitwith.push({IDEmployee: value});
        });

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          sampleQtyData.map(function (value) {
            samples.push({
              // IDProduct: value.IDProduct,
              // Qty: value.Qty,
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              // IDProduct: value.IDProduct,
              // Qty: value.Qty,
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }

        if (campaignData.length === 0) {
          campaign = [];
        } else {
          campaignData.map(function (value) {
            campaign.push({
              IDCampaign: value.idCampaign,
              IDProduct: value.idProduct,
              Remarks: value.key,
            });
          });
        }

        dataProduct.map(function (value) {
          ProdID.push({IDProduct: value.IDProduct});
          //ProdID.push(value.IDProduct);
        });

        dataProduct.map(function (value) {
          curstageID.push({IDStage: value.IDStage});
          //curstageID.push(value.IDStage);
        });

        fStageLabel.map(function (valueMisc) {
          fStatus.push({IDMisc: valueMisc});
          //fStatus.push(valueMisc);
        });

        var countProdID = Object.keys(ProdID).length;
        var countProdID = Object.keys(curstageID).length;
        var countProdID = Object.keys(fStatus).length;

        for (var i = 0; i < countProdID; i++) {
          status.push({
            IDProduct: ProdID[i].IDProduct,
            IDCurrentStatus: curstageID[i].IDStage,
            IDFinalStatus: fStatus[i].IDMisc,
            OrderQty: 0,
            FreeQty: 0,
          });
        }

        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'DOCTOR',
          EntryType: 'ONLINE_' + deviceType,
          Sync: false,
          UserLat: currentLatitude,
          UserLong: currentLongitude,
          Remarks: useRemarks,
          User: empEmail,
          IDEmployee: useIDEmployee,
          IDWorktype: 57,
          IDDoctor: docValue,
          Businessid: useBusinessID,
          UNListed: false,
          Samples: samples,
          Gifts: gifts,
          ProductStatuss: status,
          Visitwiths: Mvisitwith,
          Campaign: campaign,
        };
        console.log(data_api);

        //let result = await fetch(BASE_URL + 'Manager/DCR/Mobile/Save', {
        let result = await fetch(BASE_URL + 'manager/DCR/Mobile/SaveNew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        });

        result = await result.json();
        // console.log(result);
        // console.log('Manager', data_api);
        if (result.result === '') {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavDCRScreen'),
              },
            ],
            {cancelable: false},
          );
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          Alert.alert(result.result);
        }
        //}
      } else {
        let samples = [];
        let gifts = [];
        let campaign = [];
        let status = [];
        let Mvisitwith = [];
        let ProdID = [];
        let curstageID = [];
        let fStatus = [];

        usevisitWTData.map(function (value) {
          Mvisitwith.push({IDEmployee: value});
        });

        if (sampleQtyData.length === 0) {
          samples = [];
        } else {
          sampleQtyData.map(function (value) {
            samples.push({
              // IDProduct: value.IDProduct,
              // Qty: value.Qty,
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (giftQtyData.length === 0) {
          gifts = [];
        } else {
          giftQtyData.map(function (value) {
            gifts.push({
              // IDProduct: value.IDProduct,
              // Qty: value.Qty,
              IDProduct: value.value,
              Qty: value.key,
            });
          });
        }
        if (campaignData.length === 0) {
          campaign = [];
        } else {
          campaignData.map(function (value) {
            campaign.push({
              IDCampaign: value.idCampaign,
              IDProduct: value.idProduct,
              Remarks: value.key,
            });
          });
        }

        dataProduct.map(function (value) {
          ProdID.push({IDProduct: value.IDProduct});
          // ProdID.push(value.IDProduct);
        });

        dataProduct.map(function (value) {
          curstageID.push({IDStage: value.IDStage});
          //curstageID.push(value.IDStage);
        });

        fStageLabel.map(function (valueMisc) {
          fStatus.push({IDMisc: valueMisc});
          //fStatus.push(valueMisc);
        });

        var countProdID = Object.keys(ProdID).length;
        var countProdID = Object.keys(curstageID).length;
        var countProdID = Object.keys(fStatus).length;

        for (var i = 0; i < countProdID; i++) {
          status.push({
            IDProduct: ProdID[i].IDProduct,
            IDCurrentStatus: curstageID[i].IDStage,
            IDFinalStatus: fStatus[i].IDMisc,
            OrderQty: 0,
            FreeQty: 0,
          });
        }
        // if (fStatus.length === 0) {
        //   Alert.alert('Select Final Stage');
        // }
        // else {
        const data_api = {
          IDDCR: 0,
          IDDay: IDday,
          DCRDate: cdate,
          DCRType: 'DOCTOR',
          EntryType: 'ONLINE_' + deviceType,
          UserLat: currentLatitude,
          UserLong: currentLongitude,
          Remarks: useRemarks,
          User: empEmail,
          IDEmployee: useIDEmployee,
          IDWorktype: 57,
          IDDoctor: docValue,
          Businessid: useBusinessID,
          UNListed: false,
          Samples: samples,
          Gifts: gifts,
          ProductStatuss: status,
          Visitwiths: Mvisitwith,
          Campaign: campaign,
        };
        console.log('User', data_api);
        //let result = await fetch(BASE_URL + 'DCR/Mobile/Save', {
        let result = await fetch(BASE_URL + 'DCR/Mobile/SaveNew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        });

        result = await result.json();
        console.log(result);
        if (result.result === '') {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          Alert.alert(
            'Success',
            'Record Successfully Saved',
            [
              {
                text: 'Ok',
                //onPress: () => navigation.navigate('Report DashBoard'),
                onPress: () => navigation.navigate('AppNavDCRScreen'),
              },
            ],
            {cancelable: false},
          );
        } else {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
            txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
          });
          Alert.alert('Else : ' + result.result);
        }
      }
    }
  };
  const onSelectSwitch = value => {
    setGamesTab(value);
  };

  const addSample = () => {
    if (sLabel.length === 0) {
      Alert.alert('Select Sample');
    } else if (useQty === '') {
      Alert.alert('Type Quantity');
    } else {
      // setQty('');
      // db.transaction(txn => {
      //   //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
      //   txn.executeSql(
      //     'CREATE TABLE IF NOT EXISTS CRM_SAMPLEQTY(id INTEGER PRIMARY KEY AUTOINCREMENT,IDProduct VARCHAR,Name VARCHAR,Qty VARCHAR)',
      //     [],
      //   );
      // });

      // let sql = 'INSERT INTO CRM_SAMPLEQTY(IDProduct,Name,Qty) VALUES (?,?,?)';
      // let params = [sValue, sLabel, useQty]; //storing user data in an array
      // db.executeSql(sql, params);

      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_SAMPLEQTY',
      //     [],
      //     (_, results) => {
      //       if (results.rows.length > 0) {
      //         //console.warn('Table has data');
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i) {
      //           temp.push(results.rows.item(i));
      //         }
      //         setsampleQtyData(temp);
      //         //console.log(temp);
      //       }
      //     },
      //     (_, error) => {
      //       console.log('Error fetching data:', error);
      //     },
      //   );
      // });

      setsampleQtyData([
        ...sampleQtyData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        {key: useQty, label: sLabel, value: sValue},
      ]);

      // Clear the inputs
      setQty('');
    }
  };

  const addGift = () => {
    if (gLabel.length === 0) {
      Alert.alert('Select Gift');
    } else if (useGQty === '') {
      Alert.alert('Type Quantity');
    } else {
      // setGQty('');
      // db.transaction(txn => {
      //   //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
      //   txn.executeSql(
      //     'CREATE TABLE IF NOT EXISTS CRM_GIFTQTY(id INTEGER PRIMARY KEY AUTOINCREMENT,IDProduct VARCHAR,Name VARCHAR,Qty VARCHAR)',
      //     [],
      //   );
      // });

      // let sql = 'INSERT INTO CRM_GIFTQTY(IDProduct,Name,Qty) VALUES (?,?,?)';
      // let params = [gValue, gLabel, useGQty]; //storing user data in an array
      // db.executeSql(sql, params);

      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_GIFTQTY',
      //     [],
      //     (_, results) => {
      //       if (results.rows.length > 0) {
      //         //console.warn('Table has data');
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i) {
      //           temp.push(results.rows.item(i));
      //         }
      //         setgiftQtyDataData(temp);
      //         //console.log(temp);
      //       }
      //     },
      //     (_, error) => {
      //       console.log('Error fetching data:', error);
      //     },
      //   );
      // });

      setgiftQtyDataData([
        ...giftQtyData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        {key: useGQty, label: gLabel, value: gValue},
      ]);

      // Clear the inputs
      setGQty('');
    }
  };
  const addCampaign = () => {
    if (cLabel.length === 0) {
      Alert.alert('Select Campaign');
    } else if (pLabel.length === 0) {
      Alert.alert('Select Product');
    } else if (useCRemarks === '') {
      Alert.alert('Type Remarks');
    } else {
      setCampaignData([
        ...campaignData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        {
          key: useCRemarks,
          idCampaign: cValue,
          campaignName: cLabel,
          idProduct: pValue,
          productName: pLabel,
        },
      ]);

      // Clear the inputs
      setCRemarks('');
    }
  };

  const onDeleteSample = id => {
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'DELETE FROM CRM_SAMPLEQTY WHERE id = ?',
    //     [id],
    //     (tx, results) => {
    //       // Check if deletion was successful
    //       if (results.rowsAffected > 0) {
    //         // Update the state to re-render the FlatList without the deleted item
    //         setsampleQtyData(prevData =>
    //           prevData.filter(item => item.id !== id),
    //         );
    //       }
    //     },
    //   );
    // });
    //console.log(id);
    const newData = [...sampleQtyData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setsampleQtyData(newData); // Update state
  };
  const onDeleteGift = id => {
    console.log(id);

    // db.transaction(tx => {
    //   tx.executeSql(
    //     'DELETE FROM CRM_GIFTQTY WHERE id = ?',
    //     [id],
    //     (tx, results) => {
    //       // Check if deletion was successful
    //       if (results.rowsAffected > 0) {
    //         // Update the state to re-render the FlatList without the deleted item
    //         setgiftQtyDataData(prevData =>
    //           prevData.filter(item => item.id !== id),
    //         );
    //       }
    //     },
    //   );
    // });

    const newData = [...giftQtyData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setgiftQtyDataData(newData);
  };

  const onDeleteCampaign = id => {
    console.log(id);
    const newData = [...campaignData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setCampaignData(newData);
  };

  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        // // const returl =
        // //   BASE_URL +
        // //   'Doctor/AreaWiseDoctorList?Businessid=' +
        // //   useBusinessID +
        // //   '&IDArea=' +
        // //   IDArea;

        // const returl =
        //   BASE_URL +
        //   'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
        //   useBusinessID +
        //   '&IDEmployee=' +
        //   useIDEmployee +
        //   '&IDArea=' +
        //   IDArea;

        // //console.log('returl ' + returl);
        // var config = {
        //   method: 'get',
        //   url: returl,
        // };
        // axios(config)
        //   .then(function (response) {
        //     var count = Object.keys(response.data).length;
        //     let wtNameArray = [];
        //     for (var i = 0; i < count; i++) {
        //       wtNameArray.push({
        //         //value: response.data[i].Value,
        //         value: response.data[i].IDDoctor,
        //         label: response.data[i].Name + ' ' + response.data[i].Code,
        //       });
        //     }
        //     setdoctorData(wtNameArray);
        //   })
        //   .catch(function (error) {
        //     Alert.alert(error);
        //   });
        const returl =
          BASE_URL +
          'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useIDEmployee +
          '&IDArea=' +
          IDArea;

        let result = await fetch(returl);
        result = await result.json();
        console.log(result);
        console.log(returl);
        setdoctorData(result);
      } else {
        //Retrieve data from CRM_DocList
        // db.transaction(tx => {
        //   tx.executeSql(
        //     'SELECT * FROM CRM_DocList where IDArea=?',
        //     [IDArea],
        //     (tx, results) => {
        //       if (results.rows.length > 0) {
        //         var temp = [];
        //         for (let i = 0; i < results.rows.length; ++i) {
        //           temp.push({
        //             //value: results.rows.item(i).IDDoctor,
        //             IDDoctor: results.rows.item(i).IDDoctor,
        //             Name:
        //               results.rows.item(i).Name +
        //               '  ' +
        //               results.rows.item(i).Code,
        //           });
        //         }
        //         setdoctorData(temp);
        //         //console.log('Data is inserted:', temp);
        //       } else {
        //         console.log('No data found');
        //         //setWTData('No data found');
        //       }
        //     },
        //     (tx, error) => {
        //       console.error('Error checking data', error);
        //     },
        //   );
        // });

        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_DocList WHERE IDArea = ?',
            [IDArea],
            (tx, results) => {
              const rows = results.rows;
              let data = [];
              for (let i = 0; i < rows.length; i++) {
                data.push(rows.item(i));
              }
              console.log(data);
              setdoctorData(data);
            },
            error => {
              console.log('Query error:', error);
            },
          );
        });
      }
    }, []);
  };
  const areaWiseMDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          //   // BASE_URL +
          //   // 'Doctor/AreaWiseDoctorList?Businessid=' +
          //   // useBusinessID +
          //   // '&IDArea=' +
          //   // IDArea;
          //   BASE_URL +
          //   'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
          //   useBusinessID +
          //   '&Employees=' +
          //   useMultipleIDEmployee +
          //   '&IDArea=' +
          //   IDArea;
          // console.log('returl ' + returl);
          // var config = {
          //   method: 'get',
          //   url: returl,
          // };
          // axios(config)
          //   .then(function (response) {
          //     var count = Object.keys(response.data).length;
          //     let wtNameArray = [];
          //     for (var i = 0; i < count; i++) {
          //       wtNameArray.push({
          //         //value: response.data[i].Value,
          //         value: response.data[i].IDDoctor,
          //         label: response.data[i].Name,
          //       });
          //     }
          //     setdoctorData(wtNameArray);
          //   })
          //   .catch(function (error) {
          //     Alert.alert(error);
          //   });

          BASE_URL +
          'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          useMultipleIDEmployee +
          '&IDArea=' +
          IDArea;

        let result = await fetch(returl);
        result = await result.json();
        console.log(result);
        console.log(returl);
        setdoctorData(result);
      } else {
        const query =
          'SELECT * FROM CRM_offlineManagerDoctorList WHERE IDArea=?';
        const params = [IDArea];
        console.log(query + ' ' + params);
        //Retrieve data from CRM_RetList
        db.transaction(tx => {
          tx.executeSql(
            query,
            params,
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    //value: results.rows.item(i).IDDoctor,
                    IDDoctor: results.rows.item(i).IDDoctor,
                    Name: results.rows.item(i).Name,
                  });
                }
                setdoctorData(temp);
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

        //Retrieve data from CRM_DocList
        //const query = `
        //   SELECT * FROM CRM_offlineManagerDoctorList
        //   WHERE IDEmployee IN (${employeeIds.map(() => '?').join(', ')})
        //   AND IDArea = ?
        // `;

        //   const params = [...employeeIds, IDArea];

        // const query =
        //   'SELECT * FROM CRM_offlineManagerDoctorList WHERE IDArea = ?';
        // const params = [IDArea];

        // db.transaction(tx => {
        //   tx.executeSql(
        //     // 'SELECT * FROM CRM_offlineManagerDoctorList where IDEmployee =? AND IDArea=?',
        //     // [useMultipleIDEmployee, IDArea],
        //     query,
        //     params,
        //     (tx, results) => {
        //       // Check if there are rows in the result set
        //       if (results.rows.length > 0) {
        //         var temp = [];
        //         for (let i = 0; i < results.rows.length; ++i) {
        //           temp.push({
        //             value: results.rows.item(i).IDDoctor,
        //             label: results.rows.item(i).Name,
        //           });
        //         }
        //         setdoctorData(temp);
        //         //console.log('Data is inserted:', temp);
        //       } else {
        //         console.log('No data found');
        //       }
        //     },
        //     error => console.error('Error executing SELECT query: ', error),
        //   );
        // });
      }
    }, []);
  };

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const handleSearch = text => {
    setSearchQuery(text);
  };
  const filteredData = usedoctorData.filter(item => {
    return item.Name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const calculateDistane = (apiLat, apiLong, docCode, docName) => {
    console.log(apiLat, apiLong);
    console.log(currentLatitude, currentLongitude);
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(apiLat - currentLatitude);
    const dLon = deg2rad(apiLong - currentLongitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(apiLat)) *
        Math.cos(deg2rad(currentLatitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in kilometers

    const distance = d * 1000;
    const roundedNumber = Math.round(distance);
    console.log(distance);
    //console.warn(distance);
    //if (distance > 100) {
    if (distance > useDoctorGeofencing) {
      Alert.alert(
        'Distance Alert',
        `Distance exceeds ${useDoctorGeofencing} meters.\nYour distance: ${roundedNumber} meter\nDoc Code: ${docCode}\nDoc Name: ${docName}`,
      );
      // Alert.alert(
      //   'Distance exceeds 100 meters. Your distance: ' +
      //     roundedNumber +
      //     ' meter' +
      //     ' ' +
      //     +docCode +
      //     ' ' +
      //     docName,
      // );
      //setdoctorData([]);
      setSelectedProduct('');
    } else {
      // Alert.alert(
      //   'The distance between the two locations is within 100 meters.',
      // );
    }
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
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
          <Text style={{padding: 5}}>Lat : {currentLatitude}</Text>
          <Text style={{padding: 5}}>Long : {currentLongitude} </Text>
          {/* <Text style={{padding: 5}}>DCR Status : </Text> */}
        </View>
        {showData ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#33767C',
              width: '30%',
              padding: 5,
              margin: 5,
              borderRadius: 5,
              flexDirection: 'row',
            }}
            onPress={() => nextPS()}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
                margin: 5,
                padding: 5,
                fontFamily: 'Lato-Regular',
                color: '#fff',
              }}>
              Next
            </Text>
            <View
              style={{
                marginTop: 7,
                marginBottom: 5,
                paddingTop: 5,
                paddingBottom: 5,
              }}>
              <AntDesign
                name="arrowright"
                size={20}
                color="white"
                // onPress={() => {
                //   onDelete(dataItem.id);
                // }}
              />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
      {useManagerAccess ? (
        <View>
          {shouldShowDocVisitWithData ? (
            <View
              style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginLeft: 5,
                marginRight: 5,
              }}>
              <View>
                <MultipleSelectList
                  setSelected={val => setMvisitWTData(val)}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={
                    () => multiSelectVisitWith()
                    //console.log(usevisitWTData)
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{backgroundColor: 'green'}}
                  labelStyles={{fontWeight: '800', color: 'black'}}
                />
              </View>
              <View style={{marginBottom: 5, paddingBottom: 5}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useMArea}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Area' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    //setdocValue(item.value);
                    setMAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseMDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                {/* <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={usedoctorData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Doctor' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setdocValue(item.value);
                    setdocLabel(item.label);
                    setIsFocus(false);
                    doctorWiseProductListAPI(item.value);
                    setDocCode(item.value);
                  }}
                /> */}
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: 50,
                    borderRadius: 10,
                    borderWidth: 0.5,
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingLeft: 15,
                    paddingRight: 15,
                  }}
                  onPress={() => {
                    setClicked(!clicked);
                  }}>
                  <Text style={{fontWeight: '600'}}>
                    {selectedProduct == '' ? 'Select Doctor' : selectedProduct}
                  </Text>
                  {clicked ? (
                    <Image
                      source={require('../images/upload.png')}
                      style={{width: 10, height: 10}}
                    />
                  ) : (
                    <Image
                      source={require('../images/dropdown.png')}
                      style={{width: 10, height: 10}}
                    />
                  )}
                </TouchableOpacity>
                {clicked ? (
                  // <View
                  //   style={{
                  //     elevation: 5,
                  //     marginTop: 20,
                  //     height: 300,
                  //     alignSelf: 'center',
                  //     width: '90%',
                  //     backgroundColor: '#fff',
                  //     borderRadius: 10,
                  //   }}>
                  //   <TextInput
                  //     style={[style.searchBar, style.textInput]}
                  //     placeholder="Search..."
                  //     placeholderTextColor="#555"
                  //     value={searchQuery}
                  //     onChangeText={handleSearch}
                  //   />
                  //   <FlatList
                  //     //data={dataSample}
                  //     data={filteredData}
                  //     renderItem={({item, index}) => {
                  //       return (
                  //         <TouchableOpacity
                  //           style={{
                  //             width: '85%',
                  //             alignSelf: 'center',
                  //             height: 50,
                  //             justifyContent: 'center',
                  //             borderBottomWidth: 0.5,
                  //             borderColor: '#8e8e8e',
                  //           }}
                  //           onPress={() => {
                  //             setSelectedProduct(item.Name);
                  //             setdocValue(item.IDDoctor);
                  //             setdocLabel(item.Name);
                  //             //console.warn(useGeofencing);
                  //             if (useGeofencing === 'YES') {
                  //               calculateDistane(item.Latitude, item.Longitude);
                  //             }
                  //             doctorWiseProductListAPI(item.IDDoctor);
                  //             setDocCode(item.IDDoctor);
                  //           }}>
                  //           <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                  //         </TouchableOpacity>
                  //       );
                  //     }}
                  //   />
                  // </View>

                  <View
                    style={{
                      elevation: 5,
                      marginTop: 20,
                      height: 300, // Adjust height or use flex: 1 dynamically
                      alignSelf: 'center',
                      width: '90%',
                      backgroundColor: '#fff',
                      borderRadius: 10,
                    }}>
                    <TextInput
                      style={[style.searchBar, style.textInput]}
                      placeholder="Search..."
                      placeholderTextColor="#555"
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                    <FlatList
                      data={filteredData}
                      keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={{
                            width: '85%',
                            alignSelf: 'center',
                            height: 50,
                            justifyContent: 'center',
                            borderBottomWidth: 0.5,
                            borderColor: '#8e8e8e',
                          }}
                          onPress={() => {
                            setSelectedProduct(item.Name);
                            setdocValue(item.IDDoctor);
                            setdocLabel(item.Name);

                            if (useGeofencing === 'YES') {
                              calculateDistane(
                                item.Latitude,
                                item.Longitude,
                                item.IDDoctor,
                                item.Name,
                              );
                            }
                            console.warn(item.IDDoctor);
                            doctorWiseProductListAPI(item.IDDoctor);
                            doctorWiseAreaListAPI(item.IDDoctor);
                            setDocCode(item.IDDoctor);
                          }}>
                          <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                        </TouchableOpacity>
                      )}
                      contentContainerStyle={{paddingBottom: 20}} // Ensures proper scrollable area
                      nestedScrollEnabled={true} // Use this if inside another scrollable view
                    />
                  </View>
                ) : null}
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                <TextInput
                  //label="Remarks"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, {marginBottom: 5}]}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                />
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View>
          {shouldShowDocVisitWithData ? (
            <View
              style={{
                paddingLeft: 5,
                paddingRight: 5,
                marginLeft: 5,
                marginRight: 5,
              }}>
              <View style={{marginBottom: 5, paddingBottom: 5}}>
                <Dropdown
                  style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useArea}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Area' : '...'}
                  searchPlaceholder="Search..."
                  //value={wtdataLabel}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    // setdocValue(item.value);
                    // setdocLabel(item.label);
                    setAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>
              {/* <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={usedoctorData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                //dropdownPosition="top"
                placeholder={!isFocus ? 'Select Doctor' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setdocValue(item.value);
                  setdocLabel(item.label);
                  setIsFocus(false);
                  doctorWiseProductListAPI(item.value);
                  setDocCode(item.value);
                }}
              /> */}

              <TouchableOpacity
                style={{
                  width: '100%',
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 0.5,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingLeft: 15,
                  paddingRight: 15,
                }}
                onPress={() => {
                  setClicked(!clicked);
                }}>
                <Text style={{fontWeight: '600'}}>
                  {selectedProduct == '' ? 'Select Doctor' : selectedProduct}
                </Text>
                {clicked ? (
                  <Image
                    source={require('../images/upload.png')}
                    style={{width: 10, height: 10}}
                  />
                ) : (
                  <Image
                    source={require('../images/dropdown.png')}
                    style={{width: 10, height: 10}}
                  />
                )}
              </TouchableOpacity>
              {clicked ? (
                // <View
                //   style={{
                //     elevation: 5,
                //     marginTop: 20,
                //     height: 300,
                //     alignSelf: 'center',
                //     width: '90%',
                //     backgroundColor: '#fff',
                //     borderRadius: 10,
                //   }}>
                //   <TextInput
                //     style={[style.searchBar, style.textInput]}
                //     placeholder="Search..."
                //     placeholderTextColor="#555"
                //     value={searchQuery}
                //     onChangeText={handleSearch}
                //   />
                //   <FlatList
                //     //data={dataSample}
                //     data={filteredData}
                //     renderItem={({item, index}) => {
                //       return (
                //         <TouchableOpacity
                //           style={{
                //             width: '85%',
                //             alignSelf: 'center',
                //             height: 50,
                //             justifyContent: 'center',
                //             borderBottomWidth: 0.5,
                //             borderColor: '#8e8e8e',
                //           }}
                //           onPress={() => {
                //             setSelectedProduct(item.Name);
                //             setdocValue(item.IDDoctor);
                //             setdocLabel(item.Name);
                //             //console.warn(useGeofencing);
                //             if (useGeofencing === 'YES') {
                //               calculateDistane(item.Latitude, item.Longitude);
                //             }
                //             doctorWiseProductListAPI(item.IDDoctor);
                //           }}>
                //           <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                //         </TouchableOpacity>
                //       );
                //     }}
                //   />
                // </View>
                <View
                  style={{
                    elevation: 5,
                    marginTop: 20,
                    height: 300, // Adjust height or use flex: 1 dynamically
                    alignSelf: 'center',
                    width: '90%',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                  }}>
                  <TextInput
                    style={[style.searchBar, style.textInput]}
                    placeholder="Search..."
                    placeholderTextColor="#555"
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  <FlatList
                    data={filteredData}
                    keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                    renderItem={({item}) => (
                      <TouchableOpacity
                        style={{
                          width: '85%',
                          alignSelf: 'center',
                          height: 50,
                          justifyContent: 'center',
                          borderBottomWidth: 0.5,
                          borderColor: '#8e8e8e',
                        }}
                        onPress={() => {
                          setSelectedProduct(item.Name);
                          setdocValue(item.IDDoctor);
                          setdocLabel(item.Name);
                          if (
                            useGeofencing === 'YES' &&
                            item.Latitude !== '0.0000000000' &&
                            item.Longitude !== '0.0000000000'
                          ) {
                            calculateDistane(
                              item.Latitude,
                              item.Longitude,
                              item.IDDoctor,
                              item.Name,
                            );
                            //Alert.alert('Hi');
                          }
                          doctorWiseProductListAPI(item.IDDoctor);
                          doctorWiseAreaListAPI(item.IDDoctor);
                          console.log(item.IDDoctor);
                        }}>
                        <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={{paddingBottom: 20}} // Ensures proper scrollable area
                    nestedScrollEnabled={true} // Use this if inside another scrollable view
                  />
                </View>
              ) : null}

              <View style={{marginTop: 5, paddingTop: 5}}>
                <MultipleSelectList
                  setSelected={val => setvisitWTData(val)}
                  data={usevisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={
                    () => console.log(usevisitWTData)
                    //multiSelectVisitWith()
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{backgroundColor: 'green'}}
                  labelStyles={{fontWeight: '800', color: 'black'}}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
                <TextInput
                  //label="Remarks"
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, {marginBottom: 5}]}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                />
              </View>
            </View>
          ) : null}
        </View>
      )}
      <View>
        {shouldShowSampleData ? (
          <SafeAreaView style={{flex: 1}}>
            <View style={{marginLeft: 10, marginRight: 10}}>
              <CustomDCR
                selectionMode={1}
                option1="Sample"
                option2="Gift"
                option3="Campaign"
                onSelectSwitch={onSelectSwitch}
              />
            </View>
            {gamesTab == 1 && (
              <View style={{margin: 10}}>
                <View style={{flexDirection: 'row'}}>
                  <Dropdown
                    style={[
                      style.dropdownNew,
                      isFocus && {borderColor: 'blue', width: '50%'},
                    ]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={sampleData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Sample' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.value);
                      setSLabel(item.label);
                      setSValue(item.value);
                      setIsFocus(false);
                    }}
                  />
                  <TextInput
                    //label="Quantity"
                    mode="outlined"
                    autoCapitalize="none"
                    inputMode="numeric"
                    autoCorrect={false}
                    value={useQty}
                    // key={index}
                    // value={dataGift[index]}
                    style={[
                      style.textInput,
                      {width: '20%', alignItems: 'center', marginRight: 5},
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setQty(text)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#33767C',
                      width: '25%',

                      margin: 5,
                      borderRadius: 5,
                      flexDirection: 'row',
                    }}
                    onPress={() => addSample()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 18,
                        marginLeft: 25,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#fff',
                      }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={sampleQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menu,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              onDeleteSample(index);
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 5,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Name :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                width: '80%',
                                textAlignVertical: 'center',
                              }}>
                              {item.label}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Qty :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.key}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
                {/* <View>
                  {sampleQtyData.length
                    ? sampleQtyData.map((item, index) => {
                        return (
                          <ScrollView>
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  style.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                    flexDirection: 'row',
                                  },
                                ]}>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <AntDesign
                                    name="delete"
                                    size={30}
                                    color="red"
                                    onPress={() => {
                                      onDeleteSample(item.id);
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: 5,
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Name :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        width: '80%',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Name}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Qty :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Qty}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          </ScrollView>
                        );
                      })
                    : null}
                </View> */}
              </View>
            )}
            {gamesTab == 2 && (
              <View style={{margin: 10}}>
                <View style={{flexDirection: 'row'}}>
                  <Dropdown
                    style={[
                      style.dropdownNew,
                      isFocus && {borderColor: 'blue', width: '50%'},
                    ]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={giftData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Gift' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.value);
                      setGLabel(item.label);
                      setGValue(item.value);
                      setIsFocus(false);
                    }}
                  />
                  <TextInput
                    //label="Quantity"
                    mode="outlined"
                    autoCapitalize="none"
                    inputMode="numeric"
                    autoCorrect={false}
                    value={useGQty}
                    // key={index}
                    // value={dataGift[index]}
                    style={[
                      style.textInput,
                      {width: '20%', alignItems: 'center', marginRight: 5},
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setGQty(text)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#33767C',
                      width: '25%',

                      margin: 5,
                      borderRadius: 5,
                      flexDirection: 'row',
                    }}
                    onPress={() => addGift()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 18,
                        marginLeft: 25,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#fff',
                      }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={giftQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menu,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              //onDeleteGift(item.value);
                              onDeleteGift(index);
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 5,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Name :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                width: '80%',
                                textAlignVertical: 'center',
                              }}>
                              {item.label}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Qty :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.key}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
                {/* <View>
                  {giftQtyData.length
                    ? giftQtyData.map((item, index) => {
                        return (
                          <ScrollView>
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  style.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                    flexDirection: 'row',
                                  },
                                ]}>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <AntDesign
                                    name="delete"
                                    size={30}
                                    color="red"
                                    onPress={() => {
                                      onDeleteGift(item.id);
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: 5,
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Name :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        width: '80%',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Name}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Qty :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Qty}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          </ScrollView>
                        );
                      })
                    : null}
                </View> */}
              </View>
            )}
            {gamesTab == 3 && (
              <View style={{margin: 10}}>
                <View
                  style={{
                    backgroundColor: '#ecf0f1',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    borderWidth: 0.1,
                    margin: 10,
                    elevation: 2,
                    borderRadius: 1,
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <Dropdown
                      style={[
                        style.dropdownNew,
                        isFocus && {borderColor: 'blue', width: '50%'},
                      ]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={campData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Campaign' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.value);
                        setCLabel(item.label);
                        setCValue(item.value);
                        setIsFocus(false);
                      }}
                    />
                    <Dropdown
                      style={[
                        style.dropdownNew,
                        isFocus && {borderColor: 'blue', width: '50%'},
                      ]}
                      placeholderStyle={style.placeholderStyle}
                      selectedTextStyle={style.selectedTextStyle}
                      inputSearchStyle={style.inputSearchStyle}
                      iconStyle={style.iconStyle}
                      data={prodData}
                      search
                      maxHeight={300}
                      labelField="label"
                      valueField="value"
                      placeholder={!isFocus ? 'Select Product' : '...'}
                      searchPlaceholder="Search"
                      onFocus={() => setIsFocus(true)}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        console.log(item.value);
                        setPLabel(item.label);
                        setPValue(item.value);
                        setIsFocus(false);
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      margin: 5,
                      alignSelf: 'center',
                    }}>
                    <TextInput
                      //label="Quantity"
                      mode="outlined"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={useCRemarks}
                      // key={index}
                      // value={dataGift[index]}
                      style={[
                        style.textInput,
                        {width: '40%', alignItems: 'center', marginRight: 5},
                      ]}
                      placeholder="Remarks"
                      placeholderTextColor="#555"
                      onChangeText={text => setCRemarks(text)}
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#33767C',
                        width: '30%',
                        margin: 5,
                        borderRadius: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => addCampaign()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 18,
                          marginLeft: 25,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#fff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <FlatList
                  data={campaignData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menu,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              //onDeleteGift(item.value);
                              onDeleteCampaign(index);
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 5,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginLeft: 10,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Campaign Name :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                width: '80%',
                                textAlignVertical: 'center',
                              }}>
                              {item.campaignName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginLeft: 10,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Product Name :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                width: '80%',
                                textAlignVertical: 'center',
                              }}>
                              {item.productName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              marginLeft: 10,
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Remarks :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                width: '80%',
                                textAlignVertical: 'center',
                              }}>
                              {item.key}
                            </Text>
                          </View>
                          {/* <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Remarks :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.key}
                            </Text>
                          </View> */}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
                {/* <View>
                  {giftQtyData.length
                    ? giftQtyData.map((item, index) => {
                        return (
                          <ScrollView>
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  style.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                    flexDirection: 'row',
                                  },
                                ]}>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                  <AntDesign
                                    name="delete"
                                    size={30}
                                    color="red"
                                    onPress={() => {
                                      onDeleteGift(item.id);
                                    }}
                                  />
                                </View>
                                <View
                                  style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: 5,
                                  }}>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Name :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        width: '80%',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Name}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}>
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        fontFamily: 'Lato-Regular',
                                        color: '#000',
                                        margin: 2,
                                        padding: 2,
                                        textAlignVertical: 'center',
                                      }}>
                                      Qty :{' '}
                                    </Text>
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        fontFamily: 'Lato-Bold',
                                        color: '#000',
                                        textAlignVertical: 'center',
                                      }}>
                                      {item.Qty}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </TouchableWithoutFeedback>
                          </ScrollView>
                        );
                      })
                    : null}
                </View> */}
              </View>
            )}
          </SafeAreaView>
        ) : null}

        {shouldProdStage ? (
          <SafeAreaView style={style.container}>
            <View style={style.btnTab}>
              <Text style={style.textTab}>Product Stage</Text>
            </View>
            {dataProduct.length
              ? dataProduct.map(function (dataItem, index) {
                  return (
                    <ScrollView>
                      <TouchableWithoutFeedback>
                        <View
                          style={[
                            style.menu,
                            {
                              backgroundColor: '#ecf0f1',
                            },
                          ]}>
                          {/* <Text style={style.menuItem}>{dataItem.Name}</Text> */}
                          <Text style={style.menuItem}>
                            {dataItem.ProductName}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                            }}>
                            <Text style={style.wrapper}>
                              {dataItem.StageName}
                            </Text>
                            <Dropdown
                              style={[
                                style.dropdownStage,
                                isFocus && {borderColor: 'blue'},
                              ]}
                              placeholderStyle={style.placeholderStyle}
                              selectedTextStyle={style.selectedTextStyle}
                              inputSearchStyle={style.inputSearchStyle}
                              iconStyle={style.iconStyle}
                              data={fStageData}
                              search
                              maxHeight={300}
                              labelField="label"
                              valueField="value"
                              dropdownPosition="top"
                              //placeholder={!isFocus ? 'Final Stage' : '...'}
                              placeholder={
                                !isFocus ? dataItem.StageName : '...'
                              }
                              searchPlaceholder="Search..."
                              //value={wtdataLabel}
                              onFocus={() => setIsFocus(true)}
                              onBlur={() => setIsFocus(false)}
                              onChange={item => {
                                if (fStageLabel.includes(item.value)) {
                                  //console.warn('Hi');
                                  setfStageLabel(
                                    fStageLabel.filter(
                                      item => item !== item.value,
                                    ),
                                  );
                                } else {
                                  // Item is not selected, so add it to the selectedItems array
                                  //setSelectedItems([...selectedItems, itemId]);
                                  //console.warn('Hello');
                                  setfStageLabel([...fStageLabel, item.value]);
                                }
                                setIsFocus(false);
                              }}
                            />
                          </View>
                        </View>
                      </TouchableWithoutFeedback>
                    </ScrollView>
                  );
                })
              : null}
            <CustomButton label={'End DCR'} onPress={() => save()} />
          </SafeAreaView>
        ) : null}
      </View>
      <ProgressDialog visible={loading} message="Loading, please wait..." />
    </ScrollView>
  );
};

export default DoctorDCRScreen;

const style = StyleSheet.create({
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
  dropdownNew: {
    height: 50,
    width: '50%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginRight: 5,
    marginTop: 5,
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
    fontSize: 12,
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
    marginBottom: 10,
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
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  wrapper: {
    height: 50,
    width: '30%',
    marginTop: 5,
    //marginBottom:5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    //paddingHorizontal: 5,
    backgroundColor: '#fff',
    fontFamily: 'Lato-Bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
  modalContainer: {
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
    elevation: 5,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },
});
