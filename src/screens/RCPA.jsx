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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Dropdown} from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DeviceInfo from 'react-native-device-info';

const RCPA = () => {
  const [isFocus, setIsFocus] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [useSelfProduct, setSelfProduct] = useState([]);
  const [useSelfProductCode, setSelfProductCode] = useState('');
  const [useSelfProductName, setSelfProductName] = useState('');
  const [useUnitCode, setUnitCode] = useState('');
  const [useUnitName, setUnitName] = useState('');
  const [useUnit, setUnit] = useState([]);
  const [useMRP, setMRP] = useState('');
  const [useLot, setLot] = useState('');
  const [usePackSize, setPackSize] = useState('');
  const [useRackStock, setRackStock] = useState('');
  const [useDLabel, setDLabel] = useState('');
  const [useDValue, setDValue] = useState('');
  const [useDoctor, setDoctor] = useState([]);
  const [usedoctorData, setdoctorData] = useState([]);
  const [uselfData, selfData] = useState([]);
  const [useQty, setQty] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [showRData, setshowRData] = useState(true);
  const [showSData, setshowSData] = useState(false);
  const [useArea, setArea] = useState([]);
  const [docLabel, setdocLabel] = useState('');
  const [docValue, setdocValue] = useState('');
  const [useALabel, setALabel] = useState('');
  const [useAValue, setAValue] = useState('');
  const [useIDDivision, setIDDivision] = useState('');
  const [useAutoNo, setAutoNo] = useState('');
  const [useIDDesignation, setIDDesignation] = useState('');
  const [deviceType, setDevice] = useState('');
  const [useEmpemail, setEmpemail] = useState('');
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
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

              const uniturl =
                BASE_URL +
                'Misc/List?Businessid=' +
                user.BusinessID +
                '&Type=PRODUCTUNIT';
              console.log('returl ' + uniturl);
              var config = {
                method: 'get',
                url: uniturl,
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
                  //console.log(wtNameArray);

                  setUnit(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const empurl =
                BASE_URL +
                'Doctor/DoctorList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(empurl);
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
              //console.log('returl ' + areaurl);
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

  // const handleSelect = selectedKeys => {
  //   // Ensure no more than 3 items are selected
  //   if (selectedKeys.length <= 3) {
  //     setDoctorData(selectedKeys);
  //   }
  // };

  // const updatedDoctorList = useDoctor.map(item => ({
  //   ...item,
  //   disabled: useDoctorData.length >= 3 && !useDoctorData.includes(item.key),
  // }));

  const addDoctor = () => {
    selfData([
      ...uselfData,
      //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
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

    // setDoctorData([
    //   ...useDoctorData,
    //   //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
    //   {key: useQty, label: useDLabel, value: useDValue},
    // ]);
    setQty('');
  };
  const addSelf = () => {
    let docData = [];
    let prodData = [];

    // useDoctorData.map(function (value) {
    //   docData.push({
    //     DocName: value.useDLabel,
    //     DocID: value.useDValue,
    //     Qty: value.key,
    //   });
    // });
    dataList.map(function (value) {
      docData.push({
        IDOwnProduct: value.selfprodCode,
        IDOwnDoctor: value.docCode,
        OwnWeekQty: value.Qty,
        Product: value.selfprodName,
        OwnDoctor: value.docName,
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
        Product: value.selfprodName,
        Unit: value.packUnitName,
      });
    });
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
      OwnProducts: prodData,
    };
    //console.log(dataList);
    console.log(data_api);

    // let docData = [];

    // useDoctorData.map(function (value) {
    //   docData.push({
    //     DocName: value.useDLabel,
    //     DocID: value.useDValue,
    //     Qty: value.key,
    //   });
    // });

    // console.log(docData);

    // selfData([
    //   ...uselfData,
    //   //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
    //   {

    //   },
    // ]);

    // const data_api = {
    //   selfprodCode: useSelfProductCode,
    //   selfprodName: useSelfProductName,
    //   packsize: usePackSize,
    //   packUnitName: useUnitName,
    //   packUnitCode: useUnitCode,
    //   mrp: useMRP,
    //   lot: useLot,
    //   rackstock: useRackStock,
    //   doctorData: docData,
    // };
    // console.log('User', data_api);
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

  const onDeleteSelf = id => {
    const newData = [...uselfData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    selfData(newData); // Update state
  };

  const docNameData = item => {
    // return (
    //   <View>
    //     <FlatList
    //       data={item.VisitWiths}
    //       renderItem={({item}) => (
    //         <TouchableWithoutFeedback>
    //           <View
    //             style={[
    //               style.menu,
    //               {
    //                 backgroundColor: '#ecf0f1',
    //               },
    //             ]}>
    //             <Text style={styles.menuItem}>
    //               {item.Name + ' ' + '(' + item.Shift + ')'}
    //             </Text>
    //           </View>
    //         </TouchableWithoutFeedback>
    //       )}
    //     />
    //   </View>
    // );
  };

  const nextPS = () => {
    console.log(JSON.stringify(uselfData));
  };
  const nextSelf = () => {
    if (useALabel === '') {
      Alert.alert('Select Area');
    } else if (docLabel === '') {
      Alert.alert('Select Retailer');
    } else {
      setshowRData(false);
      setshowSData(true);
    }
  };

  const oncClose = () => {
    setModalVisible(false);
    console.log(uselfData);
    selfData([]);
    // setSelfProduct([]);
    // setUnit([]);
    setMRP('');
    setLot('');
    setRackStock('');
    setPackSize('');
    setQty('');

    setDataList([...dataList, ...uselfData]); // Append new data
  };

  const addProduct = () => {
    selfData([
      ...uselfData,
      //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
      // {
      //   IDRCPA: 0,
      //   NO: useAutoNo,
      //   IDDivision: useIDDivision,
      //   IDDesignation: useIDDesignation,
      //   IDEmployee: useIDEmployee,
      //   IDRetailer: docValue,
      //   IDArea: useAValue,
      //   User: useEmpemail,
      //   DecviceType: deviceType,
      //   Businessid: useBusinessID,
      //   selfprodCode: useSelfProductCode,
      //   selfprodName: useSelfProductName,
      //   packsize: usePackSize,
      //   packUnitName: useUnitName,
      //   packUnitCode: useUnitCode,
      //   mrp: useMRP,
      //   lot: useLot,
      //   rackstock: useRackStock,
      //   //doctorData: docData,
      //   Qty: useQty,
      //   docName: useDLabel,
      //   docCode: useDValue,
      // },
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

    // setDoctorData([
    //   ...useDoctorData,
    //   //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
    //   {key: useQty, label: useDLabel, value: useDValue},
    // ]);
    setQty('');
  };
  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          BASE_URL +
          'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useIDEmployee +
          '&IDArea=' +
          IDArea;

        //console.log('returl ' + returl);
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
                value: response.data[i].IDDoctor,
                label: response.data[i].Name + ' ' + response.data[i].Code,
              });
            }
            setdoctorData(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        //Retrieve data from CRM_DocList
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_DocList where IDArea=?',
            [IDArea],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDDoctor,
                    label:
                      results.rows.item(i).Name +
                      '  ' +
                      results.rows.item(i).Code,
                  });
                }
                setdoctorData(temp);
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
      }
    }, []);
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
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
            <View style={{margin: 5, padding: 5}}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
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
            <View style={{marginLeft: 5, marginRight: 5, padding: 5}}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
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
                  <AntDesign
                    name="arrowright"
                    size={20}
                    color="white"
                    // onPress={() => {
                    //   onDelete(dataItem.id);
                    // }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        {showSData ? (
          <View>
            <View style={{marginTop: 5, paddingTop: 5}}>
              <TextInput
                //label="Doctor"
                style={style.textInput}
                placeholder="Doctor"
                placeholderTextColor="#555"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                value={useALabel}
                editable={false}
              />
            </View>
            <View style={{marginTop: 5, paddingTop: 5}}>
              <TextInput
                //label="Doctor"
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

            <View style={{marginTop: 5, paddingTop: 5}}>
              <Dropdown
                style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
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
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  setIsFocus(false);
                  setSelfProductCode(item.value);
                  setSelfProductName(item.label);
                }}
              />
            </View>
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <TextInput
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={[style.textInput, {marginBottom: 5}]}
                placeholder="Pack Size"
                placeholderTextColor="#555"
                inputMode="numeric"
                value={usePackSize}
                onChangeText={text => setPackSize(text)}
              />

              <Dropdown
                style={[
                  style.dropdownNew,
                  isFocus && {borderColor: 'blue', width: '50%'},
                ]}
                placeholderStyle={style.placeholderStyle}
                selectedTextStyle={style.selectedTextStyle}
                inputSearchStyle={style.inputSearchStyle}
                iconStyle={style.iconStyle}
                data={useUnit}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Unit' : '...'}
                searchPlaceholder="Search..."
                onFocus={() => setIsFocus(true)}
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
              style={[style.textInput, {marginBottom: 5}]}
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
              style={[style.textInput, {marginBottom: 5}]}
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
              style={[style.textInput, {marginBottom: 5}]}
              placeholder="Rack Stock"
              placeholderTextColor="#555"
              value={useRackStock}
              inputMode="numeric"
              onChangeText={text => setRackStock(text)}
            />
            {/* <View
          style={{
            backgroundColor: '#ecf0f1',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            borderWidth: 0.1,
            margin: 10,
            elevation: 2,
            borderRadius: 1,
          }}> */}
            {/* <View style={{flexDirection: 'row'}}>
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
          </View> */}
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
                  backgroundColor: '#a6331a',
                  //width: '25%',
                  margin: 5,
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

            {isModalVisible ? (
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

                    <View style={{flexDirection: 'row'}}>
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
            ) : null}
            {/* </View> */}

            {/* <MultipleSelectList
          setSelected={handleSelect}
          data={updatedDoctorList}
          placeholder="Select Doctor"
          label="Doctor"
          save="key"
          onSelect={() => console.log(useDoctorData)}
          fontFamily="Roboto-Bold"
          notFoundText="No Data Exists"
          badgeStyles={{backgroundColor: 'green'}}
          labelStyles={{fontWeight: '800', color: 'black'}}
        />

        <View style={{flexDirection: 'row', alignSelf: 'center'}}>
          <TouchableOpacity
            style={{
              backgroundColor: '#33767C',
              //width: '25%',

              margin: 5,
              borderRadius: 5,
              flexDirection: 'row',
            }}
            onPress={() => addSelf()}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
                //marginLeft: 25,
                margin: 5,
                padding: 5,
                fontFamily: 'Lato-Regular',
                color: '#fff',
              }}>
              Add Self Product
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#33767C',
              //width: '30%',
              padding: 5,
              margin: 5,
              borderRadius: 5,
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
              <AntDesign
                name="arrowright"
                size={20}
                color="white"
                // onPress={() => {
                //   onDelete(dataItem.id);
                // }}
              />
            </View>
          </TouchableOpacity>
        </View> */}
            <FlatList
            // data={uselfData}
            // keyExtractor={(item, index) => index.toString()}
            // renderItem={({item, index}) => (
            //   <TouchableWithoutFeedback>
            //     <View
            //       style={[
            //         style.menu,
            //         {
            //           backgroundColor: '#ecf0f1',
            //           flexDirection: 'row',
            //         },
            //       ]}>
            //       <View
            //         style={{
            //           alignItems: 'center',
            //           justifyContent: 'center',
            //         }}>
            //         <AntDesign
            //           name="delete"
            //           size={30}
            //           color="red"
            //           onPress={() => {
            //             onDeleteSelf(index);
            //           }}
            //         />
            //       </View>
            //       <View
            //         style={{
            //           alignItems: 'center',
            //           justifyContent: 'center',
            //           margin: 5,
            //         }}>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             Product Name :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               width: '80%',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.selfprodName}
            //           </Text>
            //         </View>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             Pack Size :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.packsize}
            //           </Text>
            //         </View>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             Pack Unit :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.packUnitName}
            //           </Text>
            //         </View>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             MRP :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.mrp}
            //           </Text>
            //         </View>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             LOT/SCHEME :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.lot}
            //           </Text>
            //         </View>
            //         <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             Rack Stock :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.rackstock}
            //           </Text>
            //         </View>
            //         {docNameData(item.doctorData)}
            //         {/* <View
            //           style={{
            //             flexDirection: 'row',
            //           }}>
            //           <Text
            //             style={{
            //               fontSize: 12,
            //               fontFamily: 'Lato-Regular',
            //               color: '#000',
            //               margin: 2,
            //               padding: 2,
            //               textAlignVertical: 'center',
            //             }}>
            //             Doctor :{' '}
            //           </Text>
            //           <Text
            //             style={{
            //               fontSize: 14,
            //               fontFamily: 'Lato-Bold',
            //               color: '#000',
            //               textAlignVertical: 'center',
            //             }}>
            //             {item.doctorData}
            //           </Text>
            //         </View> */}
            //       </View>
            //     </View>
            //   </TouchableWithoutFeedback>
            // )}
            />
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default RCPA;

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
    width: 350,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
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
});
