import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {Dropdown} from 'react-native-element-dropdown';
import {TextInput} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
import CustomButton from '../components/custom/CustomButton';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

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

const OtherScreen = ({navigation}) => {
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [empNO, setEmpno] = useState('');
  const [empName, setEmpName] = useState('');
  const [useHQ, setHQ] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [useWTData, setWTData] = useState([]);
  const [currTime, setcurrTime] = useState('');
  const [wtdataLabel, setwtdataLabel] = useState('');
  const [wtdataValue, setwtdataValue] = useState('');
  const [deviceType, setDevice] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');

  var cdate = moment().format('D/MMM/YYYY');

  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();

    setcurrDate(date + '/' + month + '/' + year);

    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setEmpno(user.Empno);
          setuseManagerAccess(user.ManagerAccess);
          setHQ(user.HQ);
          setDivision(user.Division);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setEmpName(user.Empname);
          setuseMobileAccess(user.MobileAccess);
          //console.warn(user);

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              const wturl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=WORKTYPE';
              //console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
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
                  wtNameArray.shift();
                  setWTData(wtNameArray);
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

    setInterval(() => {
      setcurrTime(new Date().toLocaleTimeString());
      //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
    }, 1000);

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const save = () => {
    if (currentLongitude == 0.00 && currentLatitude == 0.00) {
      Alert.alert(
        "Invalid Location",
        "Latitude and Longitude are both 0.00. Closing the app.",
        [
          {
            text: "OK",
            onPress: () => {
              BackHandler.exitApp(); // This will close the app
              navigation.navigate('AppNavScreen');
            }
          }
        ],
        { cancelable: false }
      );
    } 
    else if(useRemarks==='')
    {
      Alert.alert('Type Remarks');
    }
    else{
    try {
      AsyncStorage.getItem('IDday').then(value => {
        if (value != null) {
          let IDday = JSON.parse(value);

          EndOthersDcr(IDday);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
  };

  const EndOthersDcr = IDday => {
    let Mvisitwith = [];
    let GProdID = [];
    let GfStatus = [];
    let ProdID = [];
    let curstageID = [];
    let fStatus = [];
    let SProdID = [];
    let SfStatus = [];
    let samples = [];
    let gifts = [];
    let statuss = [];
    let visitwith = [];

    var date = moment().utcOffset('+05:30').format('YYYY-MM-DD hh:mm:ss A');
    //console.warn(date);

    if (useMobileAccess === 'ONLINE') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          if (useManagerAccess === true) {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRTime: date,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              Sync: false,
              UNListed: false,
              User: empEmail,
              Businessid: useBusinessID,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Remarks: useRemarks,
              Samples: samples,
              Gifts: gifts,
              ProductStatuss: statuss,
              Visitwiths: visitwith,
            };

            //console.log(data_api);
            let result = await fetch(BASE_URL + 'Manager/DCR/Web/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
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
          } else {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              Remarks: useRemarks,
              User: empEmail,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Businessid: useBusinessID,
              UNListed: false,
            };

            //console.log(data_api);
            let result = await fetch(BASE_URL + 'DCR/Mobile/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
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
          }
        } else {
          Alert.alert('You are Offline Contact With Administrator!');
        }
      }, []);
    } else if (useMobileAccess === 'ONLINE & OFFLINE') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          if (useManagerAccess === true) {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRTime: date,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              Sync: false,
              UNListed: false,
              User: empEmail,
              Businessid: useBusinessID,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Remarks: useRemarks,
              Samples: samples,
              Gifts: gifts,
              ProductStatuss: statuss,
              Visitwiths: visitwith,
            };

            //console.log(data_api);
            let result = await fetch(BASE_URL + 'Manager/DCR/Web/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
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
          } else {
            const data_api = {
              IDDCR: 0,
              IDDay: IDday,
              DCRDate: cdate,
              DCRType: 'OTHERS',
              EntryType: 'ONLINE_' + deviceType,
              UserLat: currentLatitude,
              UserLong: currentLongitude,
              Remarks: useRemarks,
              User: empEmail,
              IDEmployee: useIDEmployee,
              IDWorktype: wtdataValue,
              IDDoctor: 0,
              Businessid: useBusinessID,
              UNListed: false,
            };

            //console.log(data_api);
            let result = await fetch(BASE_URL + 'DCR/Mobile/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data_api),
            });

            result = await result.json();
            //console.log(result);
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
          }
        } else {
          const data_api = {
            dcrDate: cdate,
            businessID: useBusinessID,
            dcrType: 'OTHERS',
            //deviceType: DeviceInfo.getModel(),
            deviceType: 'OFFLINE_' + deviceType,
            dcrDateTime: date,
            UNListed: false,
            // startLat: 0,
            // startLong: 0,
            // endLat: currentLatitude,
            // endLong: currentLongitude,
            userLat: currentLatitude,
            userLong: currentLongitude,
            idCustomer: 0,
            idDoctor: 0,
            idEmployee: useIDEmployee,
            idWorktype: wtdataValue,
            giftsProducts: GfStatus,
            giftsQty: GProdID,
            productsCurrentStatus: curstageID,
            productsFinalStatus: fStatus,
            products: ProdID,
            samplesProduct: SfStatus,
            samplesProductQty: SProdID,
            visitWiths: Mvisitwith,
            entryUser: empEmail,
            Remarks: useRemarks,
          };

          db.transaction(tx => {
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_Others(id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
              'INSERT INTO CRM_Others(data) VALUES (?)',
              [JSON.stringify(data_api)],
              (_, result) => {
                console.log('Data inserted successfully:', result);
                navigation.navigate('AppNavDCRScreen');
              },
              (_, error) => {
                console.warn('Error inserting data:', error);
              },
            );
          });
        }
      }, []);
    } else {
      Alert.alert('Contact With Administrator!');
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

  const fetchOfflineTableData = () => {
    //Retrieve data from CRM_WorkTypeList
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_WorkTypeList',
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
            temp.shift();
            setWTData(temp);
            console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setWTData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
          console.log('Error checking data', error);
        },
      );
    });
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
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
            <Text
              style={{padding: 5, fontFamily: 'Lato-Bold'}}
              numberOfLines={1}>
              Latitude : {currentLatitude}
            </Text>
            <Text
              style={{padding: 5, fontFamily: 'Lato-Bold'}}
              numberOfLines={1}>
              Longitude : {currentLongitude}
            </Text>
          </View>
        </View>
        <View
          style={{
            paddingLeft: 5,
            paddingRight: 5,
            marginRight: 5,
            marginLeft: 5,
          }}>
          <TextInput
            label="Division"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useDivision}
            editable={false}
          />
          <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="Employee"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              value={empName}
              editable={false}
            />
          </View>
          {/* <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="Employee No"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginTop: 5}}
              value={empNO}
              editable={false}
            />
          </View>
          <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="HQ"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginTop: 5}}
              value={useHQ}
              editable={false}
            />
          </View> */}
          <View style={{marginTop: 2, paddingTop: 2}}>
            <TextInput
              label="DCR Date"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5}}
              value={currDate}
              editable={false}
            />
          </View>
          <KeyboardAvoidingView
            behavior="padding"
            style={{justifyContent: 'space-between'}}>
            <View style={{marginTop: 2, paddingTop: 2}}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useWTData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Work Type' : '...'}
                searchPlaceholder="Search Work Type"
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setwtdataValue(item.value);
                  setwtdataLabel(item.label);
                  // handleState(item.value);
                  setIsFocus(false);
                }}
              />
            </View>
            <View style={{marginTop: 2, paddingTop: 2}}>
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
          </KeyboardAvoidingView>
        </View>
        <View style={{margin: 5, padding: 5}}>
          <CustomButton label={'Start DCR'} onPress={() => save()} />
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

export default OtherScreen;
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
});
