// import {
//   View,
//   Text,
//   SafeAreaView,
//   ScrollView,
//   ImageBackground,
//   Dimensions,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   TouchableOpacity,
//   KeyboardAvoidingView,
// } from 'react-native';
// import React, {useEffect, useState} from 'react';
// import CRMImg from '../images/CRMNEW.svg';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo from '@react-native-community/netinfo';
// import InputField from '../components/custom/InputField';
// import CustomButton from '../components/custom/CustomButton';
// import {BASE_URL} from '@env';
// import ProgressDialog from '../components/custom/ProgressDialog';

// //const dash_url = 'http://111.93.160.6:2001/api/crm/login/validlogin';
// const dash_url = BASE_URL + 'login/validlogin';
// const LogIn = ({navigation}) => {
//   const initialvalues = {
//     businessID: 'MEND-PVTL-890',
//     emailID: '',
//     pwdID: '',
//   };
//   const [checked, setChecked] = useState(false);
//   const [data, setData] = useState(initialvalues);
//   const [loading, setLoading] = useState(false);
//   const [isSecureEntry, setIsSecureEntry] = useState(true);

//   const handleOnchange = (text, input) => {
//     setData(prevState => ({...prevState, [input]: text}));
//   };

//   useEffect(() => {
//     getData();
//   }, []);

