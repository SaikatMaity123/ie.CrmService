import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import {openDatabase} from 'react-native-sqlite-storage';
//import SQLite from 'react-native-sqlite-2'
import axios from 'axios';
import moment from 'moment';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;
import CameraRoll from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

//database connection
const db = openDatabase(
  //const db = SQLite.openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const CustomDrawer = props => {
  const [empEmpno, setEmpEmpno] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useManager, setManager] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useDesignation, setDesignation] = useState('');
  const [useHQ, setHQ] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpno, setEmpno] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useTrackingTime, setTrackingTime] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [imageUrlNew, setImageUrlNew] = useState(null);
  const viewShotRef = useRef(null);
  const url = 'https://crmfieldforceapi.mendine.co.in';
  //const url = 'https://apitest.mendine.co.in';
  //Get Current Month Name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const d = new Date();
  const month = monthNames[d.getMonth()];
  const cYear = moment().year();

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

      uploadImageFiles(imageuri, fileName, fileType);
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
      uploadImageFiles(imageuri, fileName, fileType);
    }
    //setModalVisible(false);
  };

  const uploadImageFiles = async (imageuri, fileName, fileType) => {
    let formData = new FormData();
    formData.append('IDEmployee', useIDEmployee);
    formData.append('BusinessID', useBusinessID);
    formData.append('photoFile', {
      uri: imageuri, // Replace with actual path
      type: fileType,
      name: fileName,
    });

    try {
      let response = await fetch(
        BASE_URL + 'Employee/AddEmployeePhotoWithFrame',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );

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
              onPress: () => setModalVisible(false),
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
  };

  useEffect(() => {
    // NetInfo.fetch().then(async state => {
    //   if (state.isConnected) {
    //     syncData();
    //   } else {
    //     Alert.alert('No Internet');
    //   }
    // }, []);
    console.log('CameraRoll module:', CameraRoll);

    requestStoragePermission();
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setEmpEmail(user.Empemail);
          setEmpEmpno(user.Empno);
          setEmpname(user.Empname);
          setManager(user.Manager);
          setDivision(user.Division);
          setDesignation(user.Designation);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpno(user.Empno);
          setHQ(user.HQ);
          setuseManagerAccess(user.ManagerAccess);
          const cleanedPath = user.FrameFilePath.replace(/\\/g, '/');
          setImageUrlNew(`${url}${cleanedPath}`);
          //console.log(`${url}${cleanedPath}`);
          const cleanedPathProfile = user.ProfilePicPath.replace(/\\/g, '/');
          setSelectedImage(`${url}${cleanedPathProfile}`);
          console.log(`${url}${cleanedPathProfile}`);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const syncData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setTrackingTime(user.TrackingTime);

          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              Alert.alert('Sync Successful');
              areaList(user.BusinessID, user.IDHQ);
              // mangerareaList(user.BusinessID, user.IDEmployee);
              docList(user.BusinessID, user.IDEmployee);
              retList(user.BusinessID, user.IDEmployee);
              visitWithList(user.BusinessID, user.IDEmployee);
              wtDDOpen(user.BusinessID);
              //productList(user.BusinessID, user.IDDivision);
              getfinalSatge(user.BusinessID);
              doctorProductMappingOfflineList(
                user.BusinessID,
                user.Empemail,
                user.IDEmployee,
              );
              // managerDoctorProductMappingOfflineList(
              //   user.BusinessID,
              //   user.IDEmployee,
              // );
              qualificationDDOpen(user.BusinessID);
              specialityDDOpen(user.BusinessID);
              categoryDDOpen(user.BusinessID);
              productMasterDoctor(user.BusinessID, user.IDDivision);
              areaMaster(user.BusinessID, user.IDDivision, user.IDHQ);
              typeAPI(user.BusinessID);
              unlistedtypeAPI(user.BusinessID);
              //managerVWTDDOpen(user.BusinessID, user.IDDivision);
              //managerVWTDDOpen(user.BusinessID, user.IDEmployee);
              managerEmployeeWiseOfflineAreaList(
                user.BusinessID,
                user.IDEmployee,
              );
              managerEmployeeWiseOfflineDoctorList(
                user.BusinessID,
                user.IDEmployee,
              );
              managerEmployeeWiseOfflineRetailerList(
                user.BusinessID,
                user.IDEmployee,
              );
              viewMasterDocList(
                user.BusinessID,
                user.Empemail,
                user.IDEmployee,
              );
              viewMasterRetList(
                user.BusinessID,
                user.Empemail,
                user.IDEmployee,
              );

              tourdateCheck(user.BusinessID, month, cYear, user.IDEmployee);
              expenseBookingList(user.BusinessID, user.IDEmployee);
              orderbookingRetailerList(user.BusinessID, user.IDEmployee);
              expenseList(user.BusinessID, user.IDEmployee);
              expenseRequestList(user.BusinessID, user.IDEmployee);
              orderList(user.BusinessID, user.IDEmployee);
              orderBookingPrice(user.BusinessID);
              orderBookingBillingSeries(user.BusinessID);
              orderBookingProductList(user.BusinessID);
              productGift(user.BusinessID, user.IDDivision);
              productSample(user.BusinessID, user.IDDivision);
              ExpenseHead(user.BusinessID);
              doctorViewDCR(user.BusinessID, user.IDEmployee);
              retailerViewDCR(user.BusinessID, user.IDEmployee);
              unlistedViewDCR(user.BusinessID, user.IDEmployee);
              employeeWiseAreaList(user.BusinessID, user.IDEmployee);
              // offlineAreaList(
              //   user.BusinessID,
              //   user.IDDivision,
              //   user.IDEmployee,
              // );
              // offlineManagerDoctorList(
              //   user.BusinessID,
              //   user.IDDivision,
              //   user.IDEmployee,
              // );
              // offlineManagerRetailerList(
              //   user.BusinessID,
              //   user.IDDivision,
              //   user.IDEmployee,
              // );
              offlineOrderBookingCustomerListForManager(
                user.BusinessID,
                user.IDDivision,
                user.IDEmployee,
              );
              offlineOrderBookingCustomerList(user.BusinessID, user.IDEmployee);
              campaignData(user.BusinessID, user.IDEmployee);
              campaignproductData(user.BusinessID, user.IDEmployee);
              offlinePendingDCRDate(user.BusinessID, user.IDEmployee);
            } else {
              Alert.alert('No Internet');
              AsyncStorage.getItem('mainDashBoard')
                .then(storedValue => {
                  if (storedValue !== null) {
                    const retrievedJsonArray = JSON.parse(storedValue);
                    console.log('Retrieved JSON array:', retrievedJsonArray);
                    //setData(retrievedJsonArray);
                  } else {
                    Alert.alert(
                      'No data found in AsyncStorage for the specified key.',
                    );
                  }
                })
                .catch(error => {
                  Alert.alert('Error retrieving JSON array:', error);
                });
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  };

  const areaList = (businessID, hqID) => {
    const aturl =
      BASE_URL +
      'Employee/EmpAreaList?Businessid=' +
      businessID +
      '&IDHQ=' +
      hqID;
    console.log('aturl ' + aturl);
    var config = {
      method: 'get',
      url: aturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_AreaList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_AreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_AreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_AreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  // const mangerareaList = (businessID, IDEmployee) => {
  //   const aturl =
  //     BASE_URL +
  //     'Manager/Area/List?Businessid=' +
  //     businessID +
  //     '&IDManager=' +
  //     IDEmployee;
  //   console.log('aturl ' + aturl);
  //   var config = {
  //     method: 'get',
  //     url: aturl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_AreaList
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS CRM_MangerAreaList', []);
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_MangerAreaList(IDArea INTEGER,Name VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT AreaListTBL
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql = 'INSERT INTO CRM_MangerAreaList(IDArea,Name) VALUES (?,?)';
  //         let params = [array.IDArea, array.Name]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  const docList = (businessID, empID) => {
    const docurl =
      BASE_URL +
      'Doctor/OfflineDoctorList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('docurl ' + docurl);
    var config = {
      method: 'get',
      url: docurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_DocList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_DocList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DocList(IDDoctor INTEGER,Code INTEGER,IDArea INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name TEXT)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DocList(IDDoctor,Code,IDArea,Latitude,Longitude,Name) VALUES (?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.Code,
            array.IDArea,
            array.Latitude1,
            array.Longitude1,
            array.Name,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const retList = (businessID, empID) => {
    const returl =
      BASE_URL +
      'Retailer/OfflineRetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      empID;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_RetList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_RetList(IDRetailer INTEGER,Code INTEGER,Latitude NUMERIC,Longitude NUMERIC,Name TEXT,Area TEXT,OtherCode TEXT)',
            [],
          );
        });

        //SQLITE INSERT AreaListTBL
        var _value = [];
        _value = response.data.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_RetList(IDRetailer,Code,Latitude,Longitude,Name,Area,OtherCode) VALUES (?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.Latitude,
            array.Longitude,
            array.Name,
            array.Area.IDArea,
            array.OtherCode,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const doctorProductMappingOfflineList = (businessID, empEmail, idEmp) => {
    const returl =
      BASE_URL +
      'Doctor/DoctorProductMappingOfflineList?Businessid=' +
      businessID +
      '&employeeEmail=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log('returl ' + returl);
    var config = {
      method: 'get',
      url: returl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data.d);
        //CREATE TABLE for CRM_RetList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_DoctorProductMappingListt',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_DoctorProductMappingListt(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_DoctorProductMappingListt
        var _value = [];
        _value = response.data.d;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          //let duplicateData = 'DELETE from CRM_DocList';
          let sql =
            'INSERT INTO CRM_DoctorProductMappingListt(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDProduct,
            array.IDStage,
            array.ProductName,
            array.StageName,
          ]; //storing user data in an array

          db.executeSql(sql, params);
        }
        //console.log(_value);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  // const managerDoctorProductMappingOfflineList = (businessID, idemp) => {
  //   const returl =
  //     BASE_URL +
  //     'Doctor/ManagerDoctorProductMappingOfflineList?Businessid=' +
  //     businessID +
  //     '&IDManager=' +
  //     idemp;
  //   console.log('returl ' + returl);
  //   var config = {
  //     method: 'get',
  //     url: returl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //console.log(response.data.d);
  //       //CREATE TABLE for CRM_RetList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_ManagerDoctorProductMappingOfflineList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_ManagerDoctorProductMappingOfflineList(IDDoctor INTEGER,IDProduct INTEGER,IDStage INTEGER,ProductName VARCHAR,StageName VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_DoctorProductMappingListt
  //       var _value = [];
  //       _value = response.data.d;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         //let duplicateData = 'DELETE from CRM_DocList';
  //         let sql =
  //           'INSERT INTO CRM_ManagerDoctorProductMappingOfflineList(IDDoctor,IDProduct,IDStage,ProductName,StageName) VALUES (?,?,?,?,?)';
  //         let params = [
  //           array.IDDoctor,
  //           array.IDProduct,
  //           array.IDStage,
  //           array.ProductName,
  //           array.StageName,
  //         ]; //storing user data in an array

  //         db.executeSql(sql, params);
  //       }
  //       //console.log(_value);
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  const visitWithList = (businessID, idemp) => {
    const vwturl =
      BASE_URL +
      'Employee/EmployeeUpwardManagerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(vwturl);
    var config = {
      method: 'get',
      url: vwturl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));

        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_VisitWithList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_VisitWithList(IDEmployee INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_VisitWithList(IDEmployee,Name) VALUES (?,?)';
          let params = [array.IDEmployee, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const employeeWiseAreaList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'Area/EmployeeWiseAreaList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_EmployeeWiseAreaList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_EmployeeWiseAreaList(IDArea INTEGER,Name VARCHAR,AreaType VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_EmployeeWiseAreaList(IDArea,Name,AreaType) VALUES (?,?,?)';
          let params = [array.IDArea, array.Name, array.AreaType]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  // const offlineAreaList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'Area/OfflineAreaList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS CRM_offlineAreaList', []);
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineAreaList(IDArea INTEGER,IDHQ INTEGER,IDEmployee INTEGER,AreaName VARCHAR,EmployeeName VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineAreaList(IDArea,IDHQ,IDEmployee,AreaName,EmployeeName) VALUES (?,?,?,?,?)';
  //         let params = [
  //           array.IDArea,
  //           array.IDHQ,
  //           array.IDEmployee,
  //           array.AreaName,
  //           array.EmployeeName,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  // const offlineManagerDoctorList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'manager/DCR/OfflineManagerDoctorList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_offlineManagerDoctorList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineManagerDoctorList(IDDoctor INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineManagerDoctorList(IDDoctor,IDEmployee,IDArea,Name,Latitude,Longitude) VALUES (?,?,?,?,?,?)';
  //         let params = [
  //           array.IDDoctor,
  //           array.IDEmployee,
  //           array.IDArea,
  //           array.Name,
  //           array.Latitude,
  //           array.Longitude,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  // const offlineManagerRetailerList = (businessID, idDiv, idemp) => {
  //   const areaurl =
  //     BASE_URL +
  //     'manager/DCR/OfflineManagerRetailerList?Businessid=' +
  //     businessID +
  //     '&IDDivision=' +
  //     idDiv +
  //     '&IDEmployee=' +
  //     idemp;
  //   console.log('returl ' + areaurl);
  //   var config = {
  //     method: 'get',
  //     url: areaurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for CRM_VisitWithList
  //       db.transaction(txn => {
  //         txn.executeSql(
  //           'DROP TABLE IF EXISTS CRM_offlineManagerRetailerList',
  //           [],
  //         );
  //         txn.executeSql(
  //           'CREATE TABLE IF NOT EXISTS CRM_offlineManagerRetailerList(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT CRM_VisitWithList
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           'INSERT INTO CRM_offlineManagerRetailerList(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
  //         let params = [
  //           array.IDRetailer,
  //           array.IDEmployee,
  //           array.IDArea,
  //           array.Name,
  //         ]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };

  const offlineOrderBookingCustomerListForManager = (
    businessID,
    idDiv,
    idemp,
  ) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerListForManager?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerListForManager',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerListForManager(IDRetailer INTEGER,IDEmployee INTEGER,IDArea INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerListForManager(IDRetailer,IDEmployee,IDArea,Name) VALUES (?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDEmployee,
            array.IDArea,
            array.Name,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //Alert.alert(sql + ' ' + params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const offlineOrderBookingCustomerList = (businessID, idemp) => {
    const areaurl =
      BASE_URL +
      'OrderBooking/OfflineOrderBookingCustomerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log('returl ' + areaurl);
    var config = {
      method: 'get',
      url: areaurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for CRM_VisitWithList
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS CRM_offlineOrderBookingCustomerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlineOrderBookingCustomerList(IDRetailer INTEGER,Code VARCHAR,OtherCode VARCHAR,Name VARCHAR,IDArea INTEGER)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_offlineOrderBookingCustomerList(IDRetailer,Code,OtherCode,Name,IDArea) VALUES (?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.Code,
            array.OtherCode,
            array.Name,
            array.IDArea,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignData = (businessID, idemp) => {
    const campurl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(campurl);
    var config = {
      method: 'get',
      url: campurl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_Campaign', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Campaign(IDCampaign VARCHAR,Campaign VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_Campaign(IDCampaign,Campaign) VALUES (?,?)';
          let params = [array.IDCampaign, array.Campaign]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const campaignproductData = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Campaign/EmployeeWiseCampaignList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_CampaignProduct', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_CampaignProduct(IDProduct VARCHAR,Product VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_VisitWithList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_CampaignProduct(IDProduct,Product) VALUES (?,?)';
          let params = [array.IDProduct, array.Product]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const offlinePendingDCRDate = (businessID, idemp) => {
    const produrl =
      BASE_URL +
      'Configuration/OfflinePendingDCRDate?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idemp;
    console.log(produrl);
    var config = {
      method: 'get',
      url: produrl,
    };

    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_offlinePendingDCRDate', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_offlinePendingDCRDate(DCRDate VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT CRM_offlinePendingDCRDate
        var _value = [];
        _value = response.data;
        console.log('_value', _value);

        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_offlinePendingDCRDate(DCRDate) VALUES (?)';
          let params = [array.DCRDate]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const wtDDOpen = businessID => {
    //console.log(useBusinessID);
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=WORKTYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //CREATE TABLE for WorkTypeTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_WorkTypeList', []);
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_WorkTypeList(IDMisc INTEGER,Name VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT WorkTypeTBL
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO CRM_WorkTypeList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const productGift = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=GIFT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_GIFT', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_GIFT(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_GIFT(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const productSample = (businessID, idDiv) => {
    const prdurl =
      BASE_URL +
      'Product/ProductDivisionSampleGiftList?Businessid=' +
      businessID +
      '&IDDivision=' +
      idDiv +
      '&Type=DOCTORPRODUCT';
    console.log(prdurl);
    var config = {
      method: 'get',
      url: prdurl,
    };

    axios(config)
      .then(function (response) {
        //console.log(response.data);

        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_SAMPLE', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_SAMPLE(IDProduct INTEGER,Code VARCHAR,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_productList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql =
            'INSERT INTO CRM_SAMPLE(IDProduct,Code,Name) VALUES (?,?,?)';
          let params = [array.IDProduct, array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const getfinalSatge = async businessID => {
    const finalurl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=TARGET';
    console.log(finalurl);
    var config = {
      method: 'get',
      url: finalurl,
    };
    axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_finalStageList', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_finalStageList(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_finalStageList
        var _value = [];
        _value = response.data;
        for (var i = 0; i < _value.length; i++) {
          const array = _value[i];

          let sql = 'INSERT INTO CRM_finalStageList(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const qualificationDDOpen = businessID => {
    //console.log(useBusinessID);
    const qurl =
      BASE_URL + 'Qualification/QualificationList?Businessid=' + businessID;
    console.log(qurl);
    var config = {
      method: 'get',
      url: qurl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Qualification', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Qualification(IDQualification INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var qualificationArray = [];
        qualificationArray = response.data;
        for (var i = 0; i < qualificationArray.length; i++) {
          const array = qualificationArray[i];

          let sql =
            'INSERT INTO CRM_Qualification(IDQualification,Name) VALUES (?,?)';
          let params = [array.IDQualification, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const specialityDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Speciality/SpecialityList?Businessid=' + businessID;
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Speciality', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Speciality(IDSpeciality INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              console.error('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Speciality(IDSpeciality,Name) VALUES (?,?)';
          let params = [array.IDSpeciality, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const categoryDDOpen = businessID => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=PRODUCTCLASS';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Category', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Category(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Category(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const productMasterDoctor = (businessID, IDDivision) => {
    //console.log(useBusinessID);
    const surl =
      BASE_URL +
      //'Product/ProductListDivisionWise?Businessid=' +
      'Product/ProductDivisionTypeList?Businessid=' +
      businessID +
      '&IDDivision=' +
      IDDivision +
      '&Type=DOCTORPRODUCT';
    console.log(surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Doctor_Product', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Doctor_Product(IDProduct INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql =
            'INSERT INTO CRM_Master_Doctor_Product(IDProduct,Name) VALUES (?,?)';
          let params = [array.IDProduct, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const areaMaster = (businessID, empEmail, IDHQ) => {
    // const surl =
    //   BASE_URL +
    //   'Area/DivisionWiseAreaList?Businessid=' +
    //   businessID +
    //   '&IDDivision=' +
    //   empEmail;
    const surl =
      BASE_URL +
      'Area/DivisionAndHQWiseAreaList?Businessid=' +
      businessID +
      '&IDDivision=' +
      empEmail +
      '&IDHQ=' +
      IDHQ;
    console.log('surllll', surl);
    var config = {
      method: 'get',
      url: surl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Area', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Area(IDArea INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Qualification
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Area(IDArea,Name) VALUES (?,?)';
          let params = [array.IDArea, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const typeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=RETAILERTYPE';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Master_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Master_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Master_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const unlistedtypeAPI = businessID => {
    const turl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=UNLISTED';
    console.log(turl);
    var config = {
      method: 'get',
      url: turl,
    };
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        db.transaction(tx => {
          tx.executeSql('DROP TABLE IF EXISTS CRM_Unlisted_Type', []);
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_Unlisted_Type(IDMisc INTEGER,Name VARCHAR)',
            [],
            (tx, results) => {
              //console.log('Table created successfully');
            },
            error => {
              Alert.alert('Error creating table:', error);
            },
          );
        });

        //SQLITE INSERT CRM_Master_Type
        var specialityArray = [];
        specialityArray = response.data;
        for (var i = 0; i < specialityArray.length; i++) {
          const array = specialityArray[i];
          let sql = 'INSERT INTO CRM_Unlisted_Type(IDMisc,Name) VALUES (?,?)';
          let params = [array.IDMisc, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log(params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  // const managerVWTDDOpen = (businessID, IDEmployee) => {
  //   //console.log(useBusinessID);
  //   const empurl =
  //     // BASE_URL +
  //     // 'Employee/DivisionWiseEmployeeList?Businessid=' +
  //     // businessID +
  //     // '&IDDivision=' +
  //     // IDDivision +
  //     // '&IDEmployeeDesignation=0';

  //     BASE_URL +
  //     'Employee/Hierarchy/All?Businessid=' +
  //     businessID +
  //     '&IDEmployee=' +
  //     IDEmployee;
  //   console.log(empurl);
  //   var config = {
  //     method: 'get',
  //     url: empurl,
  //   };
  //   axios(config)
  //     .then(function (response) {
  //       //CREATE TABLE for MangerVisitWithTBL
  //       db.transaction(txn => {
  //         txn.executeSql('DROP TABLE IF EXISTS MangerVisitWithTBL', []);
  //         txn.executeSql(
  //           //'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(Name VARCHAR,IDEmployee VARCHAR)',
  //           'CREATE TABLE IF NOT EXISTS MangerVisitWithTBL(EmployeeName VARCHAR,IDEmployee VARCHAR)',
  //           [],
  //         );
  //       });

  //       //SQLITE INSERT MangerVisitWithTBL
  //       var _value = [];
  //       _value = response.data;
  //       for (var j = 0; j < _value.length; j++) {
  //         const array = _value[j];
  //         let sql =
  //           //'INSERT INTO MangerVisitWithTBL(Name,IDEmployee) VALUES (?,?)';
  //           'INSERT INTO MangerVisitWithTBL(EmployeeName,IDEmployee) VALUES (?,?)';
  //         //let params = [array.Name, array.IDEmployee]; //storing user data in an array
  //         let params = [array.EmployeeName, array.IDEmployee]; //storing user data in an array
  //         db.executeSql(sql, params);
  //       }
  //     })
  //     .catch(function (error) {
  //       Alert.alert(error);
  //     });
  // };
  const managerEmployeeWiseOfflineAreaList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Area/ManagerEmployeeWiseOfflineAreaList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseAreaList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseAreaList(Name VARCHAR,IDArea VARCHAR,IDEmployee VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseAreaList(Name,IDArea,IDEmployee) VALUES (?,?,?)';
          let params = [array.Name, array.IDArea, array.IDEmployee]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineDoctorList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/ManagerEmployeeWiseOfflineDoctorList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseDoctorList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseDoctorList(IDDoctor INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude1 VARCHAR,Longitude1 VARCHAR)',
            [],
          );
        });

        //SQLITE INSERT ManagerEmployeeWiseAreaList
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseDoctorList(IDDoctor,IDArea,Name,AreaName,IDEmployee,Code,Latitude1,Longitude1) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDDoctor,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude1,
            array.Longitude1,
          ]; //storing user data in an array
          db.executeSql(sql, params);
          //console.log('ProductName',array.Product.ProductName);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const managerEmployeeWiseOfflineRetailerList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/ManagerEmployeeWiseOfflineRetailerList?Businessid=' +
      businessID +
      '&IDManager=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql(
            'DROP TABLE IF EXISTS ManagerEmployeeWiseRetailerList',
            [],
          );
          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ManagerEmployeeWiseRetailerList(IDRetailer INTEGER,IDArea INTEGER,Name VARCHAR,AreaName VARCHAR,IDEmployee VARCHAR,Code VARCHAR,Latitude VARCHAR,Longitude VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ManagerEmployeeWiseRetailerList(IDRetailer,IDArea,Name,AreaName,IDEmployee,Code,Latitude,Longitude) VALUES (?,?,?,?,?,?,?,?)';
          let params = [
            array.IDRetailer,
            array.IDArea,
            array.Name,
            array.AreaName,
            array.IDEmployee,
            array.Code,
            array.Latitude,
            array.Longitude,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const viewMasterDocList = (businessID, empEmail, idEmp) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Doctor/Mobile/List?Businessid=' +
      businessID +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        // db.transaction(txn => {
        //   //txn.executeSql('DROP TABLE IF EXISTS ViewMasterDocList', []);
        //   txn.executeSql(
        //     'CREATE TABLE IF NOT EXISTS ViewMasterDocList(IDDoctor INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
        //     [],
        //   );
        // });
        // var _value = [];
        // _value = response.data;
        // for (var j = 0; j < _value.length; j++) {
        //   const array = _value[j];
        //   let sql =
        //     'INSERT INTO ViewMasterDocList(IDDoctor,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
        //   let params = [
        //     array.IDDoctor,
        //     array.Code,
        //     array.Name,
        //     array.Area,
        //     array.ApprovalStatus,
        //   ]; //storing user data in an array
        //   db.executeSql(sql, params);
        // }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const viewMasterRetList = (businessID, empEmail, idEmp) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'Retailer/Mobile/List?Businessid=' +
      businessID +
      '&EntryUser=' +
      empEmail +
      '&IDEmployee=' +
      idEmp;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        // db.transaction(txn => {
        //   //txn.executeSql('DROP TABLE IF EXISTS ViewMasterRetList', []);
        //   txn.executeSql(
        //     'CREATE TABLE IF NOT EXISTS ViewMasterRetList(IDRetailer INTEGER,Code VARCHAR,Name VARCHAR,Area VARCHAR,ApprovalStatus NUMERIC)',
        //     [],
        //   );
        // });
        // var _value = [];
        // _value = response.data;
        // for (var j = 0; j < _value.length; j++) {
        //   const array = _value[j];
        //   let sql =
        //     'INSERT INTO ViewMasterRetList(IDRetailer,Code,Name,Area,ApprovalStatus) VALUES (?,?,?,?,?)';
        //   let params = [
        //     array.IDRetailer,
        //     array.Code,
        //     array.Name,
        //     array.Area,
        //     array.ApprovalStatus,
        //   ]; //storing user data in an array
        //   db.executeSql(sql, params);
        // }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const expenseBookingList = (businessID, IDEmployee) => {
    //console.log(useBusinessID);
    const empurl =
      BASE_URL +
      'ExpenseBooking/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      IDEmployee;
    console.log(empurl);
    var config = {
      method: 'get',
      url: empurl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS ViewExpenseBookingList', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS ViewExpenseBookingList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO ViewExpenseBookingList(IDBooking,Bookingno,BookingDate,BookingAmount) VALUES (?,?,?,?)';
          let params = [
            array.IDBooking,
            array.Bookingno,
            array.BookingDate,
            array.BookingAmount,
          ]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderbookingRetailerList = (businessID, idEmp) => {
    const retUrl =
      BASE_URL +
      'Retailer/RetailerList?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log('retUrl ' + retUrl);
    var config = {
      method: 'get',
      url: retUrl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingRetList', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingRetList(OtherCode VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingRetList(OtherCode,Name) VALUES (?,?)';
          let params = [array.OtherCode, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderBookingPrice = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=ORDERPRICETYPE';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingPrice', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingPrice(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });

        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql = 'INSERT INTO OrderBookingPrice(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const orderBookingBillingSeries = businessID => {
    const wturl =
      BASE_URL + 'Misc/List?Businessid=' + businessID + '&Type=BILLINGSERIES';
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS OrderBookingBillingSeries', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingBillingSeries(Code VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO OrderBookingBillingSeries(Code,Name) VALUES (?,?)';
          let params = [array.Code, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const orderBookingProductList = async businessID => {
    try {
      const url = BASE_URL + 'Product/Order/List?Businessid=' + businessID;
      console.log(url);
      let result = await fetch(url);
      result = await result.json();

      db.transaction(tx => {
        tx.executeSql('DROP TABLE IF EXISTS OrderBookingProductList', []);
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS OrderBookingProductList(IDProduct INTEGER,Code VARCHAR,Name VARCHAR,PackSize VARCHAR,MRP VARCHAR,PurRate VARCHAR)',
          [],
          (tx, results) => {
            //console.log('Table created successfully');
          },
          error => {
            Alert.alert('Error creating table:', error);
          },
        );
      });
      var _value = [];
      _value = result;
      for (var i = 0; i < _value.length; i++) {
        const array = _value[i];

        let sql =
          'INSERT INTO OrderBookingProductList(IDProduct,Code,Name,PackSize,MRP,PurRate) VALUES (?,?,?,?,?,?)';
        let params = [
          array.IDProduct,
          array.Code,
          array.Name,
          array.PackSize,
          array.MRP,
          array.PurRate,
        ]; //storing user data in an array
        db.executeSql(sql, params);
        //console.log(params);
      }
    } catch (error) {
      Alert.alert(error);
    }
  };

  const ExpenseHead = businessID => {
    const wturl = BASE_URL + 'Expensehead/List?Businessid=' + businessID;
    console.log(wturl);
    var config = {
      method: 'get',
      url: wturl,
    };
    axios(config)
      .then(function (response) {
        db.transaction(txn => {
          txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseHead', []);

          txn.executeSql(
            'CREATE TABLE IF NOT EXISTS CRM_ExpenseHead(IDExpenseHead VARCHAR,Name VARCHAR)',
            [],
          );
        });
        var _value = [];
        _value = response.data;
        //console.log('Expense HEAD', _value);
        for (var j = 0; j < _value.length; j++) {
          const array = _value[j];
          let sql =
            'INSERT INTO CRM_ExpenseHead(IDExpenseHead,Name) VALUES (?,?)';
          let params = [array.IDExpenseHead, array.Name]; //storing user data in an array
          db.executeSql(sql, params);
        }
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const expenseList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    //console.log('result',result);

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseList(IDBooking INTEGER,Bookingno VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,BookingDate VARCHAR)',
        [],
      );
    });
    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseList(IDBooking,Bookingno,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,BookingDate) VALUES (?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.BookingDate,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const orderList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'OrderBooking/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_OrderList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_OrderList(IDBooking INTEGER,BookingNo VARCHAR,BookingDate VARCHAR,EmployeeCode VARCHAR,EmployeeName VARCHAR,CustomerCode VARCHAR,CustomerName VARCHAR,ProductCode VARCHAR,ProductName VARCHAR,Division VARCHAR,Qty VARCHAR,Amount VARCHAR)',
        [],
      );
    });
    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_OrderList(IDBooking,BookingNo,BookingDate,EmployeeCode,EmployeeName,CustomerCode,CustomerName,ProductCode,ProductName,Division,Qty,Amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.BookingNo,
        array.BookingDate,
        array.EmployeeCode,
        array.EmployeeName,
        array.CustomerCode,
        array.CustomerName,
        array.ProductCode,
        array.ProductName,
        array.Division,
        array.Qty,
        array.Amount,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const expenseRequestList = async (businessID, idEmp) => {
    const url =
      BASE_URL +
      'ExpenseBooking/Mobile/Requested/List?Businessid=' +
      businessID +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();

    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_ExpenseRequestList', []);

      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_ExpenseRequestList(IDBooking INTEGER,Bookingno VARCHAR,BookingDate VARCHAR,BookingAmount VARCHAR,ExpenseHeadName VARCHAR,Requested NUMERIC,Approved VARCHAR,Rejected VARCHAR,RejectedReason VARCHAR,MonthName VARCHAR)',
        [],
      );
    });

    for (var j = 0; j < result.length; j++) {
      const array = result[j];
      //console.log('result',array);
      let sql =
        'INSERT INTO CRM_ExpenseRequestList(IDBooking,Bookingno,BookingDate,BookingAmount,ExpenseHeadName,Requested,Approved,Rejected,RejectedReason,MonthName) VALUES (?,?,?,?,?,?,?,?,?,?)';
      let params = [
        array.IDBooking,
        array.Bookingno,
        array.BookingDate,
        array.BookingAmount,
        array.ExpenseHeadName,
        array.Requested,
        array.Approved,
        array.Rejected,
        array.RejectedReason,
        array.MonthName,
      ]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const doctorViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewDocDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Doctor';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewDocDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewDocDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('doctorViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewDocDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const retailerViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_ManagerOnlineViewRetDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_ManagerOnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_ManagerOnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Retailer';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql('DROP TABLE IF EXISTS CRM_OnlineViewRetDCR', []);

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewRetDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('retailerViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewRetDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const unlistedViewDCR = (businessID, idEmp) => {
    if (useManagerAccess === true) {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Manager/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineMangerViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineMangerViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineMangerViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    } else {
      const wturl =
        BASE_URL +
        'DCR/Mobile/Msr/DCRList?Businessid=' +
        businessID +
        '&IDEmployee=' +
        idEmp +
        '&Type=Unlisted';
      console.log(wturl);
      var config = {
        method: 'get',
        url: wturl,
      };
      axios(config)
        .then(function (response) {
          db.transaction(txn => {
            txn.executeSql(
              'DROP TABLE IF EXISTS CRM_OnlineViewUnlistedDCR',
              [],
            );

            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS CRM_OnlineViewUnlistedDCR(Customer VARCHAR,Code VARCHAR,DCRDate VARCHAR,CustomerType VARCHAR)',
              [],
            );
          });
          var _value = [];
          _value = response.data.d;
          //console.log('unlistedViewDCR', _value);
          for (var j = 0; j < _value.length; j++) {
            const array = _value[j];
            let sql =
              'INSERT INTO CRM_OnlineViewUnlistedDCR(Customer,Code,DCRDate,CustomerType) VALUES (?,?,?,?)';
            let params = [
              array.Customer,
              array.Code,
              array.DCRDate,
              array.CustomerType,
            ]; //storing user data in an array
            db.executeSql(sql, params);
          }
        })
        .catch(function (error) {
          Alert.alert(error);
        });
    }
  };

  const tourdateCheck = async (businessID, month, year, idEmp) => {
    const url =
      BASE_URL +
      'TourProgram/List?Businessid=' +
      businessID +
      '&Month=' +
      month +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log('tourdateCheck', url);
    let result = await fetch(url);
    result = await result.json();

    //CREATE TABLE for CRM_TourPlanDate
    db.transaction(txn => {
      txn.executeSql('DROP TABLE IF EXISTS CRM_TourPlanDate', []);
      txn.executeSql(
        'CREATE TABLE IF NOT EXISTS CRM_TourPlanDate(TourDate VARCHAR,Approved VARCHAR)',
        [],
      );
    });

    //SQLITE INSERT CRM_TourPlanDate
    var _value = [];
    _value = result;
    //console.log(_value);
    for (var j = 0; j < _value.length; j++) {
      const array = _value[j];
      let sql = 'INSERT INTO CRM_TourPlanDate(TourDate,Approved) VALUES (?,?)';
      let params = [array.TourDate, array.Approved]; //storing user data in an array
      db.executeSql(sql, params);
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      {
        title: 'Gallery Access Permission',
        message: 'App needs access to your photos.',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const captureAndDownload = async () => {
    // const imageUrl =
    //   'https://crmfieldforceapi.mendine.co.in/UploadEmpFiles/PhotoFiles/rn_image_picker_lib_temp_ceb8fa76-1f03-4617-9d51-b85d5a5b410b.jpg';

    // // File name and path
    // const fileName = `saved_image_${Date.now()}.jpg`;
    // const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`; // Save to Downloads folder

    // try {
    //   const downloadResult = await RNFS.downloadFile({
    //     fromUrl: imageUrl,
    //     toFile: destPath,
    //   }).promise;

    //   // Check if download was successful
    //   if (downloadResult.statusCode === 200) {
    //     console.log('Image downloaded to:', destPath);
    //     Alert.alert('Download Complete', `Image saved to: ${destPath}`);
    //     setModalVisible(false);
    //     return destPath;
    //   } else {
    //     throw new Error('Download failed');
    //   }
    // } catch (err) {
    //   console.error('Image download error:', err.message);
    //   Alert.alert('Error', 'Image download failed');
    // }

    try {
      const response = await fetch(
        BASE_URL +
          'Employee/Picture/Profile?BusinessID=' +
          useBusinessID +
          '&EmployeeNo=' +
          useEmpno,
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const imagePath = await response.text(); // Assuming API returns a string
      console.log('Image Path:', imagePath);

      //const imageUrl = `https://apitest.mendine.co.in${imagePath}`;
      const imageUrl = `${url}${imagePath}`;
      console.log('Full URL:', imageUrl);

      //return fullImageUrl;

      //const imageUrl ='https://crmfieldforceapi.mendine.co.in/UploadEmpFiles/PhotoFiles/rn_image_picker_lib_temp_ceb8fa76-1f03-4617-9d51-b85d5a5b410b.jpg';

      // File name and path
      const fileName = `saved_image_${Date.now()}.jpg`;
      const destPath = `${RNFS.DownloadDirectoryPath}/${fileName}`; // Save to Downloads folder

      try {
        const downloadResult = await RNFS.downloadFile({
          fromUrl: imageUrl,
          toFile: destPath,
        }).promise;

        // Check if download was successful
        if (downloadResult.statusCode === 200) {
          console.log('Image downloaded to:', destPath);
          Alert.alert('Download Complete', `Image saved to: ${destPath}`);
          setModalVisible(false);
          return destPath;
        } else {
          throw new Error('Download failed');
        }
      } catch (err) {
        console.error('Image download error:', err.message);
        Alert.alert('Error', 'Image download failed');
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      return null;
    }
  };

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#8200d6'}}>
        <ImageBackground
          source={require('../../images/menu-bg.jpeg')}
          style={{padding: 20}}>
          {/* <Image
            source={require('../../images/user.jpg')}
            style={{height: 80, width: 80, borderRadius: 40, marginBottom: 10}}
          /> */}

          <TouchableOpacity
            style={styles.container}
            onPress={() => setModalVisible(true)}>
            {/* <Image
              //source={{ uri: 'https://your-profile-image-url.com' }} // Replace with actual profile image URL
              source={require('../../images/user.jpg')}
              style={styles.profileImage}
            /> */}

            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={styles.profileImage}
                resizeMode="contain"
              />
            )}

            {/* Frame Overlay */}

            <Image
              source={{uri: imageUrlNew}}
              style={styles.frame}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Camera Icon */}
          {/* <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => console.log('Change Picture')}>
              <Entypo name="camera" size={20} color="#fff" />
            </TouchableOpacity> */}
          {/* <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Profile Picture</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCameraLaunch}>
                  <Text style={styles.modalText}>Take Photo...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={openImagePicker}>
                  <Text style={styles.modalText}>Choose from Library...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.modalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal> */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCameraLaunch}>
                  <Text style={styles.modalText}>Take Photo...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={openImagePicker}>
                  <Text style={styles.modalText}>Choose from Library...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={captureAndDownload}>
                  <Text style={styles.modalText}>Download Image</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.modalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'Roboto-Medium',
            }}>
            {useEmpname}
          </Text>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Email : {empEmail}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Empno : {empEmpno}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Manager : {useManager}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Division : {useDivision}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Designation : {useDesignation}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              HQ : {useHQ}
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text
              style={{
                color: '#fff',
                fontFamily: 'Roboto-Regular',
                marginRight: 5,
              }}>
              Version 2.0
            </Text>
          </View>
        </ImageBackground>
        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 10}}>
          <DrawerItemList {...props} />
          <DrawerItem
            label="Sync"
            icon={() => (
              <Ionicons name="sync-outline" size={22} color={'#000'} />
            )}
            onPress={() => syncData()}
          />
        </View>
      </DrawerContentScrollView>
      {/* <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc000'}}>
        <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="share-social-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
              }}>
              Tell a Friend
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="exit-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 50,
    position: 'absolute',
    //marginBottom:50
  },
  frame: {
    //position: 'absolute',
    width: 150, // Slightly bigger than the profile image
    height: 150,
    //marginBottom:50
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default CustomDrawer;
