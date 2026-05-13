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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import CRMImg from '../images/ieCRM Logo 1.svg';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KeyboardAwareLogin from '../components/custom/KeyboardAwareLogin';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Icon from react-native-vector-icons
import Feather from 'react-native-vector-icons/Feather';
//import PushNotification from 'react-native-push-notification';
//import { showLocalNotification } from './NotificationService';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

const { width, height } = Dimensions.get('window');
const LogIn = ({ navigation }) => {
  const initialvalues = {
    //businessID: 'PHARMA-CITY-730',
    businessID: '',
    emailID: '',
    pwdID: '',
  };
  const [data, setData] = useState(initialvalues);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');
  const dash_url = BASE_URL + 'login/validlogin';
  const [device, setDevice] = useState('');
  const [checked, setChecked] = useState(false);
  const toggleCheckbox = () => {
    setChecked(prevState => !prevState);  // Toggle the checked state
  };

  const currentYear = new Date().getFullYear()
  const scaleValue = useRef(new Animated.Value(1)).current;

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


  const handleOnchange = (text, input) => {
    setData(prevState => ({ ...prevState, [input]: text }));
  };

  const togglePasswordVisibility = () => {
    setSecureText(!secureText);
  };

  useEffect(() => {
    // code by suman jana 07/11/2025
    DeviceInfo.getDeviceName().then(setDevice);
    requestNotificationPermission();
    getFcmToken();
    // end code by suman jana 07/11/2025
    //console.log('dash_url', dash_url);
    getData();
  }, []);


  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
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
              }
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

  const getFcmToken = async () => {
    try {
      // Register the device (important for iOS)
      await messaging().registerDeviceForRemoteMessages();

      const token = await messaging().getToken();
      console.log('FCM Token:', token);

      //  Save token to your backend or SQLite
      // saveTokenToDatabase(token); // Your own implementation
      setFcmToken(token);
    } catch (error) {
      console.error('Failed to get FCM token:', error);
    }
  };
  const saveTokenToDatabase = async (fcmToken, IDEmployee) => {
    try {
      const body = {
        Businessid: data.businessID,
        IDEmployee: IDEmployee,
        Token: fcmToken,
        EntryUser: data.emailID,
        EntryDevice: `Mobile- ${device}`,
      };

      console.log('Saving token to database:', body);

      const response = await fetch(
        `${BASE_URL}Authentication/TokenSave`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();

      if (result.result === '') {
        console.log('Token saved successfully.');
      } else {
        console.warn('Token save failed:', result.result);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          //navigation.navigate(DashBoard);
          //navigation.navigate('AppNavScreen');
          const parsedData = JSON.parse(value); // convert JSON string to object
          const businessID = parsedData.BusinessID?.trim(); // safely access BusinessID and trim whitespace
          console.log('Business ID:', businessID);

          navigation.navigate('AppNavScreen');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const login = () => {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        //Alert.alert('Online');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
        submit(dash_url);
      } else {
        Alert.alert('Please Connect Internet');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      }
    }, []);
  };

  const submit = async () => {
    let checkEmail = '[a-zA-Z0-9._-]+@[a-z]+.+[a-z]+';
    var response,
      IDEmployee,
      Empname,
      Division,
      IDDivision,
      IDDesignation,
      Empemail,
      Designation,
      Empno,
      HQ,
      IDHQ,
      Manager,
      ManagerAccess,
      TrackingTime,
      Message,
      MobileAccess,
      SecurityKey,
      FrameFilePath,
      ProfilePicPath,
      AdminAccess,
      System,
      ManagerToken;
    console.log(data);
    //setData(initialvalues);
    if (data.businessID === '') {
      //console.warn('Business ID is empty');
      Alert.alert('Business ID is empty');
    } else if (data.emailID === '') {
      Alert.alert('Email is empty');
    } else if (data.pwdID === '') {
      Alert.alert('Password is empty');
    } else if (!data.emailID.match(checkEmail)) {
      Alert.alert('Invalid Email!');
    } else {
      const data_api = {
        businessid: data.businessID,
        email: data.emailID,
        password: data.pwdID,
      };
      console.log(data_api);

      let result = await fetch(dash_url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_api),
      });

      result = await result.json();
      console.log(result);

      //Fetch data from API & display the result
      response = result.Success;
      IDEmployee = result.IDEmployee;
      Empname = result.Empname;
      Division = result.Division;
      IDDivision = result.IDDivision;
      IDDesignation = result.IDDesignation;
      Empemail = result.Empemail;
      Designation = result.Designation;
      Empno = result.Empno;
      HQ = result.HQ;
      IDHQ = result.IDHQ;
      Manager = result.Manager;
      System = result.System;
      Message = result.Message;
      MobileAccess = result.MobileAccess;
      ManagerAccess = result.ManagerAccess;
      TrackingTime = result.TrackingTime;
      SecurityKey = result.SecurityKey;
      FrameFilePath = result.FrameFilePath;
      ProfilePicPath = result.ProfilePicPath;
      AdminAccess = result.AdminAccess;
      ManagerToken = result.Token; 

      if (response === false) {
        //Alert.alert('Either business id or email or password incorrect!!');
        Alert.alert(Message);
      } else if (Message === 'Wrong User credential') {
        Alert.alert(Message);
      } else {
        var BusinessID = data.businessID;
        //AsyncStorage for multiple item start
        try {
          var userinfo = {
            IDEmployee,
            Empname,
            Division,
            IDDivision,
            IDDesignation,
            Empemail,
            Designation,
            Empno,
            HQ,
            IDHQ,
            Manager,
            System,
            response,
            BusinessID,
            MobileAccess,
            ManagerAccess,
            TrackingTime,
            SecurityKey,
            FrameFilePath,
            ProfilePicPath,
            AdminAccess,
            ManagerToken,
            Password: data.pwdID, //  Store password here
            userFcm: fcmToken, // Store FCM token here
          };
          await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
          //console.warn(data.businessID);
          saveTokenToDatabase(fcmToken , IDEmployee); // Save FCM token to database
          navigation.navigate('AppNavScreen');
        } catch (error) {
          console.log(error);
        }
        //AsyncStorage for multiple item end
      }
    }
  };

  return (
    // <KeyboardAwareLogin>
    //   <ImageBackground
    //     source={require('../images/bg2.png')}
    //     style={styles.bg}
    //     resizeMode="cover" // Ensure it scales properly
    //   >
    //     <SafeAreaView style={styles.safeArea}>
    //       <StatusBar
    //         translucent
    //         backgroundColor="transparent"
    //         barStyle="dark-content"
    //       />

    //       {/* CRM Logo */}
    //       <View style={styles.logoWrapper}>
    //         <CRMImg height={200} width={200} />
    //       </View>

    //       {/* Login Form */}
    //       <KeyboardAvoidingView
    //         style={styles.keyboardAvoid}
    //         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    //         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 60}>
    //         <ScrollView contentContainerStyle={styles.scroll}>
    //           <View style={styles.container}>
    //             {/* Business ID */}
    //             <View style={styles.inputRow}>
    //               <MaterialIcons name="home" size={24} color="#555" />
    //               <TextInput
    //                 style={styles.input}
    //                 placeholder="Business ID"
    //                 onChangeText={text => handleOnchange(text, 'businessID')}
    //                 autoCapitalize={'characters'}
    //               />
    //             </View>

    //             {/* Email ID */}
    //             <View style={styles.inputRow}>
    //               <MaterialIcons
    //                 name="alternate-email"
    //                 size={22}
    //                 color="#555"
    //               />
    //               <TextInput
    //                 style={styles.input}
    //                 placeholder="Email ID"
    //                 onChangeText={text => handleOnchange(text, 'emailID')}
    //                 autoCapitalize="none"
    //                 keyboardType="email-address"
    //               />
    //             </View>

    //             {/* Password */}
    //             <View style={styles.inputRow}>
    //               <Entypo name="key" size={22} color="#555" />
    //               <TextInput
    //                 style={styles.input}
    //                 placeholder="Password"
    //                 onChangeText={text => handleOnchange(text, 'pwdID')}
    //                 secureTextEntry={secureText}
    //                 autoCapitalize="none"
    //               />
    //               <TouchableOpacity onPress={togglePasswordVisibility}>
    //                 <Ionicons
    //                   name={secureText ? 'eye-off' : 'eye'}
    //                   size={22}
    //                   color="#555"
    //                 />
    //               </TouchableOpacity>
    //             </View>

    //             {/* Login Button */}
    //             <TouchableOpacity style={styles.loginButton} onPress={login}>
    //               <Text style={styles.loginText}>Login</Text>
    //             </TouchableOpacity>
    //           </View>
    //         </ScrollView>
    //       </KeyboardAvoidingView>
    //       {/* Version Text */}
    //       <Text style={styles.versionText}>Version 2.3</Text>
    //     </SafeAreaView>
    //     <ProgressDialog visible={loading} message="Please Wait..." />
    //   </ImageBackground>
    // </KeyboardAwareLogin> 
    <KeyboardAwareLogin>
      <ScrollView style={{ flex: 1, backgroundColor: '#005696' }}>
        <StatusBar barStyle="light-content" backgroundColor="#005696" />
        {/* <ImageBackground
        source={require('../images/bg2.png')} 
        style={{height: Dimensions.get('window').height}}> */}
        <View style={{ alignItems: 'center' }}>
          <CRMImg height={183} width={154} />
          {/* <Text style={styles.versionText}>Version 2.0</Text> */}
          {/* <Image
          source={require('../images/ieCRMLogo1.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}
          <Text style={styles.versionText}>Version 2.5</Text>
        </View>

        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <Text style={styles.brandViewTextMain}>
              User Login
            </Text>
            <View style={styles.inputRow}>
              <MaterialIcons name="home" size={24} color="#555" />
              {/* <Text style={styles.businessId}>MEND-PVTL-890</Text> */}
              <TextInput
                style={styles.businessId}
                placeholder="Business ID"
                onChangeText={text => handleOnchange(text, 'businessID')}
                autoCapitalize={'characters'}
              />
            </View>
            <View style={styles.inputRow}>
              <MaterialIcons name="alternate-email" size={22} color="#555" />
              <TextInput
                placeholder="Email ID"
                onChangeText={text => handleOnchange(text, 'emailID')}
                autoCapitalize="none"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputRow}>
              <Entypo name="key" size={22} color="#555" />
              <TextInput
                placeholder="Password"
                onChangeText={text => handleOnchange(text, 'pwdID')}
                style={styles.input}
                secureTextEntry={secureText}
                autoCapitalize="none"
                inputType="password"
              />
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={secureText ? 'eye-off' : 'eye'}
                  size={22}
                  color="#555"
                />
              </TouchableOpacity>
            </View>

            <View style={{
              flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingVertical: 12,
              paddingHorizontal: 5,
            }}>
              {/* Custom Checkbox */}
              <TouchableOpacity
                style={[styles.checkbox, checked && styles.checked]} // Conditional styles based on checked state
                onPress={toggleCheckbox}
              >
                {/* Display the checkmark icon when checked */}
                {checked && <Feather name="check" size={18} color="#ffffff" />}
              </TouchableOpacity>

              {/* Text */}
              <TouchableOpacity onPress={toggleCheckbox}>
                <Text style={{ marginLeft: 10 }}>Remember Me</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity> */}
          <TouchableWithoutFeedback
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={login}
          >
            <Animated.View style={[styles.loginButton, { transform: [{ scale: scaleValue }] }]}>
              <Text style={styles.loginText}>Login</Text>
            </Animated.View>
          </TouchableWithoutFeedback>

        </View>
        <Text style={{ marginTop: 12, fontSize: 13, textAlign: 'center', color: '#ffffff', padding: 10 }}>
          By login you agree to the{' '}
          <TouchableOpacity onPress={() => {/* Navigate to Terms & Conditions screen */ }}>
            <Text style={{ fontSize: 12, color: '#ffffff', textDecorationLine: 'underline' }}>
              Terms & Conditions
            </Text>
          </TouchableOpacity>{' '}
          and Privacy policy of the company.
          {'\n'}
          © {currentYear} ie.CRM. All rights reserved.
        </Text>
        {/* <Text style={styles.versionText}>Version 2.0</Text> */}
        <ProgressDialog visible={loading} message="Please Wait..." />
        {/* </ImageBackground> */}
      </ScrollView>
    </KeyboardAwareLogin>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  // 
  container: {
    flex: 1,
    backgroundColor: '#f7fdfd',
    alignItems: 'center',
    padding: width * 0.04,
    marginHorizontal: width * 0.05,
    marginTop: height * 0.005,
    marginBottom: height * 0.05,
    paddingBottom: 25,
    borderRadius: 20,
    // Soft shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 6,

    // Optional border for subtle boundary
    borderColor: '#E0F2F1',
    borderWidth: 1,
  },

  logo: {
    width: width * 0.58,
    height: height * 0.25,
    marginBottom: 5,
    // marginTop: 2,
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
    paddingHorizontal: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  businessId: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#005696',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '80%',
  },
  loginText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  versionText: {
    //marginTop: 30,
    color: '#ffffff',
    fontSize: 14,
    bottom: 16,
    position: 'absolute',
    alignContent: 'right',
    alignSelf: 'right',
    fontFamily: 'Roboto-Regular',
    marginLeft: 20,
  },
  brandViewTextMain: {
    color: '#786c77',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#000',  // Border color for the checkbox
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#005696',  // Background color when checked
  }
});
