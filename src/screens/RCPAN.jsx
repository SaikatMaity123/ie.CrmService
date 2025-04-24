import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TextInput,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  LogBox,
  Modal,
  Button,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DeviceInfo from 'react-native-device-info';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

const RCPAN = ({ navigation }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useSelfProduct, setSelfProduct] = useState([]);
  const [useCompProduct, setCompProduct] = useState([]);
  const [useCompCompanyList, setCompCompanyList] = useState([]);
  const [useCompCompanyListCode, setCompCompanyListCode] = useState('');
  const [useCompCompanyListName, setCompCompanyListName] = useState('');
  const [useSelfProductCode, setSelfProductCode] = useState('');
  const [useSelfProductName, setSelfProductName] = useState('');
  const [useSelfTProductCode, setSelfTProductCode] = useState('');
  const [useSelfTProductName, setSelfTProductName] = useState('');
  const [useCompProductCode, setCompProductCode] = useState('');
  const [useCompProductName, setCompProductName] = useState('');
  const [useUnitCode, setUnitCode] = useState('');
  const [useUnitName, setUnitName] = useState('');
  const [useUnit, setUnit] = useState([]);
  const [useMRP, setMRP] = useState('');
  const [useLot, setLot] = useState('');
  const [usePackSize, setPackSize] = useState('');
  const [useRackStock, setRackStock] = useState('');
  const [useCompProdName, setCompProdName] = useState('');
  const [useCompCompanyName, setCompCompanyName] = useState('');
  const [useCompAddPackSize, setCompAddPackSize] = useState('');
  const [useMCPN, setMCPN] = useState('');
  const [useMCCN, setMCCN] = useState('');
  const [useDLabel, setDLabel] = useState('');
  const [useDValue, setDValue] = useState('');
  const [useDoctor, setDoctor] = useState([]);
  const [usedoctorData, setdoctorData] = useState([]);
  const [uselfData, selfData] = useState([]);
  const [uselfTData, selfTData] = useState([]);
  const [useQty, setQty] = useState('');
  const [isModalCProduct, setModalCProduct] = useState(false);
  const [isModalCCompany, setModalCCompany] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVVisible, setModalVVisible] = useState(false);
  const [showRData, setshowRData] = useState(true);
  const [showSData, setshowSData] = useState(false);
  const [showCData, setshowCData] = useState(false);
  const [showMCData, setshowMCData] = useState(false);
  const [useArea, setArea] = useState([]);
  const [useIdRcpa, setIdRcpa] = useState('');
  const [docLabel, setdocLabel] = useState('');
  const [docValue, setdocValue] = useState('');
  const [useALabel, setALabel] = useState('');
  const [useAValue, setAValue] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useAutoNo, setAutoNo] = useState('');
  const [useIDDesignation, setIDDesignation] = useState('');
  const [deviceType, setDevice] = useState('');
  const [useEmpemail, setEmpemail] = useState('');
  const [useCompProdCode, setCompProdCode] = useState('');
  const [useCompProdCompany, setCompProdCompany] = useState('');
  const [dataList, setDataList] = useState([]);
  const [CompetitorAdded, setCompetitorAdded] = useState(true); //  Track apply status


  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!CompetitorAdded) {
          Alert.alert('Hold On, competitor Product Not Found!', 'Add 1 competitor Product before going back.');
          return true; // Prevent default back
        }

        // Reset navigation if Add product is applied
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppNavDCRScreen' }],
        });
        return true; // Prevent default back
      };

      const beforeRemoveListener = (e) => {
        if (!CompetitorAdded) {
          e.preventDefault();
          Alert.alert('Hold On, competitor Product Not Found!', 'Add 1 competitor Product before going back.');
        }
      };

      // Add listeners
      const backHandlerSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      const beforeRemoveSubscription = navigation.addListener('beforeRemove', beforeRemoveListener);

      // Clean up
      return () => {
        backHandlerSubscription.remove();
        beforeRemoveSubscription();
      };
    }, [CompetitorAdded, navigation])
  );


  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
      'Error fetching data: [TypeError: Cannot read property toString of undefined]',
      'Error fetching data: [TypeError: Cannot read property "toString" of undefined]',
    ]);
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
          setuseManagerAccess(user.ManagerAccess);
          setuseMobileAccess(user.MobileAccess);
          setIDDivision(user.IDDivision);
          setIDDesignation(user.IDDesignation);
          setEmpemail(user.Empemail);

          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const url =
                BASE_URL + 'RCPA/AutoNo?Businessid=' + user.BusinessID;
              console.log(url);
              let result = await fetch(url);
              result = await result.json();
              setAutoNo(result.result);
              console.log(result.result);

              const selfprodurl =
                BASE_URL +
                'Product/ProductList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=DOCTORPRODUCT';
              console.log('returl ' + selfprodurl);
              var config = {
                method: 'get',
                url: selfprodurl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  //console.log(wtNameArray);

                  setSelfProduct(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const compprodurl =
                BASE_URL +
                'Product/RCPA/CompititorProductList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision;
              console.log('returl ' + compprodurl);
              var config = {
                method: 'get',
                url: compprodurl,
              };
              axios(config)
                .then(function (response) {
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDProduct,
                      label: response.data[i].Name,
                    });
                  }
                  //console.log(wtNameArray);

                  setCompProduct(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              // const compCompany =
              //   BASE_URL +
              //   'Product/RCPA/CompititorCompanyList?Businessid=' +
              //   user.BusinessID;
              // console.log('returl ' + compCompany);
              // var config = {
              //   method: 'get',
              //   url: compCompany,
              // };
              // axios(config)
              //   .then(function (response) {
              //     var count = Object.keys(response.data).length;
              //     let wtNameArray = [];
              //     for (var i = 0; i < count; i++) {
              //       wtNameArray.push({
              //         //value: response.data[i].Value,
              //         value: response.data[i].IDCompititor,
              //         label: response.data[i].Name,
              //       });
              //     }
              //     //console.log(wtNameArray);

              //     setCompCompanyList(wtNameArray);
              //   })
              //   .catch(function (error) {
              //     Alert.alert(error);
              //   });

              // const uniturl =
              //   BASE_URL +
              //   'Misc/List?Businessid=' +
              //   user.BusinessID +
              //   '&Type=PRODUCTUNIT';
              // console.log('returl ' + uniturl);
              // var config = {
              //   method: 'get',
              //   url: uniturl,
              // };

              const empurl =
                BASE_URL +
                'Doctor/DoctorList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log(empurl);
              var config = {
                method: 'get',
                url: empurl,
              };
              axios(config)
                .then(function (response) {
                  //CREATE TABLE for MangerVisitWithTBL
                  var count = Object.keys(response.data).length;
                  let wtNameArray = [];
                  for (var i = 0; i < count; i++) {
                    wtNameArray.push({
                      //value: response.data[i].Value,
                      value: response.data[i].IDDoctor,
                      //key: response.data[i].IDDoctor,
                      label:
                        response.data[i].Name + ' ' + response.data[i].Code,
                    });
                  }
                  setDoctor(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const areaurl =
                BASE_URL +
                'Area/EmployeeWiseAreaList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log('returl ' + areaurl);
              var config = {
                method: 'get',
                url: areaurl,
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
                  //console.log(wtNameArray);

                  setArea(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });
            } else {
              //fetchOfflineTableData(user.ManagerAccess);
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  const addSelf = async () => {
    if (dataList.length === 0) {
      Alert.alert('Select Atleast 1 Doctor');
    } else {
      let docData = [];
      let prodData = [];

      dataList.map(function (value) {
        docData.push({
          IDOwnProduct: value.selfprodCode,
          IDOwnDoctor: value.docCode,
          OwnWeekQty: value.Qty,
          // Product: value.selfprodName,
          // OwnDoctor: value.docName,
        });
      });

      dataList.map(function (value) {
        prodData.push({
          IDOwnProduct: value.selfprodCode,
          IDOWnUnit: value.packUnitCode,
          OwnPack: value.packsize,
          OwnMRP: value.mrp,
          OwnLot: value.lot,
          OwnRack: value.rackstock,
          // Product: value.selfprodName,
          // Unit: value.packUnitName,
        });
      });

      const uniqueProducts = prodData.filter(
        (product, index, self) =>
          index ===
          self.findIndex(
            p =>
              p.IDOwnProduct === product.IDOwnProduct &&
              p.OwnLot === product.OwnLot &&
              p.OwnRack === product.OwnRack,
          ),
      );
      const data_api = {
        IDRCPA: 0,
        NO: useAutoNo,
        IDDivision: useIDDivision,
        IDDesignation: useIDDesignation,
        IDEmployee: useIDEmployee,
        IDRetailer: docValue,
        IDArea: useAValue,
        User: useEmpemail,
        DecviceType: deviceType,
        Businessid: useBusinessID,
        OwnDoctors: docData,
        //OwnProducts: prodData,
        OwnProducts: uniqueProducts,
      };
      console.log(uniqueProducts);
      console.log(data_api);
      let result = await fetch(
        BASE_URL + 'RCPA/MobileOwnDoctorAndProductSave',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        },
      );

      result = await result.json();
      console.log(result);
      if (result.Result === '') {
        setSelfProduct([]);
        setDataList([]);
        setshowRData(false);
        setshowSData(false);
        setshowCData(true);
        setIdRcpa(result.IDRCPA);
        setUnit([]);
        setCompetitorAdded(false);

        const uniqueData = uselfTData.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              t => t.label === item.label && t.value === item.value,
            ),
        );
        selfTData(uniqueData);
      } else {
        Alert.alert(result.Result);
      }
    }
  };

  const addComp = async () => {
    if (dataList.length === 0) {
      Alert.alert('Select Atleast 1 Doctor');
    } else {
      let docData = [];
      let prodData = [];
      dataList.map(function (value) {
        docData.push({
          IDOwnProduct: value.ownprodCode,
          IDCompProduct: value.compprodCode,
          IDCompDoctor: value.docCode,
          CompWeekQty: value.Qty,
          // Product: value.selfprodName,
          // OwnDoctor: value.docName,
        });
      });
      dataList.map(function (value) {
        prodData.push({
          IDOwnProduct: value.ownprodCode,
          IDCompProduct: value.compprodCode,
          IDCompCompany: value.compcompanyCode,
          IDCompUnit: value.packUnitCode,
          CompPack: value.packsize,
          CompMRP: value.mrp,
          CompLot: value.lot,
          CompRack: value.rackstock,
          // Product: value.selfprodName,
          // Unit: value.packUnitName,
        });
      });

      const uniqueProducts = prodData.filter(
        (product, index, self) =>
          index ===
          self.findIndex(
            p =>
              p.IDOwnProduct === product.IDOwnProduct &&
              p.CompLot === product.CompLot &&
              p.CompRack === product.CompRack,
          ),
      );
      const data_api = {
        Businessid: useBusinessID,
        IDRCPA: useIdRcpa,
        CompDoctors: docData,
        //CompProducts: prodData,
        CompProducts: uniqueProducts,
      };
      console.log(uniqueProducts);
      console.log(data_api);

      let result = await fetch(
        BASE_URL + 'RCPA/MobileCompDoctorAndProductSave',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data_api),
        },
      );

      result = await result.json();
      //console.log(result.result);
      if (result.result === '') {
        setCompetitorAdded(true);
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
          { cancelable: false },
        );
      } else {
        Alert.alert(result.result);
        navigation.navigate('AppNavDCRScreen');
      }
    }
  };

  const toggleModalComp = () => {
    //setModalVisible(!isModalVisible);
    if (useSelfTProductName === '') {
      Alert.alert('Select Self Product');
    } else if (useCompProductCode === '') {
      Alert.alert('Select Competitor Product');
    } else if (usePackSize === '') {
      Alert.alert('Select Pack Size');
    } else if (useUnitName === '') {
      Alert.alert('Select Unit');
    } else if (useMRP === '') {
      Alert.alert('Type MRP');
    }
    // else if (useLot === '') {
    //   Alert.alert('Type LOT/SCHEME');
    // }
    else if (useRackStock === '') {
      Alert.alert('Type Rack Stock');
    } else {
      setModalVisible(true);
    }
  };

  const toggleModal = () => {
    //setModalVisible(!isModalVisible);
    if (useSelfProductName === '') {
      Alert.alert('Select Self Product');
    } else if (usePackSize === '') {
      Alert.alert('Select Pack Size');
    } else if (useUnitName === '') {
      Alert.alert('Select Unit');
    } else if (useMRP === '') {
      Alert.alert('Type MRP');
    } else if (useLot === '') {
      Alert.alert('Type LOT/SCHEME');
    } else if (useRackStock === '') {
      Alert.alert('Type Rack Stock');
    } else {
      setModalVisible(true);
    }
  };

  const toggleModalView = () => {
    setModalVVisible(true);
    console.log(dataList);
  };

  const onDeleteSelf = id => {
    const newData = [...uselfData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    selfData(newData); // Update state
  };
  const onDeleteView = id => {
    const newData = [...dataList]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setDataList(newData); // Update state
  };

  const nextSelf = () => {
    if (useALabel === '') {
      Alert.alert('Select Area');
    } else if (docLabel === '') {
      Alert.alert('Select Retailer');
    } else {
      setshowRData(false);
      setshowCData(false);
      setshowSData(true);
    }
  };

  const oncClose = () => {
    setModalVisible(false);
    console.log(uselfData);
    selfData([]);
    setSelfProduct([]);
    setCompProduct([]);
    setCompCompanyList([]);
    setUnit([]);
    setMRP('');
    setLot('');
    setRackStock('');
    setPackSize('');
    setQty('');

    setDataList([...dataList, ...uselfData]); // Append new data
  };
  const onvClose = () => {
    setModalVVisible(false);
  };
  const onCompProductClose = () => {
    setModalCProduct(false);
  };
  const onCompCompanyClose = () => {
    setModalCCompany(false);
  };

  const addProduct = () => {
    if(useQty===''){
      Alert.alert('Quantity is missing');
      return;
    }
    selfData([
      ...uselfData,
      {
        selfprodCode: useSelfProductCode,
        selfprodName: useSelfProductName,
        packsize: usePackSize,
        packUnitName: useUnitName,
        packUnitCode: useUnitCode,
        mrp: useMRP,
        lot: useLot,
        rackstock: useRackStock,
        //doctorData: docData,
        Qty: useQty,
        docName: useDLabel,
        docCode: useDValue,
      },
    ]);

    selfTData([
      ...uselfTData,
      {
        value: useSelfProductCode,
        label: useSelfProductName,
      },
    ]);

    setQty('');
  };
  const addProductComp = () => {
    if(useQty === ''){
      Alert.alert('quantity is Missing');
      return;
    }
    selfData([
      ...uselfData,
      {
        ownprodCode: useSelfTProductCode,
        compprodCode: useCompProductCode,
        selfprodName: useCompProductName,
        compcompanyCode: useCompCompanyListCode,
        compcompanyName: useCompCompanyListName,
        packsize: usePackSize,
        packUnitName: useUnitName,
        packUnitCode: useUnitCode,
        mrp: useMRP,
        lot: useLot,
        rackstock: useRackStock,
        //doctorData: docData,
        Qty: useQty,
        docName: useDLabel,
        docCode: useDValue,
      },
    ]);

    setQty('');
  };
  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          BASE_URL +
          'Retailer/AreaWiseRetailerList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useIDEmployee +
          '&IDArea=' +
          IDArea;

        console.log('returl ' + returl);
        var config = {
          method: 'get',
          url: returl,
        };
        axios(config)
          .then(function (response) {
            var count = Object.keys(response.data).length;
            let wtNameArray = [];
            for (var i = 0; i < count; i++) {
              wtNameArray.push({
                //value: response.data[i].Value,
                value: response.data[i].IDRetailer,
                label: response.data[i].Name + ' ' + response.data[i].Code,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };
  const fetchData = () => {
    const selfprodurl =
      BASE_URL +
      'Product/ProductList?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&Type=DOCTORPRODUCT';
    console.log('returl ' + selfprodurl);
    var config = {
      method: 'get',
      url: selfprodurl,
    };
    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDProduct,
            label: response.data[i].Name,
          });
        }
        //console.log(wtNameArray);

        setSelfProduct(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });

    const compprodurl =
      BASE_URL +
      'Product/RCPA/CompititorProductList?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision;
    console.log('returl ' + compprodurl);
    var config = {
      method: 'get',
      url: compprodurl,
    };
    axios(config)
      .then(function (response) {
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDProduct,
            label: response.data[i].Name,
          });
        }
        //console.log(wtNameArray);

        setCompProduct(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };
  const fetchUData = async IDProduct => {
    const url =
      BASE_URL +
      'Product/RCPA/SelfProductDetails?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDProduct=' +
      IDProduct;
    try {
      const response = await fetch(url);
      const jsonResponse = await response.json();

      setMRP(jsonResponse.MRP.toString());
      setPackSize(jsonResponse.PackSize.toString());
      // Process and set data for the dropdown
      const dropdownData = [
        { label: jsonResponse.Unit, value: jsonResponse.IDUnit },
      ];
      setUnit(dropdownData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const fetchCUData = async IDProduct => {
    const url =
      BASE_URL +
      'Product/RCPA/CompProductDetails?Businessid=' +
      useBusinessID +
      '&IDDivision=' +
      useIDDivision +
      '&IDProduct=' +
      IDProduct;
    try {
      const response = await fetch(url);
      const jsonResponse = await response.json();
      console.log(jsonResponse);

      setMRP(jsonResponse.MRP.toString());
      setPackSize(jsonResponse.PackSize.toString());
      // Process and set data for the dropdown
      const dropdownData = [
        { label: jsonResponse.Unit, value: jsonResponse.IDUnit },
      ];
      setUnit(dropdownData);
      const dropdownCData = [
        { label: jsonResponse.Company, value: jsonResponse.IDCompititor },
      ];
      setCompCompanyList(dropdownCData);
    } catch (error) {
      //console.error('Error fetching data:', error);
    }
  };

  const fetchMCUData = () => {
    const uniturl =
      BASE_URL + 'Misc/List?Businessid=' + useBusinessID + '&Type=PRODUCTUNIT';
    console.log('returl ' + uniturl);
    var config = {
      method: 'get',
      url: uniturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDMisc,
            //key: response.data[i].IDDoctor,
            label: response.data[i].Name,
          });
        }
        setUnit(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const manuladdComp = async () => {
    setModalCProduct(true);

    const url = BASE_URL + 'RCPA/CompProductAutoNo?Businessid=' + useBusinessID;
    let result = await fetch(url);
    result = await result.json();
    console.log(result.result);

    setCompProdCode(result.result);

    const uniturl =
      BASE_URL + 'Misc/List?Businessid=' + useBusinessID + '&Type=PRODUCTUNIT';
    console.log('returl ' + uniturl);
    var config = {
      method: 'get',
      url: uniturl,
    };
    axios(config)
      .then(function (response) {
        //CREATE TABLE for MangerVisitWithTBL
        var count = Object.keys(response.data).length;
        let wtNameArray = [];
        for (var i = 0; i < count; i++) {
          wtNameArray.push({
            //value: response.data[i].Value,
            value: response.data[i].IDMisc,
            //key: response.data[i].IDDoctor,
            label: response.data[i].Name,
          });
        }
        setUnit(wtNameArray);
      })
      .catch(function (error) {
        Alert.alert(error);
      });
  };

  const manuladdCompCompany = async () => {
    setModalCCompany(true);

    const url = BASE_URL + 'RCPA/CompCompanyAutoNo?Businessid=' + useBusinessID;
    let result = await fetch(url);
    result = await result.json();
    console.log(result.result);

    setCompProdCompany(result.result);
  };

  const handleAddCompProduct = async () => {
    //if()
    const data_api = {
      CompProductName: useCompProdName,
      Company: useCompCompanyName,
      PackSize: useCompAddPackSize,
      IDUnit: useUnitCode,
      IDDivision: useIDDivision,
      IDCompProduct: 0,
      IDCompCompany: 0,
      Businessid: useBusinessID,
      CreatedBy: useEmpemail,
    };
    console.log(data_api);

    let result = await fetch(BASE_URL + 'RCPA/NewCompetitorProductSave', {
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
      setModalCProduct(false);
    } else {
      Alert.alert(result.result);
    }
  };
  const handleAddCompCompany = async () => {
    const data_api = {
      IDCompany: 0,
      CompName: useCompCompanyName,
      Businessid: useBusinessID,
      CreatedBy: useEmpemail,
    };
    console.log(data_api);

    let result = await fetch(BASE_URL + 'RCPA/NewCompetitorCompanySave', {
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
      setModalCCompany(false);
    } else {
      Alert.alert(result.result);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: false }}
      showsVerticalScrollIndicator={false}>
      <View
        style={{
          paddingLeft: 5,
          paddingRight: 5,
          marginLeft: 5,
          marginRight: 5,
        }}>
        {showRData ? (
          <View>
            <View style={{ margin: 5, padding: 5 }}>
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
                //dropdownPosition="top"
                placeholder={!isFocus ? 'Select Area' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  // setdocValue(item.value);
                  setALabel(item.label);
                  setAValue(item.value);
                  setIsFocus(false);
                  areaWiseDoctorList(item.value);
                  // doctorWiseProductListAPI(item.value);
                  //setDocCode(item.value);
                }}
              />
            </View>
            <View style={{ marginLeft: 5, marginRight: 5, padding: 5 }}>
              <Dropdown
                style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={usedoctorData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                //dropdownPosition="top"
                placeholder={!isFocus ? 'Select Retailer' : '...'}
                searchPlaceholder="Search..."
                //value={wtdataLabel}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setdocValue(item.value);
                  setdocLabel(item.label);
                  setIsFocus(false);
                }}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#33767C',
                  //width: '25%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => nextSelf()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Next
                </Text>
                <View
                  style={{
                    marginTop: 7,
                    marginBottom: 5,
                    paddingTop: 5,
                    paddingBottom: 5,
                  }}>
                  <AntDesign name="arrowright" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {showSData ? (
          <View style={{ margin: 5, padding: 5 }}>
            <TextInput
              style={style.textInput}
              placeholder="Doctor"
              placeholderTextColor="#555"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              value={useALabel}
              editable={false}
            />
            <View style={{ marginTop: 5, paddingTop: 5 }}>
              <TextInput
                style={style.textInput}
                placeholder="Retailer"
                placeholderTextColor="#555"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                value={docLabel}
                editable={false}
              />
            </View>

            <View style={{ marginTop: 5, paddingTop: 5 }}>
              <Dropdown
                style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useSelfProduct}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Self Product' : '...'}
                searchPlaceholder="Search..."
                //onFocus={() => setIsFocus(true)}
                onFocus={() => {
                  setIsFocus(true);
                  fetchData(); // Fetch data on focus
                }}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setIsFocus(false);
                  setSelfProductCode(item.value);
                  setSelfProductName(item.label);
                  fetchUData(item.value);
                }}
              />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Pack Size"
                  placeholderTextColor="#555"
                  inputMode="numeric"
                  value={usePackSize}
                  onChangeText={text => setPackSize(text)}
                />

                <Dropdown
                  style={[
                    style.dropdownNew,
                    isFocus && { borderColor: 'blue', width: '50%' },
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useUnit}
                  //search
                  //disable={true}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select Unit' : '...'}
                  searchPlaceholder="Search..."
                  onFocus={() => {
                    setIsFocus(true);
                    //fetchMCUData(); // Fetch data on focus
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setIsFocus(false);
                    setUnitCode(item.value);
                    setUnitName(item.label);
                  }}
                />
              </View>
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="numeric"
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="MRP"
                placeholderTextColor="#555"
                value={useMRP}
                onChangeText={text => setMRP(text)}
              />
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="default"
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="LOT/SCHEME"
                placeholderTextColor="#555"
                value={useLot}
                onChangeText={text => setLot(text)}
              />
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="Rack Stock"
                placeholderTextColor="#555"
                value={useRackStock}
                inputMode="numeric"
                onChangeText={text => setRackStock(text)}
              />
            </View>
          </View>
        ) : null}
        {showSData ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#33767C',
                  //width: '25%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => toggleModal()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Add Doctor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#808080',
                  //width: '25%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => toggleModalView()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  View Self Product
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>

              <TouchableOpacity
                style={{
                  backgroundColor: '#a6331a',
                  //width: '50%',
                  //margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => addSelf()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Save Self Data
                </Text>
              </TouchableOpacity>

            </View>
          </View>
        ) : null}

        {showCData ? (
          <View style={{ margin: 5, padding: 5 }}>
            <TextInput
              style={style.textInput}
              placeholder="Doctor"
              placeholderTextColor="#555"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              value={useALabel}
              editable={false}
            />
            <View style={{ marginTop: 5, paddingTop: 5 }}>
              <TextInput
                style={style.textInput}
                placeholder="Retailer"
                placeholderTextColor="#555"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                value={docLabel}
                editable={false}
              />
            </View>

            <View style={{ marginTop: 5, paddingTop: 5 }}>
              <Dropdown
                style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={uselfTData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Self Product' : '...'}
                searchPlaceholder="Search..."
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setIsFocus(false);
                  setSelfTProductCode(item.value);
                  setSelfTProductName(item.label);
                }}
              />
              <View style={{ marginTop: 5, paddingTop: 5, flexDirection: 'row' }}>
                <Dropdown
                  style={[style.dropdownNew1, isFocus && { borderColor: 'blue' }]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useCompProduct}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select Competitor Product' : '...'}
                  searchPlaceholder="Search..."
                  onFocus={() => {
                    setIsFocus(true);
                    fetchData(); // Fetch data on focus
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setIsFocus(false);
                    setCompProductCode(item.value);
                    setCompProductName(item.label);
                    fetchCUData(item.value);
                  }}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#33767C',
                    //width: '25%',
                    margin: 5,
                    borderRadius: 5,
                    flexDirection: 'row',
                  }}
                  onPress={() => manuladdComp()}>
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 18,
                      marginLeft: 5,
                      marginRight: 5,
                      marginBottom: 5,
                      padding: 5,
                      fontFamily: 'Lato-Regular',
                      color: '#fff',
                    }}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginTop: 5, paddingTop: 5 }}>
                <Dropdown
                  style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useCompCompanyList}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select Company' : '...'}
                  searchPlaceholder="Search..."
                  onFocus={() => {
                    setIsFocus(true);
                    fetchCUData(); // Fetch data on focus
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setIsFocus(false);
                    setCompCompanyListCode(item.value);
                    setCompCompanyListName(item.label);
                  }}
                />
                {/* <TouchableOpacity
                  style={{
                    backgroundColor: '#33767C',
                    //width: '25%',
                    margin: 5,
                    borderRadius: 5,
                    flexDirection: 'row',
                  }}
                  onPress={() => manuladdCompCompany()}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      fontSize: 18,
                      margin: 5,
                      padding: 5,
                      fontFamily: 'Lato-Regular',
                      color: '#fff',
                    }}>
                    +
                  </Text>
                </TouchableOpacity> */}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Pack Size"
                  placeholderTextColor="#555"
                  inputMode="numeric"
                  value={usePackSize}
                  onChangeText={text => setPackSize(text)}
                />

                <Dropdown
                  style={[
                    style.dropdownNew,
                    isFocus && { borderColor: 'blue', width: '50%' },
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useUnit}
                  //search
                  //disable={true}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? 'Select Unit' : '...'}
                  searchPlaceholder="Search..."
                  onFocus={() => {
                    setIsFocus(true);
                    //fetchMCUData(); // Fetch data on focus
                  }}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setIsFocus(false);
                    setUnitCode(item.value);
                    setUnitName(item.label);
                  }}
                />
              </View>
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="numeric"
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="MRP"
                placeholderTextColor="#555"
                value={useMRP}
                onChangeText={text => setMRP(text)}
              />
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                inputMode="default"
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="LOT/SCHEME"
                placeholderTextColor="#555"
                value={useLot}
                onChangeText={text => setLot(text)}
              />
              <TextInput
                //label="Remarks"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={[style.textInput, { marginBottom: 5 }]}
                placeholder="Rack Stock"
                placeholderTextColor="#555"
                value={useRackStock}
                inputMode="numeric"
                onChangeText={text => setRackStock(text)}
              />
            </View>
          </View>
        ) : null}
        {showCData ? (
          <View>
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#33767C',
                  //width: '25%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => toggleModalComp()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Add Doctor
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#808080',
                  //width: '25%',
                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => toggleModalView()}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  View Competitor Product
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#a6331a',
                  //width: '50%',
                  //margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => addComp()}>
                <Text
                  style={{
                    textAlign: 'center',

                    fontWeight: '700',
                    fontSize: 18,
                    margin: 5,
                    padding: 5,
                    fontFamily: 'Lato-Regular',
                    color: '#fff',
                  }}>
                  Save Competitor Data
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {isModalCProduct ? (
          <Modal
            transparent={true}
            //visible={visible}
            animationType="slide"
          //onRequestClose={onClose}
          >
            <View style={style.modalBackground}>
              <View style={style.modalContainer}>
                <Text style={style.title}>NEW COMPETITOR PRODUCT</Text>
                <Text style={style.label}>Code</Text>
                <TextInput
                  style={[style.input]}
                  value={useCompProdCode}
                  editable={false} // Make this field read-only
                />
                <Text style={style.label}>Product Name</Text>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Enter product name"
                  placeholderTextColor="#555"
                  value={useCompProdName}
                  //inputMode="numeric"
                  onChangeText={text => setCompProdName(text)}
                />
                <Text style={style.label}>Company Name</Text>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Enter company name"
                  placeholderTextColor="#555"
                  value={useCompCompanyName}
                  //inputMode="numeric"
                  onChangeText={text => setCompCompanyName(text)}
                />
                <Text style={style.label}>Pack</Text>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Enter pack size"
                  placeholderTextColor="#555"
                  value={useCompAddPackSize}
                  inputMode="numeric"
                  onChangeText={text => setCompAddPackSize(text)}
                />
                <Text style={style.label}>Unit</Text>
                <View style={{ marginBottom: 5, paddingBottom: 5 }}>
                  <Dropdown
                    style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useUnit}
                    dropdownPosition="top"
                    //search
                    //disable={true}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Unit' : '...'}
                    searchPlaceholder="Search..."
                    onFocus={() => {
                      setIsFocus(true);
                      fetchMCUData(); // Fetch data on focus
                    }}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      setIsFocus(false);
                      setUnitCode(item.value);
                      setUnitName(item.label);
                    }}
                  />
                </View>
                <View style={style.buttonContainer}>
                  <TouchableOpacity
                    style={style.button}
                    onPress={handleAddCompProduct}>
                    <Text style={style.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[style.button, style.closeButton]}
                    onPress={onCompProductClose}>
                    <Text style={style.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : null}
        {isModalCCompany ? (
          <Modal
            transparent={true}
            //visible={visible}
            animationType="slide"
          //onRequestClose={onClose}
          >
            <View style={style.modalBackground}>
              <View style={style.modalContainer}>
                <Text style={style.title}>NEW COMPANY</Text>
                <Text style={style.label}>Code</Text>
                <TextInput
                  style={[style.input]}
                  value={useCompProdCompany}
                  editable={false} // Make this field read-only
                />
                <Text style={style.label}>Name</Text>
                <TextInput
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[style.textInput, { marginBottom: 5 }]}
                  placeholder="Enter company name"
                  placeholderTextColor="#555"
                  value={useCompCompanyName}
                  //inputMode="numeric"
                  onChangeText={text => setCompCompanyName(text)}
                />

                <View style={style.buttonContainer}>
                  <TouchableOpacity
                    style={style.button}
                    onPress={handleAddCompCompany}>
                    <Text style={style.buttonText}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[style.button, style.closeButton]}
                    onPress={onCompCompanyClose}>
                    <Text style={style.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : null}
        {isModalVisible ? (
          <Modal
            transparent={true}
            //visible={visible}
            animationType="fade"
          //onRequestClose={onClose}
          >
            <View style={style.modalOverlay}>
              <View style={style.modalContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <Dropdown
                    style={[
                      style.dropdownNew,
                      isFocus && { borderColor: 'blue', width: '50%' },
                    ]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useDoctor}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Doctor ' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.value);
                      setDLabel(item.label);
                      setDValue(item.value);
                      setIsFocus(false);
                      console.log(item.label);
                    }}
                  />
                  <TextInput
                    //label="Quantity"
                    mode="outlined"
                    autoCapitalize="none"
                    inputMode="numeric"
                    autoCorrect={false}
                    value={useQty}
                    // key={index}
                    // value={dataGift[index]}
                    style={[
                      style.textInput,
                      {
                        width: '30%',
                        alignItems: 'center',
                        marginBottom: 5,
                        marginLeft: 5,
                      },
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setQty(text)}
                  />
                </View>

                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                  {showCData ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#33767C',
                        height: 50,
                        width: '30%',
                        padding: 5,
                        marginTop: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => addProductComp()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 18,
                          marginLeft: 25,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#fff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#33767C',
                        height: 50,
                        width: '30%',
                        padding: 5,
                        marginTop: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => addProduct()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 18,
                          marginLeft: 25,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#fff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#33767C',
                      height: 50,
                      width: '30%',
                      padding: 5,
                      marginTop: 10,
                      marginLeft: 5,
                      borderRadius: 5,
                      flexDirection: 'row',
                    }}
                    onPress={() => oncClose()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 18,
                        marginLeft: 15,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={uselfData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menu,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              onDeleteSelf(index);
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 5,
                          }}>
                          <View style={{ flexDirection: 'row' }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocName :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocCode :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docCode}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Qty :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.Qty}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            </View>
          </Modal>
        ) : null}
        {/* {isModalVisible ? (
          <Modal
            transparent={true}
            //visible={visible}
            animationType="fade"
            //onRequestClose={onClose}
          >
            <View style={style.modalOverlay}>
              <View style={style.modalContainer}>
                <View style={{flexDirection: 'row'}}>
                  <Dropdown
                    style={[
                      style.dropdownNew,
                      isFocus && {borderColor: 'blue', width: '50%'},
                    ]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useDoctor}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Doctor ' : '...'}
                    searchPlaceholder="Search"
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      console.log(item.value);
                      setDLabel(item.label);
                      setDValue(item.value);
                      setIsFocus(false);
                      console.log(item.label);
                    }}
                  />
                  <TextInput
                    //label="Quantity"
                    mode="outlined"
                    autoCapitalize="none"
                    inputMode="numeric"
                    autoCorrect={false}
                    value={useQty}
                    // key={index}
                    // value={dataGift[index]}
                    style={[
                      style.textInput,
                      {
                        width: '30%',
                        alignItems: 'center',
                        marginBottom: 5,
                        marginLeft: 5,
                      },
                    ]}
                    placeholder="Qty"
                    placeholderTextColor="#555"
                    onChangeText={text => setQty(text)}
                  />
                </View>

                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                  {showCData ? (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#33767C',
                        height: 50,
                        width: '30%',
                        padding: 5,
                        marginTop: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => addProductComp()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 18,
                          marginLeft: 25,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#fff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#33767C',
                        height: 50,
                        width: '30%',
                        padding: 5,
                        marginTop: 10,
                        borderRadius: 5,
                        flexDirection: 'row',
                      }}
                      onPress={() => addProduct()}>
                      <Text
                        style={{
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: 18,
                          marginLeft: 25,
                          marginTop: 5,
                          padding: 5,
                          fontFamily: 'Lato-Regular',
                          color: '#fff',
                        }}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#33767C',
                      height: 50,
                      width: '30%',
                      padding: 5,
                      marginTop: 10,
                      marginLeft: 5,
                      borderRadius: 5,
                      flexDirection: 'row',
                    }}
                    onPress={() => oncClose()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 18,
                        marginLeft: 15,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={uselfData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item, index}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menu,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              onDeleteSelf(index);
                            }}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 5,
                          }}>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocName :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocCode :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docCode}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Qty :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.Qty}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            </View>
          </Modal>
        ) : null} */}
        {isModalVVisible ? (
          <Modal
            transparent={true}
            //visible={visible}
            animationType="fade"
          //onRequestClose={onClose}
          >
            <View style={style.modalOverlay}>
              <View style={style.modalContainer}>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#33767C',
                      height: 50,
                      width: '30%',
                      padding: 5,
                      marginTop: 10,
                      marginLeft: 5,
                      borderRadius: 5,
                      flexDirection: 'row',
                    }}
                    onPress={() => onvClose()}>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: 18,
                        marginLeft: 15,
                        marginTop: 5,
                        padding: 5,
                        fontFamily: 'Lato-Regular',
                        color: '#fff',
                      }}>
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={dataList}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          style.menuNew,
                          {
                            backgroundColor: '#ecf0f1',
                            flexDirection: 'row',
                          },
                        ]}>
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              onDeleteView(index);
                            }}
                          />
                        </View>
                        <View
                          style={
                            {
                              // alignItems: 'center',
                              // justifyContent: 'center',
                              //margin: 5,
                            }
                          }>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              Product Name:{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.selfprodName}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocName :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docName}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              DocCode :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.docCode}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                            }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontFamily: 'Lato-Regular',
                                color: '#000',
                                margin: 2,
                                padding: 2,
                                textAlignVertical: 'center',
                              }}>
                              MRP :{' '}
                            </Text>
                            <Text
                              style={{
                                fontSize: 14,
                                fontFamily: 'Lato-Bold',
                                color: '#000',
                                textAlignVertical: 'center',
                              }}>
                              {item.mrp}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            </View>
          </Modal>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default RCPAN;

const style = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    //marginTop: 10,
  },
  dropdownNew: {
    height: 50,
    width: '50%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginBottom: 5,
    marginLeft: 5,
  },
  dropdownNew1: {
    height: 50,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginBottom: 5,
    marginLeft: 5,
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
  menuNew: {
    marginBottom: 10,
    // marginLeft: 5,
    // marginRight: 5,
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
    marginBottom: 10,
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
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '100%',
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeText: {
    fontSize: 18,
    color: 'black',
  },
  checkmark: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#008080',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  closeButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
