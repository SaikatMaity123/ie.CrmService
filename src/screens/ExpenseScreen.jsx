import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  Button,
  Image,
  SafeAreaView,
  PermissionsAndroid,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import CustomButton from '../components/custom/CustomButton';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {BASE_URL} from '@env';
import DeviceInfo from 'react-native-device-info';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import {
//   launchImageLibrary as _launchImageLibrary,
//   //launchCamera as _launchCamera,
// } from 'react-native-image-picker';
// let launchImageLibrary = _launchImageLibrary;
// //let launchCamera = _launchCamera;
// import {launchCamera} from 'react-native-image-picker';
import moment from 'moment';
import {openDatabase} from 'react-native-sqlite-storage';
import AvatarAlert from '../components/custom/AvatarAlert';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;

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

const ExpenseScreen = ({navigation}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [currDate, setcurrDate] = useState('');
  const [useBookingNo, setBookingNo] = useState('');
  const [useExpenseName, setExpenseName] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useAmount, setAmount] = useState('');
  const [useAAmount, setAAmount] = useState(0);
  const [useRemarks, setRemarks] = useState('');
  const [useARemarks, setARemarks] = useState('');
  const [useEHData, setEHData] = useState([]);
  const [useEHdataValue, setEHdataValue] = useState('');
  const [useEHdataLabel, setEHdataLabel] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [deviceType, setDevice] = useState('');
  const [isEmpty, setIsEmpty] = useState(false);
  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      // maxHeight: 180,
      // maxWidth: 150,
    };

    launchImageLibrary(options, handleResponse);
  };

  let options = {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: false,
    // maxHeight: 180,
    // maxWidth: 150,
  };
  const handleCameraLaunch = async () => {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const result = await launchCamera(options);

      const imageuri = result.assets[0].uri;
      const fileName = result.assets[0].fileName;
      const fileType = result.assets[0].type;

      setSelectedImage(imageuri);
      setSelectedImageName(fileName);
      setSelectedImageType(fileType);
      // console.log('imageuri',imageuri);
      // console.log('fileName',fileName);
      // console.log('fileType',fileType);
      //(result.assets[0].uri);
    }
    setModalVisible(false);
  };

  const handleResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('Image picker error: ', response.error);
    } else {
      let imageUri = response.uri || response.assets?.[0]?.uri;
      //setSelectedImage(imageUri);
      //uploadImage(imageUri);
      const imageuri = response.assets[0].uri;
      const fileName = response.assets[0].fileName;
      const fileType = response.assets[0].type;
      setSelectedImage(imageuri);
      setSelectedImageName(fileName);
      setSelectedImageType(fileType);
      // console.log('imageuri',imageuri);
      // console.log('fileName',fileName);
      // console.log('fileType',fileType);
    }
    setModalVisible(false);
  };

  // const uploadImage = image => {
  //   const formData = new FormData();
  //   formData.append('image', {
  //     uri: image.uri,
  //     type: image.type || 'image/jpeg', // Make sure the type is correct
  //     name: image.fileName || `photo_${Date.now()}.jpg`,
  //   });

  //   console.log(formData);
  //   setSelectedImage(formData);
  // };

  // const imagePicker = () => {
  //   setModalVisible(true);
  // };

  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          setuseMobileAccess(user.MobileAccess);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              getBookingNo(user.BusinessID);
              //ExpHead();

              const wturl =
                BASE_URL + 'Expensehead/List?Businessid=' + user.BusinessID;
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
                      value: response.data[i].IDExpenseHead,
                      label: response.data[i].Name,
                    });
                  }
                  setEHData(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
            } else {
              Alert.alert('No Internet');
              ExpHead();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  const ExpHead = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_ExpenseHead',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDExpenseHead,
                label: results.rows.item(i).Name,
              });
            }
            setEHData(temp);
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

  const submit = async () => {
    if (useBookingNo === '') {
      Alert.alert('Type Booking Number');
    } else if (currDate === '') {
      Alert.alert('Select Booking Date');
    } else if (useEHdataLabel === '') {
      Alert.alert('Select Expense Head');
    } else if (useAmount === '') {
      Alert.alert('Type Booking Amount');
    } else if (useRemarks === '') {
      Alert.alert('Type Remarks');
    }
    //  else
    // {
    //   const data_api = {
    //     IDBooking: 0,
    //     Bookingno: useBookingNo,
    //     BookingDate: currDate,
    //     BookingAmount: useAmount,
    //     BookingRemarks: useRemarks,
    //     IDEmployee: useIDEmployee,
    //     IDExpenseHead: useEHdataValue,
    //     // AddExpName: useExpenseName,
    //     // AddExpRemarks: useARemarks,
    //     // AddExpAmount: useAAmount,
    //     AddExpUploadPath: '',
    //     CreatedBy: empEmail,
    //     Businessid: useBusinessID,
    //     Entrytype: 'MOBILE_' + deviceType,
    //   };
    //   //console.log(data_api);

    //   //   let result = await fetch(BASE_URL + 'ExpenseBooking/AddEdit', {
    //   //     method: 'POST',
    //   //     headers: {
    //   //       Accept: 'application/json',
    //   //       'Content-Type': 'application/json',
    //   //     },
    //   //     body: JSON.stringify(data_api),
    //   //   });

    //   //   result = await result.json();
    //   //   console.log(result);
    //   //   if (result.result === '') {
    //   //     Alert.alert(
    //   //       'Success',
    //   //       'Record Successfully Saved',
    //   //       [
    //   //         {
    //   //           text: 'Ok',
    //   //           //onPress: () => navigation.navigate('Report DashBoard'),
    //   //           onPress: () => navigation.navigate('AppNavScreen'),
    //   //         },
    //   //       ],
    //   //       {cancelable: false},
    //   //     );
    //   //   } else {
    //   //     Alert.alert('Else : ' + result.result);
    //   //   }
    //    if (useMobileAccess === 'ONLINE') {
    //     NetInfo.fetch().then(async state => {
    //       if (state.isConnected) {
    //         let result = await fetch(BASE_URL + 'ExpenseBooking/AddEdit', {
    //           method: 'POST',
    //           headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify(data_api),
    //         });

    //         result = await result.json();
    //         //console.log(result);
    //         if (result.result === '') {
    //           Alert.alert(
    //             'Success',
    //             'Record Successfully Saved',
    //             [
    //               {
    //                 text: 'Ok',
    //                 //onPress: () => navigation.navigate('Report DashBoard'),
    //                 onPress: () => navigation.navigate('AppNavScreen'),
    //               },
    //             ],
    //             {cancelable: false},
    //           );
    //         } else {
    //           Alert.alert('Else : ' + result.result);
    //         }
    //       } else {
    //         Alert.alert('You are Offline Contact With Administrator!');
    //       }
    //     }, []);
    //   }
    // else if (useMobileAccess === 'ONLINE & OFFLINE') {
    //     NetInfo.fetch().then(async state => {
    //       if (state.isConnected) {
    //         let result = await fetch(BASE_URL + 'ExpenseBooking/AddEdit', {
    //           method: 'POST',
    //           headers: {
    //             Accept: 'application/json',
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify(data_api),
    //         });

    //         result = await result.json();
    //         //console.log(result);
    //         if (result.result === '') {
    //           Alert.alert(
    //             'Success',
    //             'Record Successfully Saved',
    //             [
    //               {
    //                 text: 'Ok',
    //                 //onPress: () => navigation.navigate('Report DashBoard'),
    //                 onPress: () => navigation.navigate('AppNavScreen'),
    //               },
    //             ],
    //             {cancelable: false},
    //           );
    //         } else {
    //           Alert.alert('Else : ' + result.result);
    //         }
    //       }
    // else {
    //         db.transaction(txn => {
    //           ///txn.executeSql('DELETE from CRM_UnlistedCode');
    //           txn.executeSql(
    //             'CREATE TABLE IF NOT EXISTS CRM_ExpenseCode(id INTEGER PRIMARY KEY AUTOINCREMENT,TestValue VARCHAR)',
    //             [],
    //           );
    //         });

    //         let sql = 'INSERT INTO CRM_ExpenseCode(TestValue) VALUES (?)';
    //         let params = [useAmount]; //storing user data in an array
    //         db.executeSql(sql, params);

    //         db.transaction(tx => {
    //           tx.executeSql(
    //             'SELECT * FROM CRM_ExpenseCode',
    //             [],
    //             (_, results) => {
    //               if (results.rows.length > 0) {
    //                 //console.warn('Table has data');
    //                 var temp = [];
    //                 for (let i = 0; i < results.rows.length; ++i) {
    //                   temp.push(results.rows.item(i).id);
    //                 }
    //                 var res = temp.toString();
    //                 //setCode(res);
    //                 //console.warn(res);
    //                 saveData(res);
    //               }
    //             },
    //             (_, error) => {
    //               console.log('Error fetching data:', error);
    //             },
    //           );
    //         });
    //       }
    //     }, []);
    //   } else {
    //     Alert.alert('Contact With Administrator!');
    //     //Alert.alert(useMobileAccess);
    //   }
    // }
    else {
      let formData = new FormData();
      formData.append('IDBooking', '0');
      formData.append('Bookingno', useBookingNo);
      formData.append('BookingDate', currDate);
      formData.append('BookingAmount', useAmount);
      formData.append('BookingRemarks', useRemarks);
      formData.append('IDEmployee', useIDEmployee);
      formData.append('IDExpenseHead', useEHdataValue);
      formData.append('CreatedBy', empEmail);
      formData.append('Businessid', useBusinessID);
      formData.append('Entrytype', 'MOBILE_' + deviceType);
      formData.append('File', {
        uri: selectedImage, // Replace with actual path
        type: selectedImageType,
        name: selectedImageName,
      });
      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              let response = await fetch(BASE_URL + 'ExpenseBooking/AddEdit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                body: formData,
              });

              let result = await response.json();
              console.log('Response:', result);
              if (result.result === '') {
                Alert.alert(
                  'Success',
                  'Record Successfully Saved',
                  [
                    {
                      text: 'Ok',
                      //onPress: () => navigation.navigate('Report DashBoard'),
                      onPress: () => navigation.navigate('AppNavScreen'),
                    },
                  ],
                  {cancelable: false},
                );
              } else {
                Alert.alert('Else : ' + result.result);
              }
            } catch (error) {
              console.error('Error uploading:', error);
            }
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              let response = await fetch(BASE_URL + 'ExpenseBooking/AddEdit', {
                method: 'POST',
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                body: formData,
              });

              let result = await response.json();
              console.log('Response:', result);
              if (result.result === '') {
                Alert.alert(
                  'Success',
                  'Record Successfully Saved',
                  [
                    {
                      text: 'Ok',
                      //onPress: () => navigation.navigate('Report DashBoard'),
                      onPress: () => navigation.navigate('AppNavScreen'),
                    },
                  ],
                  {cancelable: false},
                );
              } else {
                Alert.alert('Else : ' + result.result);
              }
            } catch (error) {
              console.error('Error uploading:', error);
            }
          } else {
            db.transaction(txn => {
              ///txn.executeSql('DELETE from CRM_UnlistedCode');
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS CRM_ExpenseCode(id INTEGER PRIMARY KEY AUTOINCREMENT,TestValue VARCHAR)',
                [],
              );
            });

            let sql = 'INSERT INTO CRM_ExpenseCode(TestValue) VALUES (?)';
            let params = [useAmount]; //storing user data in an array
            db.executeSql(sql, params);

            db.transaction(tx => {
              tx.executeSql(
                'SELECT * FROM CRM_ExpenseCode',
                [],
                (_, results) => {
                  if (results.rows.length > 0) {
                    //console.warn('Table has data');
                    var temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      temp.push(results.rows.item(i).id);
                    }
                    var res = temp.toString();
                    //setCode(res);
                    //console.warn(res);
                    saveData(res);
                  }
                },
                (_, error) => {
                  console.log('Error fetching data:', error);
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

    //console.log('uri ', selectedImage);
    //console.log('uri ', formData);
  };

  const saveData = res => {
    let deviceId = DeviceInfo.getDeviceId();
    let IDCode = deviceId + res;
    const data = {
      IDBooking: 0,
      MobileCode: IDCode,
      BookingDate: currDate,
      BookingAmount: useAmount,
      BookingRemarks: useRemarks,
      IDEmployee: useIDEmployee,
      IDExpenseHead: useEHdataValue,
      AddExpUploadPath: '',
      CreatedBy: empEmail,
      Businessid: useBusinessID,
      Entrytype: 'MOBILE_' + deviceType,
    };
    console.warn(data);

    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
        'INSERT INTO CRM_ExpenseDataSave (data) VALUES (?);',
        [JSON.stringify(data)],
        (_, result) => {
          console.log('Data inserted successfully:', result);
          navigation.navigate('AppNavScreen');
          db.transaction(txn => {
            txn.executeSql('DELETE from CRM_ExpenseCode', []);
          });
        },
        (_, error) => {
          console.log('Error inserting data:', error);
          navigation.navigate('AppNavScreen');
          db.transaction(txn => {
            txn.executeSql('DELETE from CRM_ExpenseCode', []);
          });
        },
      );
    });

    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseDataShow (IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,Approved VARCHAR,BookingAmount VARCHAR);',
        [],
        (_, result) => {
          console.log('Table created successfully:', result);
        },
        (_, error) => {
          Alert.alert('Error creating table:', error);
        },
      );
    });

    let sql =
      'INSERT INTO CRM_ExpenseDataShow(IDBooking,Bookingno,BookingDate,Approved,BookingAmount) VALUES (?,?,?,?,?)';
    let params = [0, IDCode, currDate, 'No', useAmount]; //storing user data in an array
    db.executeSql(sql, params);
  };

  const getBookingNo = async businessID => {
    try {
      const url =
        BASE_URL + 'ExpenseBooking/Bookingno?Businessid=' + businessID;
      let result = await fetch(url);
      result = await result.json();
      // console.log(result.result);
      // console.log(url);
      if (result.result === '') {
        setIsEmpty(true);
      } else {
        setBookingNo(result.result);
      }
    } catch (error) {
      Alert.alert('Error parsing JSON:', error);
    }

    // if (Object.keys(result).length === 0) {
    //   setIsEmpty(true);
    // } else {
    //   setBookingNo(result.result);
    // }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    // console.warn('A date has been picked: ', date);
    // const inputDate = new Date(date);
    // // Extract day, month, and year
    // const day = inputDate.getUTCDate();
    // const month = inputDate.getUTCMonth() + 1; // Adding 1 because months are zero-based
    // const year = inputDate.getUTCFullYear();

    // // Format the date as "DD/MM/YYYY"
    // const formattedDate = `${day < 10 ? '0' : ''}${day}/${
    //   month < 10 ? '0' : ''
    // }${month}/${year}`;

    const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();

    //console.log(formattedDate);
    setcurrDate(formattedDate);
    hideDatePicker();
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={{padding: 10, margin: 10}}>
          {isEmpty ? (
            <TextInput
              label="Booking Number"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5, fontFamily: 'Roboto-Bold'}}
              value={useBookingNo}
              onChangeText={text => setBookingNo(text)}
            />
          ) : (
            <TextInput
              label="Booking Number"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5, fontFamily: 'Roboto-Bold'}}
              value={useBookingNo}
              editable={false}
            />
          )}
          {/* <TextInput
            label="Booking Date"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginBottom: 5}}
            value={currDate}
            
            //editable={false}
          /> */}
          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              //borderWidth: 0.4,
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              marginTop: 5,
            }}
            onPress={showDatePicker}>
            <TextInput
              label="Booking Date"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5}}
              value={currDate}
              editable={false}
            />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
          <Dropdown
            style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useEHData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Expense head' : '...'}
            searchPlaceholder="Search Expense head"
            //value={wtdataLabel}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setEHdataValue(item.value);
              setEHdataLabel(item.label);
              setIsFocus(false);
            }}
          />
          <TextInput
            label="Booking Amount"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginTop: 5, marginBottom: 5}}
            keyboardType="numeric"
            value={useAmount}
            onChangeText={text => setAmount(text)}
          />
          <TextInput
            label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginBottom: 5}}
            value={useRemarks}
            onChangeText={text => setRemarks(text)}
          />
          {/*<View style={style.btnTab}>
            <Text style={style.textTab}>Additional Expense</Text>
          </View>
          <View
            style={{
              marginLeft: 5,
              marginRight: 5,
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            <TextInput
              label="Expense Name"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5}}
              value={useExpenseName}
              onChangeText={text => setExpenseName(text)}
            />
            <TextInput
              label="Remarks"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5}}
              value={useARemarks}
              onChangeText={text => setARemarks(text)}
            />
            <TextInput
              label="Amount"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{marginBottom: 5}}
              keyboardType="numeric"
              value={useAAmount}
              onChangeText={text => setAAmount(text)}
            />
          </View>
          <View style={style.btnTab}>
            <Text style={style.textTab}>Attached Picture</Text>
          </View>
          <Button title="Select Image" onPress={imagePicker} />

          {modalVisible ? (
            <View style={[style.modal, {backgroundColor: '#ecf0f1'}]}>
              <View style={style.body}>
                <View>
                  <View style={{margin: 5}}>
                    <Button title="Logout" onPress={() => onLogout()} />
                  </View>
                  <View style={{margin: 5}}>
                    <Button title="Close" onPress={() => onCancel()} />
                  </View>
                </View>
              </View>
            </View>
          ) : null}
           <View style={{alignItems: 'center', margin: 10}}>
            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={{height: 200, width: 200}}
                resizeMode="contain"
              />
            )}
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
            <View style={{margin: 5, padding: 5}}>
              <Button title="Choose from Gallery" onPress={openImagePicker} />
            </View>
            <View style={{margin: 5, padding: 5}}>
              <Button title="Open Camera" onPress={handleCameraLaunch} st />
            </View>
          </View> */}
          <View style={{alignItems: 'center', margin: 10}}>
            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={{height: 200, width: 200}}
                resizeMode="contain"
              />
            )}
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 5,
            }}>
            {/* <Button
              title="Attach Image"
              onPress={() => setModalVisible(true)}
            /> */}
            <TouchableOpacity
              style={style.button1}
              onPress={() => setModalVisible(true)}>
              <Text style={{color: '#fff'}}>Attach Image</Text>
            </TouchableOpacity>
            {/* <AvatarAlert
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
            /> */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={style.centeredView}>
                <View style={style.modalView}>
                  <TouchableOpacity
                    style={style.button}
                    onPress={handleCameraLaunch}>
                    <Text style={style.modalText}>Take Photo...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={style.button}
                    onPress={openImagePicker}>
                    <Text style={style.modalText}>Choose from Library...</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[style.button, style.cancelButton]}
                    onPress={() => setModalVisible(!modalVisible)}>
                    <Text style={style.modalText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <CustomButton label={'Submit'} onPress={() => submit()} />
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

// const handleCameraLaunch = () => {
//   const options = {
//     mediaType: 'photo',
//     includeBase64: false,
//     maxHeight: 2000,
//     maxWidth: 2000,
//   };

//   launchCamera(options, handleResponse);
//   //console.warn('Hi');
// };

//   return (
//     <View style={{flex: 1, justifyContent: 'center'}}>

//     </View>
//   );
// };

export default ExpenseScreen;
const style = StyleSheet.create({
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(50,50,50,.5)',
    justifyContent: 'center',
    margin: 50,
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
  body: {
    backgroundColor: '#fff',
    height: 300,
    width: 300,
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  button1: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#166AD4',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
  },
});
