import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import Geocoder from 'react-native-geocoding';
import {BASE_URL} from '@env';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import NetInfo from '@react-native-community/netinfo';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import {openDatabase} from 'react-native-sqlite-storage';
import {FlatList} from 'react-native-gesture-handler';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DeviceInfo from 'react-native-device-info';
import ProgressDialog from '../components/custom/ProgressDialog';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import Icon from 'react-native-vector-icons/Feather';

// Initialize Geocoder with your Google API Key
Geocoder.init('AIzaSyAK6U3-x1ro826D0T0P1_gShb4rst_ka2c'); // Replace with your API Key

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

const MasterDoctor = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [useCode, setCode] = useState('');
  const [docCode, setDocCode] = useState('');
  const [useName, setName] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useempEmail, setempEmail] = useState('');
  const [useMobile, setMobile] = useState('');
  const [selectedMArea, setSelectedMArea] = useState([]);
  const [useType, setType] = useState([]);
  const [useData, setData] = useState([]);
  const [useQData, setQData] = useState([]);
  const [useQValue, setQValue] = useState('');
  const [useQLabel, setQLabel] = useState('');
  const [useSData, setSData] = useState([]);
  const [useSValue, setSValue] = useState('');
  const [useSLabel, setSLabel] = useState('');
  const [useCData, setCData] = useState([]);
  const [useCValue, setCValue] = useState('');
  const [useCLabel, setCLabel] = useState('');
  const [useAData, setAData] = useState([]);
  const [useAValue, setAValue] = useState('');
  const [useALabel, setALabel] = useState('');
  const [usePData, setPData] = useState([]);
  const [usePValue, setPValue] = useState('');
  const [usePLabel, setPLabel] = useState('');
  const [useAreaSelected, setAreaSelected] = useState('');
  const [useTypeSelected, setTypeSelected] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [fStageData, setfStageData] = useState([]);
  const [fStageLabel, setfStageLabel] = useState('');
  const [fStageValue, setfStageValue] = useState('');
  const [shouldShowMD, setshouldShowMD] = useState(true);
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();
    //getAddress();
    //AIzaSyCom4hOSUuk0f1RE6w1C_HDMhpwH70nr8A
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setempEmail(user.Empemail);
          setIDDivision(user.IDDivision);
          setIDEmployee(user.IDEmployee);
          setuseMobileAccess(user.MobileAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const wturl =
                BASE_URL +
                'Doctor/DoctorAutoCode?Businessid=' +
                user.BusinessID +
                '&Type=Doctor';
              //console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  //console.log('doctorViewDCR', response.data.d);
                  setDocCode(response.data.d);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              fetchOnlineTableData(
                user.BusinessID,
                user.IDEmployee,
                user.IDDivision,
                user.IDHQ,
              );
            } else {
              Alert.alert('No Internet');
              fetchOfflineTableData();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavMaster'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
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
      async position => {
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

        try {
          const response = await Geocoder.from(
            currentLatitude,
            currentLongitude,
          ); // Example: San Francisco coordinates
          console.log(currentLatitude, currentLongitude);

          const address = response.results[0].formatted_address;
          setLocationAddress(address);
          console.log('getOneTimeLocation', address);
        } catch (error) {
          console.error('Error fetching location', error);
        }
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
      async position => {
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

        try {
          const response = await Geocoder.from(
            currentLatitude,
            currentLongitude,
          ); // Example: San Francisco coordinates
          console.log(currentLatitude, currentLongitude);

          const address = response.results[0].formatted_address;
          setLocationAddress(address);
          console.log('getMultipleTimeLocation', address);
        } catch (error) {
          console.error('Error fetching location', error);
        }
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOnlineTableData = (businessID, idEmp, idDivision, IDHQ) => {
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
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

    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
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

    const curl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
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

    const aurl =
      // BASE_URL +
      // 'Area/DivisionWiseAreaList?Businessid=' +
      // businessID +
      // '&IDDivision=' +
      // idDivision;
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDivision +
      '&IDHQ=' +
      IDHQ;
    //console.log('surllll', aurl);
    var config = {
      method: 'get',
      url: aurl,
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
        setAData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const durl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDivision +
      '&Type=DOCTORPRODUCT';
    //console.log(durl);
    var config = {
      method: 'get',
      url: durl,
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
        setPData(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
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

    const empurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=DOCTORTYPE';
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
            value: response.data[i].Name,
            key: response.data[i].IDMisc,
          });
        }
        setTypeSelected(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const fetchOfflineTableData = () => {
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

    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM MasterDoctorType',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).Name,
                key: results.rows.item(i).IDMisc,
              });
            }
            //temp.shift();
            setTypeSelected(temp);
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
        'SELECT * FROM CRM_Master_Area',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDArea,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setAData(temp);
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
        'SELECT * FROM CRM_Master_Doctor_Product',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDProduct,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setPData(temp);
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
        'SELECT * FROM CRM_finalStageList',
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
            setfStageData(temp);
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
  };

  const onDelete = id => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM CRM_MasterDoctor WHERE id = ?',
        [id],
        (tx, results) => {
          // Check if deletion was successful
          if (results.rowsAffected > 0) {
            // Update the state to re-render the FlatList without the deleted item
            setData(prevData => prevData.filter(item => item.id !== id));
          }
        },
      );
    });
  };
  const next = () => {
    if (useName === '') {
      Alert.alert('Type Name');
    } else if (useQLabel === '') {
      Alert.alert('Select Qualification');
    } else if (useSLabel === '') {
      Alert.alert('Select Speciality');
    } else if (useCLabel === '') {
      Alert.alert('Select Category');
    } else if (useALabel === '') {
      Alert.alert('Select Area');
    } else if (useMobile === '') {
      Alert.alert('Type Mobile Number');
    } else {
      setshouldShowMD(false);

      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorCode(id INTEGER PRIMARY KEY AUTOINCREMENT,Name VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_MasterDoctorCode(Name) VALUES (?)';
      let params = [useName]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_MasterDoctorCode',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i).id);
              }
              setCode(temp);
              //console.log(temp);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };
  const addData = () => {
    if (usePLabel.length === 0) {
      Alert.alert('Select Product');
    } else if (fStageLabel.length === 0) {
      Alert.alert('Select Stage');
    } else {
      //CREATE TABLE for CRM_MasterDoctor
      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_MasterDoctor(id INTEGER PRIMARY KEY AUTOINCREMENT,ProductValue VARCHAR,ProductLabel VARCHAR,StageValue VARCHAR,StageLabel VARCHAR)',
          [],
        );
      });

      let sql =
        'INSERT INTO CRM_MasterDoctor(ProductValue,ProductLabel,StageValue,StageLabel) VALUES (?,?,?,?)';
      let params = [usePValue, usePLabel, fStageValue, fStageLabel]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_MasterDoctor',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i));
              }
              setData(temp);
              //console.log(temp);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };
  const saveData = async () => {
    if (useData.length === 0) {
      Alert.alert('Select Product & Stage');
    } else {
      let deviceId = DeviceInfo.getDeviceId();
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            let productsID = [];
            let doctorType = [];
            useData.map(function (value) {
              productsID.push({
                IDProduct: value.ProductValue,
                IDSatge: value.StageValue,
              });
            });
            useType.map(function (value) {
              doctorType.push({
                IDType: value.IDMisc,
              });
            });

            const data = {
              IDDoctor: 0,
              //Code: 'MDOC'+useIDEmployee + useCode,
              //Code: deviceId + useCode,
              Code: docCode,
              Name: useName,
              Practice: '',
              IDQualification: useQValue,
              IDDivision: useIDDivision,
              IDSpeciality: useSValue,
              IDCategory: useCValue,
              IDArea: useAValue,
              IDArea2: 0,
              IDHQ: 0,
              Mobile: useMobile,
              Email: '',
              //IDEmployee: useIDEmployee,
              Employee: {IDEmployee: useIDEmployee},
              Latitude1: 0,
              Longitude1: 0,
              Latitude2: 0,
              Longitude2: 0,
              Address1: '',
              Address2: '',
              Pincode: '',
              DOB: '',
              Age: 0,
              PatientNo: 0,
              CreatedBy: useempEmail,
              Businessid: useBusinessID,
              Products: productsID,
              DoctorType: doctorType,
            };
            console.log('data,', data);

            let result = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            result = await result.json();
            //console.log(result);
            if (result.result === '') {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 5000);
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctor');
              });
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctorCode');
              });
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavMaster'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
              }, 5000);
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctor');
              });
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctorCode');
              });
              Alert.alert('Else : ' + result.result);
              navigation.navigate('AppNavMaster');
            }
          } else {
            Alert.alert('You Are Offline Contact With Administrator!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            let productsID = [];
            let doctorType = [];
            // useData.map(function (value) {
            //   productsID.push({
            //     IDProduct: value.ProductValue,
            //     IDSatge: value.StageValue,
            //   });
            // });

            productsID = useData.map(item => ({
              IDProduct: String(parseInt(item.ProductValue)), // removes .0
              IDSatge: String(parseInt(item.StageValue)),
            }));

            useType.map(function (value) {
              doctorType.push({
                IDType: value,
              });
              //console.log('value.IDMisc', value);
            });
            const data = {
              IDDoctor: 0,
              //Code: 'MDOC'+useIDEmployee + useCode,
              //Code: deviceId + useCode,
              Code: docCode,
              Name: useName,
              Practice: '',
              IDQualification: useQValue,
              IDDivision: useIDDivision,
              IDSpeciality: useSValue,
              IDCategory: useCValue,
              IDArea: useAValue,
              IDArea2: 0,
              IDHQ: 0,
              Mobile: useMobile,
              Email: '',
              Employee: {IDEmployee: useIDEmployee},
              Latitude1: 0,
              Longitude1: 0,
              Latitude2: 0,
              Longitude2: 0,
              Address1: '',
              Address2: '',
              Pincode: '',
              DOB: '',
              Age: 0,
              PatientNo: 0,
              CreatedBy: useempEmail,
              Businessid: useBusinessID,
              Products: productsID,
              DoctorType: doctorType,
            };
            console.log('data', data);

            let result = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            result = await result.json();
            console.log(result);
            if (result.result === '') {
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctor');
              });
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctorCode');
              });
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    //onPress: () => navigation.navigate('Report DashBoard'),
                    onPress: () => navigation.navigate('AppNavMaster'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctor');
              });
              db.transaction(tx => {
                tx.executeSql('DELETE from CRM_MasterDoctorCode');
              });
              Alert.alert('Else : ' + result.result);
              navigation.navigate('AppNavMaster');
            }
          } else {
            let productsID = [];
            useData.map(function (value) {
              productsID.push(
                // IDProduct: value.ProductValue,
                // IDSatge: value.StageValue,
                value.ProductValue,
              );
            });

            let stageID = [];
            useData.map(function (value) {
              stageID.push(value.StageValue);
            });

            let doctorType = [];
            useType.map(function (value) {
              doctorType.push(value);
              console.log('value.IDMisc', value);
            });

            const data = {
              IDDoctor: 0,
              //Code: 'MDOC'+useIDEmployee + useCode,
              Code: deviceId + useCode,
              //Code: docCode,
              Name: useName,
              Practice: '',
              IDQualification: useQValue,
              IDDivision: useIDDivision,
              IDSpeciality: useSValue,
              IDCategory: useCValue,
              IDArea: useAValue,
              IDArea2: 0,
              IDHQ: 0,
              Mobile: useMobile,
              Email: '',
              IDEmployee: useIDEmployee,
              Latitude1: 0,
              Longitude1: 0,
              Latitude2: 0,
              Longitude2: 0,
              Address1: '',
              Address2: '',
              Pincode: '',
              DOB: '',
              Age: 0,
              PatientNo: 0,
              CreatedBy: useempEmail,
              Businessid: useBusinessID,
              IDProducts: productsID,
              IDStage: stageID,
              DoctorType: doctorType,
            };
            console.log(' data for offline', data);

            db.transaction(txn => {
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS ViewMasterDocList(IDDoctor INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
                [],
              );
            });

            let sql =
              'INSERT INTO ViewMasterDocList(IDDoctor,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
            //let params = [0, deviceId + useCode, useName, useAValue, ,]; //storing user data in an array
            let params = [0, docCode, useName, useAValue, ,]; //storing user data in an array
            db.executeSql(sql, params);

            db.transaction(tx => {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS CRM_MasterDoctorDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                'INSERT INTO CRM_MasterDoctorDataSave (data) VALUES (?);',
                [JSON.stringify(data)],
                (_, result) => {
                  console.log('Data inserted successfully:', result);
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_MasterDoctor');
                  });
                  db.transaction(tx => {
                    tx.executeSql('DELETE from CRM_MasterDoctorCode');
                  });
                  navigation.navigate('AppNavMaster');
                },
                (_, error) => {
                  console.log('Error inserting data:', error);
                },
              );
            });
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
      }
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.row}>
      <Text style={styles.cellDate}>{item.date}</Text>

      <Text style={styles.cellLead}>{item.leadNo}</Text>

      <Text style={styles.cellCustomer}>{item.customer}</Text>

      <Text style={styles.cellPhone}>{item.phone}</Text>

      <Text style={styles.cellEmail}>{item.email}</Text>

      <Text style={styles.cellProduct}>{item.product}</Text>

      <View style={styles.cellAction}>
        <TouchableOpacity>
          <Icon name="bar-chart-2" size={18} color="#0ea5e9" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Icon name="share-2" size={18} color="#0ea5e9" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {shouldShowMD ? (
        <View
          style={{
            padding: 8,
            margin: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'lightgrey',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
          }}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 16}}>
            Doctor Information
          </Text>
          <View>
            <TextInput
              label="Name"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              value={useName}
              onChangeText={text => setName(text)}
            />
            <View
              style={{
                marginTop: 5,
              }}>
              <TextInput
                label="Code"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={{marginBottom: 5}}
                value={docCode}
                editable={false}
                // onChangeText={text => setDocCode(text)}
              />
            </View>
            <View
              style={{
                marginTop: 5,
                // marginBottom: 2,
                // paddingBottom: 2,
                paddingTop: 5,
              }}>
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
                placeholder={!isFocus ? 'Qualification' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  setQLabel(item.label);
                  setQValue(item.value);
                  // handleState(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
            <View
              style={{
                marginTop: 5,
                // marginBottom: 2,
                // paddingBottom: 2,
                paddingTop: 5,
              }}>
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
                placeholder={!isFocus ? 'Speciality' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  console.log(item.value);
                  setSLabel(item.label);
                  setSValue(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
            <View
              style={{
                marginTop: 5,
                // marginBottom: 2,
                // paddingBottom: 2,
                paddingTop: 5,
              }}>
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
                  setIsFocus(false);
                }}
              />
            </View>
            <View
              style={{
                marginTop: 5,
                // marginBottom: 2,
                // paddingBottom: 2,
                paddingTop: 5,
              }}>
              {/* {useBusinessID === 'MEND-PVTL-890' ? ( */}
              <MultipleSelectList
                setSelected={val => setType(val)}
                data={useTypeSelected}
                placeholder="Type"
                label="Type"
                //save="value"
                save="key"
                onSelect={
                  () => console.log(useType)
                  //multiSelectAreaList()
                }
                fontFamily="Roboto-Bold"
                notFoundText="No Data Exists"
                //badgeTextStyles={{color:'red'}}
                badgeStyles={{backgroundColor: 'green'}}
                labelStyles={{fontWeight: '800', color: 'black'}}
              />
              {/* ) : null} */}

              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useAData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                dropdownPosition="top"
                placeholder={!isFocus ? 'Area' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.label);
                  setALabel(item.label);
                  setAValue(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
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
          <View style={{margin: 2, padding: 2}}>
            <CustomButton label={'Next'} onPress={() => next()} />
          </View>
        </View>
      ) : (
        <ScrollView
          style={{
            padding: 8,
            margin: 5,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'lightgrey',
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
          }}>
          <Text style={{fontWeight: 'bold', marginBottom: 5, fontSize: 16}}>
            Doctor Information
          </Text>
          <View
            style={{
              marginTop: 5,
              // marginBottom: 2,
              // paddingBottom: 2,
              paddingTop: 5,
            }}>
            <Dropdown
              style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
              placeholderStyle={style.placeholderStyle}
              selectedTextStyle={style.selectedTextStyle}
              inputSearchStyle={style.inputSearchStyle}
              iconStyle={style.iconStyle}
              data={usePData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Product' : '...'}
              searchPlaceholder="Search"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                console.log(item.label);
                setPLabel(item.label);
                setPValue(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          <View
            style={{
              marginTop: 5,
              // marginBottom: 2,
              // paddingBottom: 2,
              paddingTop: 5,
            }}>
            <Dropdown
              style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
              placeholderStyle={style.placeholderStyle}
              selectedTextStyle={style.selectedTextStyle}
              inputSearchStyle={style.inputSearchStyle}
              iconStyle={style.iconStyle}
              data={fStageData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Stage' : '...'}
              searchPlaceholder="Search"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                console.log(item.label);
                setfStageLabel(item.label);
                setfStageValue(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          <View style={{margin: 2, padding: 2}}>
            <CustomButton label={'Add'} onPress={() => addData()} />
          </View>
          {/* <View>
            {useData.length
              ? useData.map(function (dataItem, index) {
                return (
                  // <ScrollView>
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
                          marginLeft: 20,
                        }}>
                        <AntDesign
                          name="delete"
                          size={30}
                          color="red"
                          onPress={() => {
                            onDelete(dataItem.id);
                          }}
                        />
                      </View>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 20,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            Product :{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            {dataItem.ProductLabel}
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            Stage :{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                              marginTop: 5,
                              paddingTop: 5,
                              textAlignVertical: 'center',
                            }}>
                            {dataItem.StageLabel}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                  //</ScrollView>
                );
              })
              : null}
          </View> */}

          {useData && useData.length > 0 ? (
            <View style={{margin: 10}}>
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#005696',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                }}>
                <Text style={{flex: 0.2, color: '#fff', fontWeight: 'bold'}}>
                  No
                </Text>
                <Text style={{flex: 0.4, color: '#fff', fontWeight: 'bold'}}>
                  Product
                </Text>
                <Text style={{flex: 0.3, color: '#fff', fontWeight: 'bold'}}>
                  Stage
                </Text>
                <Text
                  style={{
                    flex: 0.1,
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  Del
                </Text>
              </View>

              {/* Body */}
              <ScrollView style={{maxHeight: 400}}>
                {useData.map((dataItem, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: index % 2 === 0 ? '#f7f9f9' : '#ecf0f1',
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderBottomWidth: 1,
                      borderColor: '#ddd',
                      alignItems: 'center',
                    }}>
                    <Text style={{flex: 0.2, color: '#000'}}>{index + 1}</Text>
                    <Text style={{flex: 0.4, color: '#000', fontWeight: '600'}}>
                      {dataItem.ProductLabel}
                    </Text>
                    <Text style={{flex: 0.3, color: '#000'}}>
                      {dataItem.StageLabel}
                    </Text>
                    <TouchableOpacity
                      style={{flex: 0.1, alignItems: 'center'}}
                      onPress={() => onDelete(dataItem.id)}>
                      <AntDesign name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View
            style={{
              marginLeft: 5,
              marginRight: 5,
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            <CustomButton label={'Save'} onPress={() => saveData()} />
          </View>
          <ProgressDialog visible={loading} message="Please Wait..." />
        </ScrollView>
      )}
    </KeyboardAwareLayout>
  );
};

export default MasterDoctor;

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
    fontSize: 16,
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
  menu: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    padding: 5,

    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 2,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    borderColor: 'black',
    //borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    //elevation: 5,
    borderRadius: 5,
  },
});
