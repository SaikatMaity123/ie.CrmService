import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CRMImg from '../images/CRMNEW.svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import InputField from '../components/custom/InputField';
import CustomButton from '../components/custom/CustomButton';
import {BASE_URL} from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';

//const dash_url = 'http://111.93.160.6:2001/api/crm/login/validlogin';
const dash_url = BASE_URL + 'login/validlogin';
const LogIn = ({navigation}) => {
  const initialvalues = {
    businessID: 'MEND-PVTL-890',
    emailID: '',
    pwdID: '',
  };
  const [checked, setChecked] = useState(false);
  const [data, setData] = useState(initialvalues);
  const [loading, setLoading] = useState(false);
  const [isSecureEntry, setIsSecureEntry] = useState(true);

  const handleOnchange = (text, input) => {
    setData(prevState => ({...prevState, [input]: text}));
  };

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          //navigation.navigate(DashBoard);
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
    //navigation.navigate('TestScreen');
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
      System;
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
          };
          await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
          //console.warn(userinfo);
          console.log(userinfo);
          //navigation.navigate(DashBoard);
          navigation.navigate('AppNavScreen');
        } catch (error) {
          console.log(error);
        }
        //AsyncStorage for multiple item end
      }
    }
  };

  // const checkBoxVal = item => {
  //   // if (item) {
  //   //   console.warn('Hi true ' + item);
  //   // } else {
  //   //   console.warn('Hello false ' + item);
  //   // }
  // };

  return (
    //<KeyboardAvoidingView style={{flex:1}}enabled={true} behavior={"padding"}>
    <ScrollView>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg
            height={300}
            width={300}
            // style={{transform: [{rotate: '-5deg'}]}}
          />
          {/* <Text
              style={{
                fontFamily: 'Roboto-Medium',
                fontSize: 28,
                fontWeight: '500',
                color: '#333',
                marginBottom: 30,
              }}>
              Login
            </Text> */}
          <View style={styles.form}>
            <InputField
              value={'MEND-PVTL-890'}
              onChangeText={text => handleOnchange(text, 'businessID')}
              autoCapitalize={'characters'}
              icon={
                <MaterialIcons
                  name="home"
                  size={25}
                  color="#666"
                  style={{marginRight: 5}}
                />
              }
            />
            <InputField
              label={'Email ID'}
              onChangeText={text => handleOnchange(text, 'emailID')}
              autoCapitalize="none"
              icon={
                <MaterialIcons
                  name="alternate-email"
                  size={25}
                  color="#666"
                  style={{marginRight: 5}}
                />
              }
              keyboardType="email-address"
            />

            <InputField
              label={'Password'}
              autoCapitalize="none"
              onChangeText={text => handleOnchange(text, 'pwdID')}
              icon={
                <Ionicons
                  name="key"
                  size={25}
                  color="#666"
                  style={{marginRight: 5}}
                />
              }
              inputType="password"
              // fieldButtonLabel={"Forgot?"}
              // fieldButtonFunction={() => {}}
            />
            <CustomButton label={'Login'} onPress={() => login()} />
          </View>
          <Text style={styles.version}>Version 2.0</Text>
        </View>
        <ProgressDialog visible={loading} message="Please Wait..." />
      </ImageBackground>
    </ScrollView>
    //</KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  brandViewText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 20,
  },
  brandViewTextMain: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
    marginRight: 10,
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    paddingVertical: 5,
  },
  textWrapper: {
    lineHeight: 30,
    color: 'black',
    fontSize: 14,
    marginTop: 2,
  },
  text: {
    lineHeight: 30,
    marginLeft: 5,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  version: {
    position: 'absolute',
    bottom: 10,
    fontSize: 15,
    color: 'gray',
  },
});

export default LogIn;