//   const getData = () => {
//     try {
//       AsyncStorage.getItem('UserData').then(value => {
//         if (value != null) {
//           //navigation.navigate(DashBoard);
//           navigation.navigate('AppNavScreen');
//         }
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const login = () => {
//     NetInfo.fetch().then(state => {
//       if (state.isConnected) {
//         //Alert.alert('Online');
//         setLoading(true);
//         setTimeout(() => {
//           setLoading(false);
//         }, 5000);
//         submit(dash_url);
//       } else {
//         Alert.alert('Please Connect Internet');
//         setLoading(true);
//         setTimeout(() => {
//           setLoading(false);
//         }, 5000);
//       }
//     }, []);
//     //navigation.navigate('TestScreen');
//   };

//   const submit = async () => {
//     let checkEmail = '[a-zA-Z0-9._-]+@[a-z]+.+[a-z]+';
//     var response,
//       IDEmployee,
//       Empname,
//       Division,
//       IDDivision,
//       IDDesignation,
//       Empemail,
//       Designation,
//       Empno,
//       HQ,
//       IDHQ,
//       Manager,
//       ManagerAccess,
//       TrackingTime,
//       Message,
//       MobileAccess,
//       SecurityKey,
//       FrameFilePath,
//       ProfilePicPath,
//       System;
//     console.log(data);
//     //setData(initialvalues);
//     if (data.businessID === '') {
//       //console.warn('Business ID is empty');
//       Alert.alert('Business ID is empty');
//     } else if (data.emailID === '') {
//       Alert.alert('Email is empty');
//     } else if (data.pwdID === '') {
//       Alert.alert('Password is empty');
//     } else if (!data.emailID.match(checkEmail)) {
//       Alert.alert('Invalid Email!');
//     } else {
//       const data_api = {
//         businessid: data.businessID,
//         email: data.emailID,
//         password: data.pwdID,
//       };
//       console.log(data_api);

//       let result = await fetch(dash_url, {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data_api),
//       });

//       result = await result.json();
//       console.log(result);

//       //Fetch data from API & display the result
//       response = result.Success;
//       IDEmployee = result.IDEmployee;
//       Empname = result.Empname;
//       Division = result.Division;
//       IDDivision = result.IDDivision;
//       IDDesignation = result.IDDesignation;
//       Empemail = result.Empemail;
//       Designation = result.Designation;
//       Empno = result.Empno;
//       HQ = result.HQ;
//       IDHQ = result.IDHQ;
//       Manager = result.Manager;
//       System = result.System;
//       Message = result.Message;
//       MobileAccess = result.MobileAccess;
//       ManagerAccess = result.ManagerAccess;
//       TrackingTime = result.TrackingTime;
//       SecurityKey = result.SecurityKey;
//       FrameFilePath = result.FrameFilePath;
//       ProfilePicPath = result.ProfilePicPath;

//       if (response === false) {
//         //Alert.alert('Either business id or email or password incorrect!!');
//         Alert.alert(Message);
//       } else if (Message === 'Wrong User credential') {
//         Alert.alert(Message);
//       } else {
//         var BusinessID = data.businessID;
//         //AsyncStorage for multiple item start
//         try {
//           var userinfo = {
//             IDEmployee,
//             Empname,
//             Division,
//             IDDivision,
//             IDDesignation,
//             Empemail,
//             Designation,
//             Empno,
//             HQ,
//             IDHQ,
//             Manager,
//             System,
//             response,
//             BusinessID,
//             MobileAccess,
//             ManagerAccess,
//             TrackingTime,
//             SecurityKey,
//             FrameFilePath,
//             ProfilePicPath,
//           };
//           await AsyncStorage.setItem('UserData', JSON.stringify(userinfo));
//           //console.warn(userinfo);
//           console.log(userinfo);
//           //navigation.navigate(DashBoard);
//           navigation.navigate('AppNavScreen');
//         } catch (error) {
//           console.log(error);
//         }
//         //AsyncStorage for multiple item end
//       }
//     }
//   };

//   // const checkBoxVal = item => {
//   //   // if (item) {
//   //   //   console.warn('Hi true ' + item);
//   //   // } else {
//   //   //   console.warn('Hello false ' + item);
//   //   // }
//   // };

//   return (
//     //<KeyboardAvoidingView style={{flex:1}}enabled={true} behavior={"padding"}>
//     <ScrollView>
//       <ImageBackground
//         source={require('../images/bg2.png')}
//         style={{height: Dimensions.get('window').height}}>
//         <View style={styles.container}>
//           <CRMImg
//             height={300}
//             width={300}
//             // style={{transform: [{rotate: '-5deg'}]}}
//           />
//           {/* <Text
//               style={{
//                 fontFamily: 'Roboto-Medium',
//                 fontSize: 28,
//                 fontWeight: '500',
//                 color: '#333',
//                 marginBottom: 30,
//               }}>
//               Login
//             </Text> */}
//           <View style={styles.form}>
//             <InputField
//               value={'MEND-PVTL-890'}
//               onChangeText={text => handleOnchange(text, 'businessID')}
//               autoCapitalize={'characters'}
//               icon={
//                 <MaterialIcons
//                   name="home"
//                   size={25}
//                   color="#666"
//                   style={{marginRight: 5}}
//                 />
//               }
//             />
//             <InputField
//               label={'Email ID'}
//               onChangeText={text => handleOnchange(text, 'emailID')}
//               autoCapitalize="none"
//               icon={
//                 <MaterialIcons
//                   name="alternate-email"
//                   size={25}
//                   color="#666"
//                   style={{marginRight: 5}}
//                 />
//               }
//               keyboardType="email-address"
//             />

//             <InputField
//               label={'Password'}
//               autoCapitalize="none"
//               onChangeText={text => handleOnchange(text, 'pwdID')}
//               icon={
//                 <Ionicons
//                   name="key"
//                   size={25}
//                   color="#666"
//                   style={{marginRight: 5}}
//                 />
//               }
//               inputType="password"
//               // fieldButtonLabel={"Forgot?"}
//               // fieldButtonFunction={() => {}}
//             />
//             <CustomButton label={'Login'} onPress={() => login()} />
//           </View>
//           <Text style={styles.version}>Version 2.0</Text>
//         </View>
//         <ProgressDialog visible={loading} message="Please Wait..." />
//       </ImageBackground>
//     </ScrollView>
//     //</KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   brandViewText: {
//     color: '#000',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginRight: 20,
//   },
//   brandViewTextMain: {
//     color: '#000',
//     fontSize: 30,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   wrapper: {
//     display: 'flex',
//     flexDirection: 'row',
//     alignContent: 'center',
//     paddingVertical: 5,
//   },
//   textWrapper: {
//     lineHeight: 30,
//     color: 'black',
//     fontSize: 14,
//     marginTop: 2,
//   },
//   text: {
//     lineHeight: 30,
//     marginLeft: 5,
//   },

//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   form: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   version: {
//     position: 'absolute',
//     bottom: 10,
//     fontSize: 15,
//     color: 'gray',
//   },
// });

// export default LogIn;

import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import CRMImg from '../images/CRMNEW.svg';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('window');
const LogIn = ({navigation}) => {
  const initialvalues = {
    //businessID: 'PHARMA-CITY-730',
    businessID: '',
    emailID: '',
    pwdID: '',
  };
  const [data, setData] = useState(initialvalues);
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const dash_url = BASE_URL + 'login/validlogin';

  const handleOnchange = (text, input) => {
    setData(prevState => ({...prevState, [input]: text}));
  };

  const togglePasswordVisibility = () => {
    setSecureText(!secureText);
  };

  useEffect(() => {
    //console.log('dash_url', dash_url);
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          //navigation.navigate(DashBoard);
          //navigation.navigate('AppNavScreen');
          const parsedData = JSON.parse(value); // convert JSON string to object
          const businessID = parsedData.BusinessID?.trim(); // safely access BusinessID and trim whitespace
          console.log('Business ID:', businessID);

          if (businessID === 'PHARMA-CITY-730') {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('AppNavScreen');
          }
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
          //console.warn(data.businessID);
          if ((data?.businessID || '').trim() === 'PHARMA-CITY-730') {
            navigation.navigate('Dashboard');
          } else {
            navigation.navigate('AppNavScreen');
          }
        } catch (error) {
          console.log(error);
        }
        //AsyncStorage for multiple item end
      }
    }
  };

  return (
    <ScrollView>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={{alignItems: 'center'}}>
          <CRMImg height={300} width={300} />
        </View>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
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
          </View>
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Version 2.0</Text>
        </View>
        <ProgressDialog visible={loading} message="Please Wait..." />
      </ImageBackground>
    </ScrollView>
  );
};

export default LogIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fdfd',
    alignItems: 'center',
    //justifyContent: 'center',
    padding: width * 0.05,
  },
  logo: {
    width: width * 0.5,
    height: height * 0.15,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
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
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#357f81',
    paddingVertical: 14,
    paddingHorizontal: 60,
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
    color: '#999',
    fontSize: 14,
    bottom: 16,
    position: 'absolute',
  },
});
