import {
  View,
  Text,
  SafeAreaView,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
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
import DeviceInfo from 'react-native-device-info';
import ProgressDialog from '../components/custom/ProgressDialog';

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

const MasterRetailer = ({navigation}) => {
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [useIDDivision, setIDDivision] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useempEmail, setempEmail] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useTData, setTData] = useState([]);
  const [useTValue, setTValue] = useState('');
  const [useTLabel, setTLabel] = useState('');
  const [useCode, setCode] = useState('');
  const [retCode, setRetCode] = useState('');
  const [useName, setName] = useState('');
  const [useMobile, setMobile] = useState('');
  const [useBillCode, setBillCode] = useState('');
  const [useAData, setAData] = useState([]);
  const [useAValue, setAValue] = useState('');
  const [useALabel, setALabel] = useState('');
  const [docData, setdocData] = useState([]);
  const [docSelected, setdocSelected] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();

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
              const turl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=RETAILERTYPE';
              //console.log(turl);
              var config = {
                method: 'get',
                url: turl,
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
                  setTData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const wturl =
                BASE_URL +
                'Retailer/RetailerAutoCode?Businessid=' +
                user.BusinessID +
                '&Type=Retailer';
              //console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  //console.log('doctorViewDCR', response.data.d);
                  setRetCode(response.data.d);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const surl =
                // BASE_URL +
                // 'Area/DivisionWiseAreaList?Businessid=' +
                // user.BusinessID +
                // '&IDDivision=' +
                // user.IDDivision;

                BASE_URL +
                'Area/DivisionAndHQWiseAreaList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&IDHQ=' +
                user.IDHQ;
              //console.log('surllll', surl);
              var config = {
                method: 'get',
                url: surl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let tNameArray = [];
                  for (var i = 0; i < count; i++) {
                    tNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDArea,
                      label: response.data[i].Name,
                    });
                  }
                  setAData(tNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
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
    //console.log(useBusinessID);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Master_Type',
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
            setTData(temp);
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
  };

  const docDDOpen = areaID => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_DocList where IDArea=?',
        [areaID],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).Name,
                key: results.rows.item(i).IDDoctor,
              });
            }
            setdocSelected(temp);
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

    //console.warn('Hi', areaID);
  };

  const saveData = async () => {
    if (useTLabel === '') {
      Alert.alert('Select Type');
    } else if (useName === '') {
      Alert.alert('Type Name');
    } else if (useMobile === '') {
      Alert.alert('Type Mobile');
    } else if (useALabel === '') {
      Alert.alert('Select Area');
    } else {
      db.transaction(txn => {
        //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
        txn.executeSql(
          'CREATE TABLE IF NOT EXISTS CRM_MasterRetailerCode(id INTEGER PRIMARY KEY AUTOINCREMENT,TestValue VARCHAR)',
          [],
        );
      });

      let sql = 'INSERT INTO CRM_MasterRetailerCode(TestValue) VALUES (?)';
      let params = [useName]; //storing user data in an array
      db.executeSql(sql, params);

      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_MasterRetailerCode',
          [],
          (_, results) => {
            if (results.rows.length > 0) {
              //console.warn('Table has data');
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i) {
                temp.push(results.rows.item(i).id);
              }
              // setCode(temp);
              //console.log(temp);
              var res = temp.toString();
              save(res);
            }
          },
          (_, error) => {
            console.log('Error fetching data:', error);
          },
        );
      });
    }
  };

  const save = res => {
    let deviceId = DeviceInfo.getDeviceId();

    if (useMobileAccess === 'ONLINE') {
      NetInfo.fetch().then(async state => {
        if (state.isConnected) {
          let docArray = [];
          docData.map(function (value) {
            console.log(value);
            docArray.push({
              IDMapping: 0,
              IDDoctor: value,
              IDSatge: '',
            });
          });
          const data = {
            IDRetailer: 0,
            //Code: 'MRET'+useIDEmployee + useCode,
            //Code: deviceId + res,
            Code: retCode,
            OtherCode: useBillCode,
            Name: useName,
            DisplayName: '',
            IDDivision: useIDDivision,
            IDArea: useAValue,
            IDPartyType: useTValue,
            Employee: {IDEmployee: useIDEmployee},
            Latitude: 0,
            Longitude: 0,
            Address: '',
            Mobile1: useMobile,
            Mobile2: '',
            Pincode: '',
            Email: '',
            Shift: '',
            CreatedBy: useempEmail,
            Businessid: useBusinessID,
            Doctors: docArray,
          };
          //console.log(data);
          let result = await fetch(
            BASE_URL + 'Retailer/MobileRetailerAddEdit',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            },
          );

          result = await result.json();
          //console.log(result);
          if (result.result === '') {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 5000);
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_MasterRetailerCode');
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
              tx.executeSql('DELETE from CRM_MasterRetailerCode');
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
          let docArray = [];
          docData.map(function (value) {
            console.log(value);
            docArray.push({
              IDMapping: 0,
              IDDoctor: value,
              IDSatge: '',
            });
          });
          const data = {
            IDRetailer: 0,
            //Code: 'MRET'+useIDEmployee + useCode,
            //Code: deviceId + res,
            Code: retCode,
            Name: useName,
            OtherCode: useBillCode,
            DisplayName: '',
            IDDivision: useIDDivision,
            IDArea: useAValue,
            IDPartyType: useTValue,
            Employee: {IDEmployee: useIDEmployee},
            Latitude: 0,
            Longitude: 0,
            Address: '',
            Mobile1: useMobile,
            Mobile2: '',
            Pincode: '',
            Email: '',
            Shift: '',
            CreatedBy: useempEmail,
            Businessid: useBusinessID,
            Doctors: docArray,
          };
          //console.log(data);

          let result = await fetch(
            BASE_URL + 'Retailer/MobileRetailerAddEdit',
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            },
          );

          result = await result.json();
          //console.log(result);
          if (result.result === '') {
            db.transaction(tx => {
              tx.executeSql('DELETE from CRM_MasterRetailerCode');
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
              tx.executeSql('DELETE from CRM_MasterRetailerCode');
            });
            Alert.alert('Else : ' + result.result);
            navigation.navigate('AppNavMaster');
          }
        } else {
          let docArray = [];
          docData.map(function (value) {
            console.log(value);
            docArray.push(
              // IDMapping: 0,
              // IDDoctor: value,
              // IDSatge: '',
              value,
            );
          });

          const data = {
            IDRetailer: 0,
            //Code: 'MRET'+useIDEmployee + useCode,
            Code: deviceId + res,
            OtherCode: useBillCode,
            //Code: retCode,
            Name: useName,
            DisplayName: '',
            IDDivision: useIDDivision,
            IDArea: useAValue,
            IDPartyType: useTValue,
            IDEmployee: useIDEmployee,
            Latitude: 0,
            Longitude: 0,
            Address: '',
            Mobile1: useMobile,
            Mobile2: '',
            Pincode: '',
            Email: '',
            Shift: '',
            CreatedBy: useempEmail,
            Businessid: useBusinessID,
            Doctors: docArray,
          };
          console.log(data);

          db.transaction(txn => {
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS ViewMasterRetList(IDRetailer INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
              [],
            );
          });

          let sql =
            'INSERT INTO ViewMasterRetList(IDRetailer,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
          //let params = [0, deviceId + useCode, useName, useAValue, ,]; //storing user data in an array
          let params = [0, retCode, useName, useAValue, ,]; //storing user data in an array
          db.executeSql(sql, params);

          db.transaction(tx => {
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_MasterRetailerDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
              'INSERT INTO CRM_MasterRetailerDataSave (data) VALUES (?);',
              [JSON.stringify(data)],
              (_, result) => {
                console.log('Data inserted successfully:', result);
                db.transaction(tx => {
                  tx.executeSql('DELETE from CRM_MasterRetailerCode');
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
  };
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: false}}>
      <View style={{padding: 5, margin: 5}}>
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
            data={useTData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Type' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              setTLabel(item.label);
              setTValue(item.value);
              // handleState(item.value);
              setIsFocus(false);
            }}
          />
        </View>
        <TextInput
          label="Name"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useName}
          onChangeText={text => setName(text)}
        />
        <TextInput
          label="Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{marginBottom: 5}}
          value={retCode}
          editable={false}
          // onChangeText={text => setRetCode(text)}
        />
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
        <TextInput
          label="Depot Bill Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          //maxLength={10}
          value={useBillCode}
          onChangeText={text => setBillCode(text)}
        />
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
            data={useAData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Area' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              setALabel(item.label);
              setAValue(item.value);
              setIsFocus(false);
              docDDOpen(item.value);
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
          <MultipleSelectList
            setSelected={val => setdocData(val)}
            data={docSelected}
            placeholder="Select Doctor"
            label="Search"
            //save="value"
            save="key"
            onSelect={
              () => console.log(docData)
              //multiSelectAreaList()
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
            marginLeft: 5,
            marginRight: 5,
            paddingLeft: 5,
            paddingRight: 5,
          }}>
          <CustomButton label={'Save'} onPress={() => saveData()} />
        </View>
        <ProgressDialog visible={loading} message="Please Wait..." />
      </View>
    </SafeAreaView>
  );
};

export default MasterRetailer;

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
