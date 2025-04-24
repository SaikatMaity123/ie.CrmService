import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import {Dropdown} from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import CRMImg from '../images/CRMNEW.svg';
import CustomButton from '../components/custom/CustomButton';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';

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
const StayScreen = ({navigation}) => {
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [selectedAreaData, setSelectedAreaData] = useState([]);
  const [selectedMAreaData, setSelectedMAreaData] = useState([]);
  const [areaLabel, setareaLabel] = useState('');
  const [areaValue, setareaValue] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [currDate, setcurrDate] = useState('');
  const [useDevice, setDevice] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');

  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  var cdate = moment().format('D/MMM/YYYY');

  useEffect(() => {
    // var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    // console.warn(date);
    getOneTimeLocation();
    handleEnabledPressed();

    getData();

    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

    setcurrDate(date + '/' + month + '/' + year);
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
          setuseMobileAccess(user.MobileAccess);
          setuseManagerAccess(user.ManagerAccess);
          //startDocDCR(user.BusinessID, user.IDEmployee);

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
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

              const maturl =
                BASE_URL +
                'Manager/Area/List?Businessid=' +
                user.BusinessID +
                '&IDManager=' +
                user.IDEmployee;
              //console.log('aturl ' + maturl);
              var config = {
                method: 'get',
                url: maturl,
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
                  setSelectedMAreaData(wtNameArray);
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
      //{enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      {timeout: 15000}, // 15 seconds timeout
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

  const fetchOfflineTableData = () => {
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
        'SELECT * FROM CRM_MangerAreaList',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push({
                value: results.rows.item(i).IDArea,
                label: results.rows.item(i).Name,
              });
            setSelectedMAreaData(temp);
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
  };

  const submit = () => {
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
    } else if (areaValue === '') {
      Alert.alert('Select Area');
    } else if (useRemarks === '') {
      Alert.alert('Type Remarks');
    } else {
      //CREATE TABLE for Stay_Table
      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS CRM_ManagerStartDay', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS Stay_Table(StayDate VARCHAR)',
          [],
        );
      });

      //SQLITE INSERT Stay_Table
      let sql = 'INSERT INTO Stay_Table(StayDate) VALUES (?)';
      let params = [cdate]; //storing user data in an array
      db.executeSql(sql, params);

      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(state => {
          if (state.isConnected) {
            try {
              AsyncStorage.getItem('IDday').then(value => {
                if (value != null) {
                  let IDday = JSON.parse(value);
                  submitStay(IDday, date);
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
                  submitStay(IDday, date);
                }
              });
            } catch (error) {
              Alert.alert(error);
            }
          } else {
            let deviceType = 'MOBILE_SYNC_' + useDevice;

            const data_api = {
              BusinessID: useBusinessID,
              IDDay: 0,
              DCRDate: cdate,
              DCRDateTime: date,
              EntryType: deviceType,
              SyncDatetime: date,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              IDEmployee: useIDEmployee,
              IDArea: areaValue,
              Remarks: useRemarks,
              User: empEmail,
            };
            //console.log(data_api);

            db.transaction(tx => {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS CRM_StayDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
                'INSERT INTO CRM_StayDataSave (data) VALUES (?);',
                [JSON.stringify(data_api)],
                (_, result) => {
                  console.log('Data inserted successfully:', result);
                  navigation.navigate('AppNavDCRScreen');
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
        //Alert.alert(useMobileAccess);
      }
    }
  };

  const submitStay = async (IDday, date) => {
    let deviceType = 'ONLINE_MOBILE_' + useDevice;
    const data_api = {
      BusinessID: useBusinessID,
      IDDay: IDday,
      DCRDate: cdate,
      DCRDateTime: date,
      EntryType: deviceType,
      SyncDatetime: date,
      UserLat: currentLatitude,
      UserLong: currentLongitude,
      IDEmployee: useIDEmployee,
      IDArea: areaValue,
      Remarks: useRemarks,
      User: empEmail,
    };
    //console.log(data_api);

    let result = await fetch(BASE_URL + 'DCR/Stay', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data_api),
    });
    result = await result.json();
    //console.log(result.result);
    if (result.result === '') {
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
      Alert.alert(result.result);
    }
  };

  return (
    <ImageBackground
      source={require('../images/bg2.png')}
      style={{height: Dimensions.get('window').height}}>
      {/* <View style={{ alignItems: 'center',}}>
            <CRMImg
            height={150}
            width={200}
            // style={{transform: [{rotate: '-5deg'}]}}
          />
          </View> */}
      <View
        style={{
          backgroundColor: '#ecf0f1',
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.1,
          marginTop: 10,
          marginBottom: 50,
          marginLeft: 10,
          marginRight: 10,
          elevation: 2,
          borderRadius: 1,
        }}>
        <View>
          {/* <Text style={style.boldText}>{locationStatus}</Text> */}
          <Text style={{padding: 5, fontFamily: 'Lato-Regular'}}>
            Latitude : {currentLatitude}
          </Text>
          <Text style={{padding: 5, fontFamily: 'Lato-Regular'}}>
            Longitude : {currentLongitude}{' '}
          </Text>
          {/* <Text style={{padding: 5}}>Date : {currDate}</Text> */}
          {/* <Text style={{padding: 5}}>Time : {currTime}</Text> */}
        </View>
        {/* <View
          style={{
            width: '50%',
            padding: 5,
            margin: 5,
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
            }}>
            {currDate}
          </Text>
        </View> */}
      </View>
      <View
        style={{
          justifyContent: 'center',
          marginTop: 150,
          marginLeft: 10,
          marginRight: 10,
          paddingRight: 10,
          paddingLeft: 10,
        }}>
        {useManagerAccess ? (
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
        ) : (
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
        )}

        <View
          style={{
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <TextInput
            label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginBottom: 5}}
            value={useRemarks}
            onChangeText={text => setRemarks(text)}
          />
        </View>
        <View
          style={{
            justifyContent: 'center',
            marginTop: 10,
          }}>
          <CustomButton label={'Submit'} onPress={() => submit()} />
        </View>
      </View>
    </ImageBackground>
  );
};

export default StayScreen;
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
