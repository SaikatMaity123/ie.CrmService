import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
  Modal,
  Button,
  StatusBar,
  Linking,
  Keyboard,
  PermissionsAndroid,
} from 'react-native';
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import moment from 'moment';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {openSettings} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import {FlatList} from 'react-native';
import {BASE_URL, url} from '@env';
import NetInfo from '@react-native-community/netinfo';
import CustomDCR from '../components/custom/CustomDCR';
import ProgressDialog from '../components/custom/ProgressDialog';
import Snackbar from 'react-native-snackbar';
import MapView, {PROVIDER_GOOGLE, Marker, Circle} from 'react-native-maps';
import {useFocusEffect} from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import FastImage from 'react-native-fast-image';
import Voice from '@react-native-voice/voice';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
//import Sound from 'react-native-sound';
import {bengaliToEnglish} from './bengaliToEnglish';

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

const DCRDoctorNew = ({navigation}) => {
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [deviceType, setDevice] = useState('');
  const [shouldShowDocVisitWithData, setshouldShowDocVisitWithData] =
    useState(false);
  const [shouldShowSampleData, setshouldShowSampleData] = useState(false);
  const [showData, setshowData] = useState(true);
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [sampleQtyData, setsampleQtyData] = useState([]);
  const [shouldProdStage, setshouldProdStage] = useState(false);
  const [docLabel, setdocLabel] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [usedoctorData, setdoctorData] = useState([]);
  const [useMultipleIDEmployee, setMultipleIDEmployee] = useState('');
  const [useMArea, setMArea] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [selectedMArea, setSelectedMArea] = useState(null);
  const [useMAreaLabel, setMAreaLabel] = useState('');
  const [clicked, setClicked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [doctorLocation, setDoctorLocation] = useState(null);
  const [docValue, setdocValue] = useState('');
  const [docName, setDocName] = useState('');
  const [docCode, setDocCode] = useState('');
  const [useGeofencing, setGeofencing] = useState('');
  const [useDoctorGeofencing, setDoctorGeofencing] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useAreaLabel, setAreaLabel] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [dataProduct, setdataProduct] = useState([]);
  const [useArea, setArea] = useState([]);
  const [gamesTab, setGamesTab] = useState(1);
  const [sampleData, setsampleData] = useState([]);
  const [sLabel, setSLabel] = useState('');
  const [giftData, setgiftData] = useState([]);
  const [sValue, setSValue] = useState('');
  const [useQty, setQty] = useState('');
  const [gLabel, setGLabel] = useState('');
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [gValue, setGValue] = useState('');
  const [useGQty, setGQty] = useState('');
  const [giftQtyData, setgiftQtyDataData] = useState([]);
  const [campData, setcampData] = useState([]);
  const [cLabel, setCLabel] = useState('');
  const [prodData, setprodData] = useState([]);
  const [useCRemarks, setCRemarks] = useState('');
  const [cValue, setCValue] = useState('');
  const [pLabel, setPLabel] = useState('');
  const [distance, setDistance] = useState(null);
  const [pValue, setPValue] = useState('');
  const [campaignData, setCampaignData] = useState([]);
  const [fStageData, setfStageData] = useState([]);
  const [usedataStage, setdataStage] = useState([]);
  const [selectedStages, setSelectedStages] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null); // Current location of the user
  const lastInsideRef = useRef(null); // remembers last in/out state to stop flapping
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [selectedDoctorCoords, setSelectedDoctorCoords] = useState(null); // { lat, lon }
  const [selectedDoctorMeta, setSelectedDoctorMeta] = useState(null); // { code, name }
  const [isListening, setIsListening] = useState(false);
  const locationInterval = useRef(null);
  const retryPermissionInterval = useRef(null);
  const failureCount = useRef(0);

  var cdate = moment().format('D/MMM/YYYY');

  // useEffect(() => {
  //   LogBox.ignoreLogs([
  //     'VirtualizedLists should never be nested',
  //     'Each child in a list should have a unique "key" prop.',
  //   ]);

  //   //askLocationPermissionFirstTime(); // ← NEW LOGIC
  //   //getOneTimeLocation();
  //   //handleEnabledPressed();
  //   //handleCheckPressed();

  //   // No popup on load in iOS
  //   if (Platform.OS === 'android') {
  //     requestLocationPermission(); // Popup shown only Android initial
  //   }
  //   handleGPSCheck();
  //   getData();
  //   setshouldShowDocVisitWithData(true);
  //   setshouldShowSampleData(true);

  //   DeviceInfo.getDeviceName().then(deviceName => {
  //     setDevice(deviceName);
  //   });

  //   const interval = setInterval(() => {
  //     if (Platform.OS === 'android') {
  //       getCurrentLocation();
  //     } else {
  //       // iOS will give location silently after first allow
  //       getCurrentLocation();
  //     }
  //   }, 5000);

  //   return () => {
  //     clearInterval(interval);
  //     clearInterval(retryPermissionInterval);
  //   };
  // }, []);

  //code for voice processing start

  // Helper: call Google Input Tools API
  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);

    getData();
    setshouldShowDocVisitWithData(true);
    setshouldShowSampleData(true);

    DeviceInfo.getDeviceName().then(name => setDevice(name));

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

  const transliterate = async banglaText => {
    try {
      const res = await fetch(
        `https://inputtools.google.com/request?itc=bn-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&q=${encodeURIComponent(
          banglaText,
        )}`,
      );
      const data = await res.json();
      if (data[0] === 'SUCCESS') {
        return data[1][0][1][0]; // transliterated text
      }
    } catch (e) {
      console.error('Transliteration error:', e);
    }
    return banglaText; // fallback
  };

  // useEffect(() => {
  //   Voice.onSpeechResults = (event) => {
  //     if (event.value && event.value.length > 0) {
  //       setRemarks((prev) => prev + " " + event.value[0]);
  //     }
  //   };

  //   // Voice.onSpeechResults = (event) => {
  //   //   if (event.value && event.value.length > 0) {
  //   //     const bengaliText = event.value[0];
  //   //     const englishText = bengaliToEnglish(bengaliText);
  //   //     setRemarks(prev => prev + " " + englishText);
  //   //   }
  //   // };

  //   Voice.onSpeechEnd = () => {
  //     setIsListening(false);
  //   };

  //   return () => {
  //     Voice.destroy().then(Voice.removeAllListeners);
  //   };
  // }, []);

  // Voice processing
  useEffect(() => {
    Voice.onSpeechResults = async event => {
      if (event.value && event.value.length > 0) {
        const bengaliText = event.value[0]; // speech result in Bangla
        const englishText = await transliterate(bengaliText); // 🔹 API call
        setRemarks(prev => prev + ' ' + englishText);
      }
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('bn-IN'); // capture Bangla speech
      setIsListening(true);
    } catch (e) {
      console.error('Error starting voice', e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Error stopping voice', e);
    }
  };
  //end of code for voice processing

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavDCRScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

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

  // ========= CONTINUOUS RETRY (ANDROID ONLY) =========
  const retryPermissionLoop = () => {
    retryPermissionInterval.current = setInterval(async () => {
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (status) {
        clearInterval(retryPermissionInterval.current);
        getCurrentLocation();
        startLocationUpdates();
      } else {
        requestLocationPermission();
      }
    }, 6000);
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

  // ===============================
  // NEW PERMISSION FLOW (iOS + Android)
  // ===============================

  // const askLocationPermissionFirstTime = async () => {
  //   const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

  //   if (status === RESULTS.DENIED) {
  //     // Only DENIED will show popup again
  //     const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

  //     if (result === RESULTS.GRANTED) {
  //       getOneTimeLocation();
  //     } else if (result === RESULTS.BLOCKED) {
  //       showEnableSettingsAlert();
  //     }
  //   } else if (status === RESULTS.BLOCKED) {
  //     showEnableSettingsAlert();
  //   } else if (status === RESULTS.GRANTED) {
  //     getOneTimeLocation();
  //   }
  // };

  // const showEnableSettingsAlert = () => {
  //   Alert.alert(
  //     'Permission Required',
  //     'Please allow location permission from Settings.',
  //     [
  //       {text: 'Cancel', style: 'cancel'},
  //       {text: 'Open Settings', onPress: () => openSettings()},
  //     ],
  //   );
  // };

  // const retryPermission = async () => {
  //   const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

  //   if (status === RESULTS.DENIED) {
  //     askLocationPermissionFirstTime(); // Ask again
  //   }
  // };

  // // iOS-only permission logic
  // const handleIOSLocationPermission = async () => {
  //   const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

  //   if (status === RESULTS.DENIED) {
  //     // First time -> shows system popup
  //     return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
  //   }

  //   if (status === RESULTS.BLOCKED) {
  //     // User pressed "Don't Allow" earlier
  //     Alert.alert(
  //       'Location Access Required',
  //       'Please enable location services for this app in Settings.',
  //       [
  //         {text: 'Cancel', style: 'cancel'},
  //         {
  //           text: 'Open Settings',
  //           onPress: () => openSettings(),
  //         },
  //       ],
  //     );
  //     return RESULTS.BLOCKED;
  //   }

  //   return status;
  // };

  // const getOneTimeLocation = () => {
  //   setLocationStatus('Getting Location ...');
  //   Geolocation.getCurrentPosition(
  //     //Will give you the current location
  //     position => {
  //       setLocationStatus('You are Here');
  //       // const currentLongitude = JSON.stringify(position.coords.longitude);
  //       // //getting the Longitude from the location json
  //       // const currentLatitude = JSON.stringify(position.coords.latitude);

  //       const lat = position.coords.latitude;
  //       const long = position.coords.longitude;

  //       // Round to 6 decimal places for consistency
  //       const currentLatitude = lat.toFixed(6); // "22.507298"
  //       const currentLongitude = long.toFixed(6); // "88.336675"
  //       //getting the Latitude from the location json
  //       setCurrentLongitude(currentLongitude);
  //       //Setting state Longitude to re re-render the Longitude Text
  //       setCurrentLatitude(currentLatitude);
  //       //Setting state Latitude to re re-render the Longitude Text
  //       //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //     },
  //     error => {
  //       setLocationStatus(error.message);
  //     },
  //     //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  //     //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
  //     {timeout: 15000}, // 15 seconds timeout
  //   );
  // };

  // const handleEnabledPressed = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       var enableResult = await promptForEnableLocationIfNeeded();
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         Alert.alert(error.message);
  //       }
  //     }
  //   }
  // };

  // const handleCheckPressed = async () => {
  //   if (Platform.OS === 'android') {
  //     var checkEnabled = await isLocationEnabled();
  //     if (checkEnabled === false) {
  //       Alert.alert('GPS Not Active');
  //       BackHandler.exitApp();
  //       navigation.navigate('AppNavScreen');
  //     } else if (checkEnabled === true) {
  //       getMultipleTimeLocation();
  //     }
  //   } else {
  //     // iOS -> keep trying location, but do not show system popup
  //     const permission = await handleIOSLocationPermission();
  //     if (permission === RESULTS.GRANTED) {
  //       getMultipleTimeLocation();
  //     }
  //   }
  // };

  // const getMultipleTimeLocation = () => {
  //   setLocationStatus('Getting Location ...');
  //   Geolocation.getCurrentPosition(
  //     //Will give you the current location
  //     position => {
  //       setLocationStatus('You are Here');
  //       // const currentLongitude = JSON.stringify(position.coords.longitude);
  //       // //getting the Longitude from the location json
  //       // const currentLatitude = JSON.stringify(position.coords.latitude);
  //       //getting the Latitude from the location json

  //       const lat = position.coords.latitude;
  //       const long = position.coords.longitude;

  //       // Round to 6 decimal places for consistency
  //       const currentLatitude = lat.toFixed(6); // "22.507298"
  //       const currentLongitude = long.toFixed(6); // "88.336675"
  //       setCurrentLongitude(currentLongitude);
  //       //Setting state Longitude to re re-render the Longitude Text
  //       setCurrentLatitude(currentLatitude);
  //       //Setting state Latitude to re re-render the Longitude Text
  //       //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
  //     },
  //     error => {
  //       setLocationStatus(error.message);
  //     },
  //     //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
  //     {enableHighAccuracy: false, timeout: 10000, maximumAge: 1000},
  //     //{ timeout: 15000 } // 15 seconds timeout
  //   );
  // };

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
        } else if (useRemarks === '') {
          Alert.alert('Type Remarks');
        }
        // else if (sampleQtyData.length === 0) {
        //   Alert.alert('Type Sample');
        // }
        else {
          setshouldShowSampleData(false);
          setshouldProdStage(true);
          setshowData(false);
        }
      } else {
        if (docLabel === '') {
          Alert.alert('Select Doctor');
        } else if (usevisitWTData.length === 0) {
          Alert.alert('Select Visit With');
        } else if (sampleQtyData.length === 0) {
          Alert.alert('Select Sample & Qty');
        } else if (useRemarks === '') {
          Alert.alert('Type Remarks');
        } else {
          setshouldShowSampleData(false);
          setshouldProdStage(true);
          setshowData(false);
        }
      }
    }
  };
  const openPDF = async filePath => {
    const pdfUrl = url + filePath;
    // const pdfUrl = null; // try this for testing
    console.log(pdfUrl);

    if (!pdfUrl || pdfUrl.trim() === '') {
      Alert.alert('No PDF available', 'The PDF link is missing.');
      return;
    }

    Linking.openURL(pdfUrl).catch(err =>
      console.error('Failed to open PDF:', err),
    );
  };

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
          NetInfo.fetch().then(async state => {
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
                    setArea(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });

                // const vwturl =
                //   BASE_URL +
                //   'Employee/EmployeeUpwardManagerList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                const vwturl =
                  BASE_URL +
                  'Employee/MSRVisitwithList?Businessid=' +
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

              const url =
                BASE_URL +
                'Configuration/MobileGeofencing?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log('Geofencing URL:', url);
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

  const multiSelectVisitWith = async () => {
    let mvwt = useMvisitWTData;
    let mvwtList = mvwt.toString();
    console.log(mvwt);
    console.log(mvwtList);
    setMultipleIDEmployee(mvwtList);
    managerAreaList(mvwtList);

    // const docurl =
    //   BASE_URL +
    //   'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
    //   useBusinessID +
    //   '&Employees=' +
    //   mvwtList +
    //   '&IDArea=0';
    // let result = await fetch(docurl);
    // result = await result.json();
    // console.log(docurl);
    // setdoctorData(result);
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
        console.log('empLoyee', empLoyee);
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
                    //label: results.rows.item(i).AreaName,
                    label: results.rows.item(i).Name,
                  });
                }
                setMArea(temp);
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
      }
    }, []);
  };

  const areaWiseMDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
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
        console.log('returl', returl);
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
        console.log(returl);
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
    }, []);
  };

  // const calculateDistane = (apiLat, apiLong, docCode, docName) => {
  //   console.log(apiLat, apiLong);
  //   console.log(currentLatitude, currentLongitude);
  //   setCurrentLocation({
  //     Latitude: parseFloat(currentLatitude),
  //     Longitude: parseFloat(currentLongitude), // Convert longitude to number
  //   });
  //   const R = 6371; // Radius of the Earth in kilometers
  //   const dLat = deg2rad(apiLat - currentLatitude);
  //   const dLon = deg2rad(apiLong - currentLongitude);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(deg2rad(apiLat)) *
  //     Math.cos(deg2rad(currentLatitude)) *
  //     Math.sin(dLon / 2) *
  //     Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const d = R * c; // Distance in kilometers

  //   const distance = d * 1000;
  //   const roundedNumber = Math.round(distance);
  //   setDistance(distance);
  //   console.log(distance);
  //   if (distance >= useDoctorGeofencing) {
  //     // Alert.alert(
  //     //   'Distance Alert',
  //     //   `Distance exceeds ${useDoctorGeofencing} meters.\nYour distance: ${roundedNumber} meter\nDoc Code: ${docCode}\nDoc Name: ${docName}`,
  //     // );
  //     // console.log(useDoctorGeofencing);
  //     // console.log(roundedNumber);
  //     // console.log(docCode);
  //     // console.log(docName);
  //     setModalVisible(true);
  //     setDoctorLocation({
  //       latitude: parseFloat(apiLat), // Convert latitude to number
  //       longitude: parseFloat(apiLong), // Convert longitude to number
  //     });
  //     setSelectedProduct('');
  //   } else {
  //     // Alert.alert(
  //     //   'The distance between the two locations is within 100 meters.',
  //     // );
  //     setModalVisible(false);
  //   }
  // };

  //

  // UPDATED: robust, meter-based, tolerance-aware - by suman Jana

  const calculateDistane = (apiLat, apiLong, docCode, docName) => {
    // --- 0) Target guard: skip if API sent zero-like coordinates
    const lat2 = Number(apiLat);
    const lon2 = Number(apiLong);
    if (
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2) ||
      (lat2 === 0 && lon2 === 0)
    ) {
      console.log(
        `[GPS] Skip: target is zero-like target=(${apiLat}, ${apiLong}) (docCode=${
          docCode ?? '-'
        }, docName=${docName ?? '-'})`,
      );
      return;
    }

    // --- 1) Coerce current + radius (meters)
    const lat1 = Number(currentLatitude);
    const lon1 = Number(currentLongitude);
    const radius = Number(useDoctorGeofencing || 0); // e.g., 150

    // Validate current + radius
    if (![lat1, lon1, radius].every(Number.isFinite)) {
      console.warn('Invalid inputs for distance calc:', {lat1, lon1, radius});
      return;
    }

    // --- 2) Debug log current/target
    console.log(
      `[GPS] now=${new Date().toISOString()} ` +
        `current=(${lat1.toFixed(6)}, ${lon1.toFixed(6)}) ` +
        `target=(${lat2.toFixed(6)}, ${lon2.toFixed(6)}) ` +
        `acc=${
          Number.isFinite(gpsAccuracy) ? Math.round(gpsAccuracy) + 'm' : 'n/a'
        }`,
    );

    // --- 3) Haversine (meters)
    const toRad = d => (d * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    const metersRaw = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    const meters = Math.floor(metersRaw + 1e-6); // stabilize decimals like 150.076 -> 150
    setDistance(meters);
    setCurrentLocation({Latitude: lat1, Longitude: lon1}); // UI only

    // --- 4) Tolerance + HYSTERESIS (prevents in/out flapping near the edge)
    // Base cushion
    const BASE_EPS = 5; // meters
    // If you have GPS accuracy, adapt EPS = max(BASE, accuracy * 0.5)
    const epsFromAcc = Number.isFinite(gpsAccuracy)
      ? Math.round(gpsAccuracy * 0.5)
      : 0;
    const EPS = Math.max(BASE_EPS, epsFromAcc);

    // Hysteresis:
    // - If we were INSIDE, require meters > (radius + EPS) to flip OUTSIDE.
    // - If we were OUTSIDE, require meters < max(0, radius - EPS) to flip INSIDE.
    let inside = lastInsideRef.current;
    if (inside === null) {
      // Initialize state with a relaxed check so first reading doesn’t jitter
      inside = meters <= radius + EPS;
    } else if (inside === true) {
      if (meters > radius + EPS) inside = false;
    } else {
      if (meters < Math.max(0, radius - EPS)) inside = true;
    }
    lastInsideRef.current = inside;

    console.log(
      `dist=${meters}m, radius=${radius}m, EPS=${EPS}m, state=${
        inside ? 'INSIDE' : 'OUTSIDE'
      }`,
    );

    // --- 5) UI action
    if (!inside) {
      setModalVisible(true);
      setDoctorLocation({latitude: lat2, longitude: lon2});
      setSelectedProduct('');
    } else {
      setModalVisible(false);
    }
  };

  useEffect(() => {
    if (useGeofencing === 'YES' && selectedDoctorCoords && selectedDoctorMeta) {
      calculateDistane(
        selectedDoctorCoords.lat,
        selectedDoctorCoords.lon,
        selectedDoctorMeta.code,
        selectedDoctorMeta.name,
      );
    }
  }, [
    currentLatitude,
    currentLongitude,
    useGeofencing,
    selectedDoctorCoords,
    selectedDoctorMeta,
  ]);

  const onSelectDoctor = item => {
    setSelectedProduct(item.Name);
    setdocValue(item.IDDoctor);
    setdocLabel(item.Name);
    setClicked(false);

    const lat = Number(item?.Latitude);
    const lon = Number(item?.Longitude);
    const hasCoords =
      Number.isFinite(lat) && Number.isFinite(lon) && !(lat === 0 && lon === 0);

    setSelectedDoctorCoords(hasCoords ? {lat, lon} : null);
    setSelectedDoctorMeta({code: item.IDDoctor, name: item.Name});

    // Initial check (so the user sees feedback immediately)
    if (useGeofencing === 'YES' && hasCoords) {
      calculateDistane(lat, lon, item.IDDoctor, item.Name);
    }

    // Existing calls:
    doctorWiseProductListAPI(item.IDDoctor);
    doctorWiseAreaListAPI(item.IDDoctor);
    setDocCode(item.IDDoctor);
    setDocName(item.Name);
  };

  const fmt = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(6) : 'N/A';
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
    const newData = [...sampleQtyData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setsampleQtyData(newData); // Update state
  };
  const onDeleteGift = id => {
    console.log(id);
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
                  SfStatus.push(value.value);
                  SProdID.push(value.key);
                });
              }

              if (giftQtyData.length === 0) {
                GProdID = [];
                GfStatus = [];
              } else {
                giftQtyData.map(function (value) {
                  GfStatus.push(value.value);
                  GProdID.push(value.key);
                });
              }

              usedataStage.map(function (value) {
                //curstageID.push({IDStage: value.IDStage});
                curstageID.push(value.IDStage);
              });
              usedataStage.map(function (value) {
                //ProdID.push({IDProduct: value.IDProduct});
                ProdID.push(value.IDProduct);
              });

              usedataStage.map(function (valueMisc) {
                //fStatus.push({IDMisc: valueMisc.IDMisc});
                fStatus.push(valueMisc.IDMisc);
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

              if (sampleQtyData.length === 0) {
                SProdID = [];
                SfStatus = [];
              } else {
                sampleQtyData.map(function (value) {
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
              usedataStage.map(function (value) {
                //curstageID.push({ IDStage: value.IDStage });
                curstageID.push(value.IDStage);
              });
              usedataStage.map(function (value) {
                //ProdID.push({ IDProduct: value.IDProduct });
                ProdID.push(value.IDProduct);
              });

              usedataStage.map(function (valueMisc) {
                //fStatus.push({ IDMisc: valueMisc.IDMisc });
                fStatus.push(valueMisc.IDMisc);
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

        usedataStage.map(function (value) {
          curstageID.push({IDStage: value.IDStage});
        });
        usedataStage.map(function (value) {
          ProdID.push({IDProduct: value.IDProduct});
        });

        usedataStage.map(function (valueMisc) {
          fStatus.push({IDMisc: valueMisc.IDMisc});
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
        let result = await fetch(BASE_URL + 'manager/DCR/Mobile/SaveNew', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        });
        result = await result.json();
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
          Alert.alert(result.result, `${result.result}`);
        }
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

        usedataStage.map(function (value) {
          curstageID.push({IDStage: value.IDStage});
        });
        usedataStage.map(function (value) {
          ProdID.push({IDProduct: value.IDProduct});
        });

        usedataStage.map(function (valueMisc) {
          fStatus.push({IDMisc: valueMisc.IDMisc});
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
          //Alert.alert('Else : ' + result.result);
          //Alert.alert('Error Alert', `${result.result}`);
          Alert.alert(result.result, `${result.result}`);
        }
      }
    }
  };

  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
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

  const renderProductItem = ({item}) => {
    return (
      <View style={[style.cardContainer]}>
        {/* Product Name */}
        <Text style={style.productName}>{item.ProductName}</Text>

        {/* Stage Row */}
        <View style={style.row}>
          {/* Static Stage Label */}
          <View style={style.stageBox}>
            <Text style={style.stageText}>{item.StageName}</Text>
          </View>

          {/* Dropdown */}
          <Dropdown
            style={style.dropdownStageNew}
            placeholderStyle={style.placeholderStyleStage}
            selectedTextStyle={style.selectedTextStyleStage}
            data={fStageData}
            search
            maxHeight={250}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? item.StageName : '...'}
            value={selectedStages[item.IDProduct]?.IDMisc ?? null}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={e => {
              const updated = {
                ...selectedStages,
                [item.IDProduct]: {
                  IDMisc: e.value,
                  IDStage: item.IDStage,
                },
              };

              setSelectedStages(updated);

              const formatted = Object.entries(updated).map(
                ([IDProduct, values]) => ({
                  IDProduct: parseInt(IDProduct, 10),
                  IDMisc: values.IDMisc,
                  IDStage: values.IDStage,
                }),
              );

              setdataStage(formatted);
              setIsFocus(false);
            }}
          />

          {/* PDF Icon */}
          {item.FilePath ? (
            <TouchableOpacity
              onPress={() => openPDF(item.FilePath)}
              style={style.pdfButton}>
              <FontAwesome name="file-pdf-o" size={28} color="red" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAwareLayout>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
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
        <View style={{flexDirection: 'row', alignItems: 'center', padding: 10}}>
          {/* Big Location Icon */}
          <Ionicons
            name="location-outline"
            size={40}
            color="#005696"
            style={{marginRight: 12}}
          />

          {/* Latitude & Longitude */}
          <View>
            <Text style={{fontSize: 16, paddingVertical: 2}}>
              Lat : {currentLatitude}
            </Text>
            <Text style={{fontSize: 16, paddingVertical: 2}}>
              Long : {currentLongitude}
            </Text>
          </View>
        </View>
        {showData ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#005696',
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
              <AntDesign name="arrowright" size={20} color="white" />
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
                  save="key"
                  onSelect={() => multiSelectVisitWith()}
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
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
                  value={selectedMArea}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setSelectedMArea(item.value);
                    setMAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseMDoctorList(item.value);
                  }}
                />
              </View>
              <View style={{marginBottom: 2, paddingBottom: 2}}>
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
                            // setSelectedProduct(item.Name);
                            // setdocValue(item.IDDoctor);
                            // setdocLabel(item.Name);
                            // setClicked(false);
                            // if (
                            //   useGeofencing === 'YES' &&
                            //   item.Latitude !== '0.0000000000' &&
                            //   item.Longitude !== '0.0000000000'
                            // ) {
                            //   calculateDistane(
                            //     item.Latitude,
                            //     item.Longitude,
                            //     item.IDDoctor,
                            //     item.Name,
                            //   );
                            //   //Alert.alert('Hi');
                            // }
                            // console.warn(item.IDDoctor);
                            // doctorWiseProductListAPI(item.IDDoctor);
                            // doctorWiseAreaListAPI(item.IDDoctor);
                            // setDocCode(item.IDDoctor);
                            // setDocName(item.Name);
                            onSelectDoctor(item);
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
              <View
                style={{
                  marginBottom: 5,
                  paddingBottom: 5,
                  flexDirection: 'row', // ⬅️ row layout
                  alignItems: 'center',
                }}>
                {/* Remarks Input */}
                <TextInput
                  //mode="outlined"
                  //autoCapitalize="none"
                  autoCorrect={false}
                  style={style.remarkstextInput}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                  multiline={true}
                  numberOfLines={3}
                />

                {/* Mic Icon */}
                <TouchableOpacity
                  style={style.micButton}
                  onPressIn={startListening} // ⬅️ when finger goes down
                  onPressOut={stopListening} // ⬅️ when finger is lifted
                >
                  <Icon
                    name={isListening ? 'mic' : 'mic-off'}
                    size={28}
                    color={isListening ? 'red' : '#4285F4'}
                  />
                </TouchableOpacity>
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
                  value={selectedMArea}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    // setdocValue(item.value);
                    // setdocLabel(item.label);
                    setSelectedMArea(item.value);
                    setAreaLabel(item.label);
                    setIsFocus(false);
                    areaWiseDoctorList(item.value);
                    // doctorWiseProductListAPI(item.value);
                    //setDocCode(item.value);
                  }}
                />
              </View>

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
                          // setSelectedProduct(item.Name);
                          // setdocValue(item.IDDoctor);
                          // setdocLabel(item.Name);
                          // setClicked(false);
                          // if (
                          //   useGeofencing === 'YES' &&
                          //   item.Latitude !== '0.0000000000' &&
                          //   item.Longitude !== '0.0000000000'
                          // ) {
                          //   calculateDistane(
                          //     item.Latitude,
                          //     item.Longitude,
                          //     item.IDDoctor,
                          //     item.Name,
                          //   );
                          //   //Alert.alert('Hi');
                          // }
                          // console.warn(item.IDDoctor);
                          // doctorWiseProductListAPI(item.IDDoctor);
                          // doctorWiseAreaListAPI(item.IDDoctor);
                          // setDocCode(item.IDDoctor);
                          // setDocName(item.Name);
                          onSelectDoctor(item);
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
              <View
                style={{
                  marginBottom: 5,
                  paddingBottom: 5,
                  flexDirection: 'row', // ⬅️ row layout
                  alignItems: 'center',
                }}>
                {/* Remarks Input */}
                <TextInput
                  // mode="outlined"
                  // autoCapitalize="none"
                  autoCorrect={false}
                  style={style.remarkstextInput}
                  placeholder="Remarks"
                  placeholderTextColor="#555"
                  value={useRemarks}
                  onChangeText={text => setRemarks(text)}
                  multiline={true}
                  numberOfLines={3}
                />
                {/* Mic Icon */}
                <TouchableOpacity
                  style={style.micButton}
                  onPressIn={startListening} // ⬅️ when finger goes down
                  onPressOut={stopListening} // ⬅️ when finger is lifted
                >
                  <Icon
                    name={isListening ? 'mic' : 'mic-off'}
                    size={28}
                    color={isListening ? 'red' : '#4285F4'}
                  />
                </TouchableOpacity>
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
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                      {
                        width: '20%',
                        alignItems: 'center',
                        marginRight: 5,
                        height: '86%',
                      },
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setQty(text)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#005696',
                      width: '25%',
                      height: '86%',
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
                        marginLeft: 20,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#ffffff',
                      }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* <FlatList
                  data={sampleQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
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
                /> */}
                {sampleQtyData && sampleQtyData.length > 0 ? (
                  <View style={{marginTop: 10, marginHorizontal: 8}}>
                    {/* 🔹 Table Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#005696',
                        borderWidth: 1,
                        borderColor: '#bdc3c7',
                      }}>
                      {/* Name Header */}
                      <View
                        style={{
                          width: '55%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#bdc3c7',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Name
                        </Text>
                      </View>

                      {/* Qty Header */}
                      <View
                        style={{
                          width: '30%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#bdc3c7',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Qty
                        </Text>
                      </View>

                      {/* Action Header */}
                      <View
                        style={{
                          width: '15%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Action
                        </Text>
                      </View>
                    </View>

                    {/* 🔹 Table Rows */}
                    <FlatList
                      data={sampleQtyData}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item, index}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor:
                                index % 2 === 0 ? '#ecf0f1' : '#ffffff',
                              borderWidth: 1,
                              borderColor: '#bdc3c7',
                              borderTopWidth: 0,
                            }}>
                            {/* Name Column */}
                            <View
                              style={{
                                width: '55%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                                paddingHorizontal: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  flexShrink: 1,
                                }}>
                                {item.label}
                              </Text>
                            </View>

                            {/* Qty Column */}
                            <View
                              style={{
                                width: '30%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                }}>
                                {item.key}
                              </Text>
                            </View>

                            {/* Delete Column */}
                            <View
                              style={{
                                width: '15%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 8,
                              }}>
                              <AntDesign
                                name="delete"
                                size={22}
                                color="red"
                                onPress={() => onDeleteSample(index)}
                              />
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      )}
                    />
                  </View>
                ) : null}
              </View>
            )}
            {gamesTab == 2 && (
              <View style={{margin: 10}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
                    mode="outlined"
                    autoCapitalize="none"
                    inputMode="numeric"
                    autoCorrect={false}
                    value={useGQty}
                    style={[
                      style.textInput,
                      {
                        width: '20%',
                        alignItems: 'center',
                        marginRight: 5,
                        height: '86%',
                      },
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setGQty(text)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#005696',
                      width: '25%',
                      height: '86%',
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
                        marginLeft: 20,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#ffffff',
                      }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* <FlatList
                  data={giftQtyData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
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
                /> */}

                {giftQtyData && giftQtyData.length > 0 ? (
                  <View style={{marginTop: 10, marginHorizontal: 8}}>
                    {/* 🔹 Table Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#005696',
                        borderWidth: 1,
                        borderColor: '#dee2e6ff',
                      }}>
                      {/* Name Column */}
                      <View
                        style={{
                          width: '55%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#e6e8e9ff',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Name
                        </Text>
                      </View>

                      {/* Qty Column */}
                      <View
                        style={{
                          width: '30%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#e6e8e9ff',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Qty
                        </Text>
                      </View>

                      {/* Action Column */}
                      <View
                        style={{
                          width: '15%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Action
                        </Text>
                      </View>
                    </View>

                    {/* 🔹 Table Rows */}
                    <FlatList
                      data={giftQtyData}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item, index}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: '#ffffff',
                              borderWidth: 1,
                              borderColor: '#bdc3c7',
                              borderTopWidth: 0,
                            }}>
                            {/* Name Column */}
                            <View
                              style={{
                                width: '55%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                                paddingHorizontal: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  flexShrink: 1,
                                }}>
                                {item.label}
                              </Text>
                            </View>

                            {/* Qty Column */}
                            <View
                              style={{
                                width: '30%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                              }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                }}>
                                {item.key}
                              </Text>
                            </View>

                            {/* Delete Action */}
                            <View
                              style={{
                                width: '15%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 6,
                              }}>
                              <AntDesign
                                name="delete"
                                size={24}
                                color="red"
                                onPress={() => onDeleteGift(index)}
                              />
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      )}
                    />
                  </View>
                ) : null}
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
                      placeholder={!isFocus ? 'Campaign' : '...'}
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
                      style={[
                        style.textInput,
                        {width: '40%', alignItems: 'center', marginRight: 5},
                      ]}
                      placeholder="Remarks"
                      placeholderTextColor="#555"
                      onChangeText={text => setCRemarks(text)}
                      multiline={true}
                      //numberOfLines={3}
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#005696',
                        width: '21%',
                        height: '73%',
                        margin: 5,
                        borderRadius: 5,
                        flexDirection: 'row',
                        marginTop: 10,
                      }}
                      onPress={() => addCampaign()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 16,
                          marginLeft: 10,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#ffffff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* <FlatList
                  data={campaignData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
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
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                /> */}
                {campaignData && campaignData.length > 0 ? (
                  <View style={{marginTop: 10, marginHorizontal: 8}}>
                    {/* 🔹 Table Header */}
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#005696',
                        borderWidth: 1,
                        borderColor: '#bdc3c7',
                      }}>
                      <View
                        style={{
                          width: '35%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#bdc3c7',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Campaign Name
                        </Text>
                      </View>

                      <View
                        style={{
                          width: '35%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#bdc3c7',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Product Name
                        </Text>
                      </View>

                      <View
                        style={{
                          width: '20%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRightWidth: 1,
                          borderColor: '#bdc3c7',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Remarks
                        </Text>
                      </View>

                      <View
                        style={{
                          width: '10%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 8,
                        }}>
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: 'Lato-Bold',
                            color: '#ffffff',
                          }}>
                          Action
                        </Text>
                      </View>
                    </View>

                    {/* 🔹 Table Rows */}
                    <FlatList
                      data={campaignData}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({item, index}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor:
                                index % 2 === 0 ? '#ecf0f1' : '#ffffff',
                              borderWidth: 1,
                              borderColor: '#bdc3c7',
                              borderTopWidth: 0,
                            }}>
                            <View
                              style={{
                                width: '35%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                                paddingHorizontal: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  textAlign: 'center',
                                }}>
                                {item.campaignName}
                              </Text>
                            </View>

                            <View
                              style={{
                                width: '35%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                                paddingHorizontal: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  textAlign: 'center',
                                }}>
                                {item.productName}
                              </Text>
                            </View>

                            <View
                              style={{
                                width: '20%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRightWidth: 1,
                                borderColor: '#bdc3c7',
                                paddingVertical: 6,
                                paddingHorizontal: 8,
                              }}>
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontFamily: 'Lato-Regular',
                                  color: '#000',
                                  textAlign: 'center',
                                }}>
                                {item.key}
                              </Text>
                            </View>

                            <View
                              style={{
                                width: '10%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingVertical: 6,
                              }}>
                              <AntDesign
                                name="delete"
                                size={22}
                                color="red"
                                onPress={() => onDeleteCampaign(index)}
                              />
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      )}
                    />
                  </View>
                ) : null}
              </View>
            )}
          </SafeAreaView>
        ) : null}

        {shouldProdStage ? (
          <SafeAreaView style={style.container}>
            <View style={style.btnTab}>
              <Text style={style.textTab}>Product Stage</Text>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <FlatList
                data={dataProduct}
                keyExtractor={item => item.IDProduct?.toString()}
                renderItem={renderProductItem}
                ListEmptyComponent={() => (
                  <View style={{alignItems: 'center', marginTop: 50}}>
                    <Text style={{fontSize: 16, color: 'gray'}}>
                      No Data Found
                    </Text>
                  </View>
                )}
                contentContainerStyle={{paddingBottom: 50}}
              />
            </TouchableWithoutFeedback>
            <CustomButton label={'End DCR'} onPress={() => save()} />
          </SafeAreaView>
        ) : null}
      </View>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={style.modalContainer}>
          <View style={style.modalContent}>
            <Text style={style.modalTitle}>Distance Alert</Text>
            <Text style={style.modalText}>
              Distance exceeds{' '}
              {typeof useDoctorGeofencing === 'number'
                ? useDoctorGeofencing
                : 'N/A'}{' '}
              meters.
            </Text>

            <Text style={style.distanceText}>
              Distance: {distance != null ? distance : '0.00'} meters
            </Text>

            <Text style={style.textLabel}>Doctor Code: {docCode}</Text>
            <Text style={style.textLabel}>Doctor Name: {docName}</Text>

            {/* NEW: show current device location */}
            <Text style={[style.textLabel, {color: 'blue'}]}>
              Your Location: Latitude: {fmt(currentLatitude)}, Longitude:{' '}
              {fmt(currentLongitude)}
            </Text>

            {doctorLocation &&
              typeof doctorLocation.latitude === 'number' &&
              typeof doctorLocation.longitude === 'number' && (
                <>
                  <Text style={[style.textLabel, {color: 'red'}]}>
                    Doctor Location: Latitude: {doctorLocation.latitude},
                    Longitude: {doctorLocation.longitude}
                  </Text>

                  <MapView
                    provider={PROVIDER_GOOGLE}
                    style={style.mapView}
                    region={{
                      latitude: doctorLocation.latitude,
                      longitude: doctorLocation.longitude,
                      latitudeDelta: 0.015,
                      longitudeDelta: 0.0121,
                    }}
                    showsUserLocation={true}
                    followsUserLocation={true}>
                    {/* Doctor marker */}
                    <Marker
                      coordinate={{
                        latitude: doctorLocation.latitude,
                        longitude: doctorLocation.longitude,
                      }}
                      title="Doctor's Location"
                    />

                    {/* NEW: current user marker (only if valid) */}
                    {Number.isFinite(Number(currentLatitude)) &&
                      Number.isFinite(Number(currentLongitude)) && (
                        <Marker
                          coordinate={{
                            latitude: Number(currentLatitude),
                            longitude: Number(currentLongitude),
                          }}
                          title="Your Location"
                          pinColor="blue"
                        />
                      )}

                    {/* OPTIONAL: draw geofence circle */}
                    {Number.isFinite(Number(useDoctorGeofencing)) &&
                      Number(useDoctorGeofencing) > 0 && (
                        <Circle
                          center={{
                            latitude: doctorLocation.latitude,
                            longitude: doctorLocation.longitude,
                          }}
                          radius={Number(useDoctorGeofencing)}
                          strokeWidth={1}
                          strokeColor="rgba(22,125,128,0.9)"
                          fillColor="rgba(22,125,128,0.2)"
                        />
                      )}
                  </MapView>
                </>
              )}
          </View>

          <View style={style.closeButtonContainer}>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAwareLayout>
  );
};

export default DCRDoctorNew;

const style = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#005696',
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
    borderColor: '#a9a9aaff', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
  remarkstextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },

  micButton: {
    marginLeft: 8,
    marginTop: 5,
  },

  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    padding: 15,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12, // Rounded corners
    justifyContent: 'space-between',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 5,
    //textAlign: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'left',
    color: 'red',
  },
  textLabel: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'Left',
  },
  mapView: {
    width: '100%',
    height: 280, // Adjusted height for the map to make it bigger
    marginVertical: 20,
    borderRadius: 10,
  },
  closeButtonContainer: {
    marginTop: 'auto', // Push the button to the bottom
    marginBottom: 10, // Space from the bottom
    width: '90%',
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  cardContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageBox: {
    flex: 1,
    height: 50,
    borderWidth: 0.7,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 6,
    backgroundColor: '#fff',
  },

  stageText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownStageNew: {
    flex: 1,
    height: 50,
    borderWidth: 0.7,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginLeft: 6,
    marginRight: 6,
  },
  placeholderStyleStage: {
    fontSize: 14,
    color: '#666',
  },
  selectedTextStyleStage: {
    fontSize: 14,
    fontWeight: '600',
  },
  pdfButton: {
    padding: 6,
  },
});
