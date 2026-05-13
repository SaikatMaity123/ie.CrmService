import {
  View, Text, ScrollView, Alert,
  StyleSheet, BackHandler, StatusBar
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import CustomButton from '../components/custom/CustomButton';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '@env';
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout'; 

const DoctorActivities = ({ navigation }) => {
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useWorkType, setWorkType] = useState('Working');
  const [isFocus, setIsFocus] = useState(false);
  const [useDivision, setDivision] = useState([]);
  const [useDivisionValue, setDivisionValue] = useState('');
  const [useVWTEmp, setVWTEmp] = useState('');
  const [useDesignation, setDesignation] = useState([]);
  const [useDesignationValue, setDesignationValue] = useState('');
  const [useAreaValue, setAreaValue] = useState('');
  const [useDoctorValue, setDoctorValue] = useState('');
  const [useVisitWith, setVisitWith] = useState([]);
  const [useArea, setArea] = useState([]);
  const [useDoctor, setDoctor] = useState([]);
  const [empEmail, setEmpEmail] = useState('');
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  const [useRemarks, setRemarks] = useState('');
  const [deviceType, setDevice] = useState('');

  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });
    fetchOnlineData();
    setcurrDate(date + '/' + month + '/' + year);
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();
    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavActivity'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

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
      { timeout: 15000 }, // 15 seconds timeout
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
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 1000 },
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOnlineData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          // setuseManagerAccess(user.ManagerAccess);
          // setuseMobileAccess(user.MobileAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const empurl =
                BASE_URL +
                'Division/DivisionList?Businessid=' +
                user.BusinessID;
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
                      value: response.data[i].IDDivision,
                      label: response.data[i].Name,
                    });
                  }
                  setDivision(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const desigurl =
                BASE_URL +
                'Designation/DesignationList?Businessid=' +
                user.BusinessID;
              console.log(desigurl);
              var config = {
                method: 'get',
                url: desigurl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      value: response.data[i].IDDesignation,
                      label: response.data[i].Name,
                    });
                  }
                  setDesignation(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  const visitwithAPI = IDDesignation => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const visitwithurl =
          BASE_URL +
          'Employee/DivisionDesignationEmployeeListWithoutSelectedEmployee?Businessid=' +
          useBusinessID +
          '&IDDivision=' +
          useDivisionValue +
          '&IDDesignation=' +
          IDDesignation +
          '&IDEmployee=' +
          useIDEmployee;
        console.log(visitwithurl);
        var config = {
          method: 'get',
          url: visitwithurl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                value: response.data[i].IDEmployee,
                label: response.data[i].Name,
              });
            }
            setVisitWith(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };

  const areaAPI = IDEmployee => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaURL =
          BASE_URL +
          'Area/EmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          IDEmployee;
        //console.log(visitwithurl);
        var config = {
          method: 'get',
          url: areaURL,
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
            setArea(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };
  const doctorListAPI = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaURL =
          BASE_URL +
          'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useVWTEmp +
          '&IDArea=' +
          IDArea;
        //console.log(visitwithurl);
        var config = {
          method: 'get',
          url: areaURL,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                value: response.data[i].IDDoctor,
                label: response.data[i].Name + ' ' + response.data[i].Code,
              });
            }
            setDoctor(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };

  const convertDate = dateString => {
    const [day, month, year] = dateString.split('/');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${day}-${monthNames[parseInt(month) - 1]}-${year}`;
  };
  const save = async () => {
    const formattedDate = convertDate(currDate);
    console.log(formattedDate); // Output: 27-Jan-2025
    if (useDivisionValue === '') {
      Alert.alert('Select Division');
    } else if (useDesignationValue === '') {
      Alert.alert('Select Designation');
    } else if (useVWTEmp === '') {
      Alert.alert('Select Visit With');
    } else if (useAreaValue === '') {
      Alert.alert('Select Area');
    } else if (useDoctorValue === '') {
      Alert.alert('Select Doctor');
    } else {
      const data_api = {
        IDDCR: 0,
        IDDay: 0,
        DCRDate: formattedDate,
        DCRType: 'DOCTOR',
        EntryType: 'ONLINE_' + deviceType,
        Remarks: useRemarks,
        UserLat: currentLatitude,
        UserLong: currentLongitude,
        User: empEmail,
        Businessid: useBusinessID,
        UNListed: false,
        Employee: { IDEmployee: useIDEmployee },
        Worktype: { IDMisc: 57 },
        Doctor: { IDDoctor: useDoctorValue },
        IDVisitwith: useVWTEmp,
      };
      console.log(data_api);
      let result = await fetch(BASE_URL + 'DCR/MarketingActivity', {
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
        Alert.alert(
          'Success',
          'Record Successfully Saved',
          [
            {
              text: 'Ok',
              //onPress: () => navigation.navigate('Report DashBoard'),
              onPress: () => navigation.navigate('Activity DashBoard'),
            },
          ],
          { cancelable: false },
        );
      } else {
        Alert.alert('Else : ' + result.result);
      }
    }
  };

  return (
    <KeyboardAwareLayout
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 4,
        borderWidth: 0.1,
        borderColor: '#d6d7da',
        elevation: 1,
        margin: 10,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      }}
      showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <View
        style={{
          backgroundColor: '#ecf0f1',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 6,
          borderWidth: 0.1,
          margin: 10,
          elevation: 1,
          borderRadius: 4,
          borderColor: '#d6d7da',
        }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
          {/* Big Location Icon */}
          <Ionicons name="location-outline" size={40} color="#005696" style={{ marginRight: 12 }} />

          <View style={{ flexDirection: 'row' }}>
            <Text style={{ padding: 5 }}>Lat : {currentLatitude}</Text>
            <Text style={{ padding: 5 }}>Long : {currentLongitude} </Text>
          </View>
        </View>
      </View>
      <View style={{ marginLeft: 10, marginRight: 10 }}>
        <TextInput
          label="Date"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ marginBottom: 5 }}
          value={currDate}
          editable={false}
        />
        <TextInput
          label="Work Type"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ marginBottom: 5 }}
          value={useWorkType}
          editable={false}
        />
        <Dropdown
          style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={useDivision}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Division' : '...'}
          searchPlaceholder="Search..."
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setDivisionValue(item.value);
            setIsFocus(false);
          }}
        />
        <View style={{ marginTop: 5 }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useDesignation}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Designation' : '...'}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setDesignationValue(item.value);
              setIsFocus(false);
              visitwithAPI(item.value);
            }}
          />
        </View>
        <View style={{ marginTop: 5 }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useVisitWith}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Visit With' : '...'}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setIsFocus(false);
              areaAPI(item.value);
              setVWTEmp(item.value);
            }}
          />
        </View>
        <View style={{ marginTop: 5 }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useArea}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Area' : '...'}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setIsFocus(false);
              doctorListAPI(item.value);
              setAreaValue(item.value);
            }}
          />
        </View>
        <View style={{ marginTop: 5 }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useDoctor}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Doctor' : '...'}
            searchPlaceholder="Search..."
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setIsFocus(false);
              setDoctorValue(item.value);
            }}
          />
        </View>
        <TextInput
          label="Remarks"
          mode="outlined"
          autoCapitalize="none"
          multiline={true}
          numberOfLines={3}
          autoCorrect={false}
          style={{ marginBottom: 5 }}
          value={useRemarks}
          onChangeText={text => setRemarks(text)}
        />
      </View>
      <View style={{ marginLeft: 75, marginRight: 75, padding: 10 }}>
        <CustomButton label={'Submit'} onPress={() => save()} />
      </View>
    </KeyboardAwareLayout>
  );
};

export default DoctorActivities;

const style = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
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
});
