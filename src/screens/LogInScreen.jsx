import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  PermissionsAndroid,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CRMImg from '../images/ieCRM Logo 1.svg';
import ProgressDialog from '../components/custom/ProgressDialog';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '@env';
import { add } from 'date-fns';

const { width, height } = Dimensions.get('window');

const LogInScreen = ({ navigation }) => {
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const dash_url = BASE_URL + 'Login/ValidateLogin';
  const [device, setDevice] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const [uName, setUname] = useState('');
  const [uPwd, setPwd] = useState('');
  const [showData, setshowData] = useState(true);
  const [showNData, setshowNData] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loginLocation, setLoginLocation] = useState({
    lat: 0,
    lng: 0,
    address: '',
  });

  const [placeName, setPlaceName] = useState('');

  const togglePasswordVisibility = () => setSecureText(!secureText);
  //const toggleCheckbox = () => setChecked(!checked);

  /* ---------------- GPS ENABLE CHECK ---------------- */
  const ensureGpsEnabled = async () => {
    if (Platform.OS === 'android') {
      const enabled = await isLocationEnabled();
      if (!enabled) {
        Alert.alert('GPS Not Active');
        await promptForEnableLocationIfNeeded();
      }
    }
  };

  /* ---------------- CACHED LOCATION (FAST) ---------------- */
  const fetchLocationForLogin = () =>
    new Promise(resolve => {
      Geolocation.getCurrentPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          console.log('CACHED LOCATION USED:', lat, lng);

          let address = '';
          try {
            const geo = await Geocoder.from(lat, lng);
            if (geo.results?.length) {
              address = geo.results[0].formatted_address;
            }
          } catch { }

          const loc = { lat, lng, address };
          setLoginLocation(loc);

          resolve(loc);
        },
        err => {
          console.log('GPS FAILED, USING 0,0', err);
          resolve({ lat: 0, lng: 0, address: '' });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 300000,
          timeout: 5000,
        },
      );
    });

  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);
    //console.log('Device Name:', device);
    // requestNotificationPermission();
    // getFcmToken();
    getData();
  }, []);

  // const requestNotificationPermission = async () => {
  //   if (Platform.OS === 'android') {
  //     if (Platform.Version >= 33) {
  //       try {
  //         const hasPermission = await PermissionsAndroid.check(
  //           PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //         );
  //         if (!hasPermission) {
  //           const result = await PermissionsAndroid.request(
  //             PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //             {
  //               title: 'Notification Permission',
  //               message: 'This app wants to send you notifications',
  //               buttonNeutral: 'Ask Me Later',
  //               buttonNegative: 'Cancel',
  //               buttonPositive: 'OK',
  //             },
  //           );
  //           if (result === PermissionsAndroid.RESULTS.GRANTED) {
  //             console.log('Permission granted');
  //           } else {
  //             Alert.alert('Notification permission denied');
  //           }
  //         }
  //       } catch (err) {
  //         console.warn('Permission request error:', err);
  //       }
  //     }
  //   }
  // };

  // const getFcmToken = async () => {
  //   try {
  //     // Register the device (important for iOS)
  //     await messaging().registerDeviceForRemoteMessages();

  //     const token = await messaging().getToken();
  //     console.log('FCM Token:', token);

  //     //  Save token to your backend or SQLite
  //     // saveTokenToDatabase(token); // Your own implementation
  //     setFcmToken(token);
  //   } catch (error) {
  //     console.error('Failed to get FCM token:', error);
  //   }
  // };
  // const saveTokenToDatabase = async (fcmToken, IDEmployee) => {
  //   try {
  //     const body = {
  //       Businessid: data.businessID,
  //       IDEmployee: IDEmployee,
  //       Token: fcmToken,
  //       EntryUser: data.emailID,
  //       EntryDevice: `Mobile- ${device}`,
  //     };

  //     console.log('Saving token to database:', body);

  //     const response = await fetch(`${BASE_URL}Authentication/TokenSave`, {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(body),
  //     });

  //     const result = await response.json();

  //     if (result.result === '') {
  //       console.log('Token saved successfully.');
  //     } else {
  //       console.warn('Token save failed:', result.result);
  //     }
  //   } catch (error) {
  //     console.error('Error saving token:', error);
  //   }
  // };

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          const parsedData = JSON.parse(value); // convert JSON string to object
          navigation.navigate('AppNavDash');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  // const login = () => {
  //   NetInfo.fetch().then(state => {
  //     if (state.isConnected) {
  //       //Alert.alert('Online');
  //       setLoading(true);
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000);
  //       submit();
  //     } else {
  //       Alert.alert('Please Connect Internet');
  //       setLoading(true);
  //       setTimeout(() => {
  //         setLoading(false);
  //       }, 5000);
  //     }
  //   }, []);
  // };

  const login = () => {
    NetInfo.fetch().then(async state => {
      if (!state.isConnected) {
        Alert.alert('Please Connect Internet');
        return;
      }

      setLoading(true);

      try {
        const loc = await fetchLocationForLogin();
        console.log('LOGIN LOCATION READY:', loc);

        submit(loc); // 🔑 PASS LOCATION
      } catch (e) {
        setLoading(false);
        Alert.alert('Unable to fetch location');
      }
    });
  };

  const submit = async loc => {
    console.log('Submitting login for:', uName);

    if (uName === '') {
      Alert.alert('User Name is empty');
      setLoading(false);
      return;
    }

    if (uPwd === '') {
      Alert.alert('Password is empty');
      setLoading(false);
      return;
    }

    const data_api = {
      UserName: uName,
      Password: uPwd,
      DeviceID: `Mobile- ${device}`,
      MobileLat: loc?.lat?.toString() || '0',
      MobileLong: loc?.lng?.toString() || '0',
      MobileLocation: loc?.address || '',
    };

    console.log('LOGIN PAYLOAD:', data_api);

    try {
      let response = await fetch(dash_url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_api),
      });

      let result = await response.json();
      //console.log('LOGIN RESPONSE:', result);

      if (result?.data?.Result === 'Success') {
        const {
          IDUser,
          UserFullName,
          UserName,
          UserType,
          UserGender,
          UserEmail,
          UserMobile,
          IDCompany,
          CompanyCode,
          CompanyName,
          CompanyAddress,
          CompanyMobile,
          CompanyEmail,
          CompanyHexKey,
          LoginDateTime,
        } = result.data;

        const userinfo = {
          IDUser,
          UserFullName,
          UserName,
          UserType,
          UserGender,
          UserEmail,
          UserMobile,
          IDCompany,
          CompanyCode,
          CompanyName,
          CompanyAddress,
          CompanyMobile,
          CompanyEmail,
          CompanyHexKey,
          LoginDateTime,
        };

        await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
        console.log('USER SAVED:', userinfo);

        setLoading(false);
        navigation.replace('AppNavDash'); // prevents back to login
      }
      else if (result?.data?.Result === 'Active') {
        setLoading(false);
        Alert.alert('User Already Logged In from Another Device !!');
      }
      else {
        setLoading(false);
        Alert.alert('Either username or password incorrect!!');
      }
    } catch (error) {
      console.log('LOGIN ERROR:', error);
      setLoading(false);
      Alert.alert('Login failed. Please try again.');
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 1.4, // shrink a bit
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // back to normal
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const checkUserExist = async () => {
    try {
      const url = BASE_URL + 'Login/Validate/Account/Name?UserName=' + uName;
      console.log('CHECK USER :', url);
      const response = await fetch(url);
      const json = await response.json();


      console.log(json);

      if (json?.data?.Result === 'SUCCESS') {
        //setUserName(json.data.UserName); // <-- Set to TextInput
        setshowData(false);
        setshowNData(true);
      } else {
        Alert.alert('Invalid user!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#005696' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <StatusBar barStyle="light-content" backgroundColor="#005696" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginTop: height * 0.05 }}>
          <CRMImg height={183} width={154} />
          <Text style={styles.versionText}>Version 0.1</Text>
        </View>

        {/* Login Box */}
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.brandViewTextMain}>User Login</Text>
            {showData ? (
              <View>
                <View style={styles.inputRow}>
                  <MaterialIcons name="home" size={24} color="#555" />
                  <TextInput
                    style={styles.input}
                    placeholder="User Name"
                    value={uName}
                    onChangeText={text => setUname(text)}
                    autoCapitalize="none"
                  />
                </View>
                <TouchableWithoutFeedback
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={checkUserExist}>
                  <Animated.View
                    style={[
                      styles.loginButton,
                      { transform: [{ scale: scaleValue }] },
                    ]}>
                    <Text style={styles.loginText}>Next</Text>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}
            {/* Business ID */}
            {showNData ? (
              <View>
                {/* Email */}
                <View style={styles.inputRow}>
                  <MaterialIcons name="home" size={22} color="#555" />
                  <TextInput
                    placeholder="User Name"
                    value={uName}
                    editable={false}
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                {/* Password */}
                <View style={styles.inputRow}>
                  <Entypo name="key" size={22} color="#555" />
                  <TextInput
                    placeholder="Password"
                    value={uPwd}
                    onChangeText={text => setPwd(text)}
                    style={styles.input}
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Ionicons
                      name={secureText ? 'eye-off' : 'eye'}
                      size={22}
                      color="#555"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableWithoutFeedback
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={login}>
                  <Animated.View
                    style={[
                      styles.loginButton,
                      { transform: [{ scale: scaleValue }] },
                    ]}>
                    <Text style={styles.loginText}>Login</Text>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}

            {/* Footer */}
            {/* <Text style={styles.footerText}>
          By login you agree to the{' '}
          <Text style={styles.link}>Terms & Conditions</Text> and Privacy
          policy.{'\n'}© {currentYear} ie.CRM. All rights reserved.
        </Text> */}
          </View>
        </View>
        <ProgressDialog visible={loading} message="Please Wait..." />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LogInScreen;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f7fdfd',
    marginHorizontal: width * 0.06,
    marginTop: height * 0.03,
    padding: width * 0.05,
    paddingBottom: 30,
    borderRadius: 18,

    // iOS Shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    // Android elevation
    elevation: 7,
  },

  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 12,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },

  loginButton: {
    backgroundColor: '#005696',
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.7,
    alignSelf: 'center',
    marginTop: 10,
  },

  loginText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  versionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
  },

  brandViewTextMain: {
    color: '#786c77',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  checked: {
    backgroundColor: '#005696',
  },

  footerText: {
    marginTop: 18,
    fontSize: 12,
    textAlign: 'center',
    color: '#ffffff',
    paddingHorizontal: 20,
    lineHeight: 18,
  },

  link: {
    textDecorationLine: 'underline',
    color: '#ffffff',
  },
});
