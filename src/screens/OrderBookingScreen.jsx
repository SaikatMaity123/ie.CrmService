import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Button,
  LogBox,
  FlatList,
  Alert,
  Image,
  Modal,
  TextInput,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback} from 'react';
//import {TextInput} from 'react-native-paper';
import {openDatabase} from 'react-native-sqlite-storage';
import {Dropdown} from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import axios from 'axios';
import {useFocusEffect} from '@react-navigation/native';
import CRMImg from '../images/CRMNEW.svg';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';

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

const OrderBookingScreen = ({navigation}) => {
  const [useRetDataSelected, setRetDataSelected] = useState([]);
  const [useRetLabel, setRetLabel] = useState('');
  const [useRetValue, setRetValue] = useState('');
  const [currDate, setcurrDate] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useRemarks, setRemarks] = useState('');
  const [dataSample, setdataSample] = useState([]);
  const [dataQty, setDataQty] = useState('');
  const [dataPack, setDataPack] = useState([]);
  const [dataRate, setDataRate] = useState([]);
  const [dataMRP, setMRP] = useState([]);
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [useProdname, setProdname] = useState([]);
  const [useProdcode, setProdcode] = useState([]);
  const [useIDProduct, setIDProduct] = useState([]);
  const [dataAmount, setAmount] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useEmpno, setEmpno] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [usePriceType, setPriceType] = useState([]);
  const [useBillingSeries, setBillingSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [useArea, setArea] = useState([]);
  const [useMArea, setMArea] = useState([]);
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState([]);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useMIDEmployee, setMIDEmployee] = useState('');

  const [clicked, setClicked] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productData, setproductData] = useState([]);
  const [useManagerAccess, setuseManagerAccess] = useState('');

  var cdate = moment().format('D/MMM/YYYY');

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    //setModalVisible(!isModalVisible);
    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
      //'Encountered two children with the same key',
    ]);

    setAmount('0.00');
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          //setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setEmpno(user.Empno);
          setEmpname(user.Empname);
          setBusinessID(user.BusinessID);
          setDivision(user.Division);
          setuseManagerAccess(user.ManagerAccess);
          setIDEmployee(user.IDEmployee);

          //getProductList();
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              getDateOnline();
              if (user.ManagerAccess === true) {
                const empurl =
                  BASE_URL +
                  'Employee/DivisionWiseEmployeeList?Businessid=' +
                  user.BusinessID +
                  '&IDDivision=' +
                  user.IDDivision +
                  '&IDEmployeeDesignation=0';
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
                        // value: response.data[i].Name,
                        // key: response.data[i].IDEmployee,
                        value: response.data[i].IDEmployee,
                        label: response.data[i].Name,
                      });
                    }
                    setMvisitWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
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
              }
              const url =
                BASE_URL + 'Product/Order/List?Businessid=' + user.BusinessID;
              //console.log(url);
              let result = await fetch(url);
              result = await result.json();
              //onsole.log(result);
              setdataSample(result);
            } else {
              setcurrDate(cdate);
              getOfflineData(user.ManagerAccess);
              getProductList();
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  const getOfflineData = managerAccess => {
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM OrderBookingRetList',
    //     [],
    //     (tx, results) => {
    //       if (results.rows.length > 0) {
    //         var temp = [];
    //         for (let i = 0; i < results.rows.length; ++i) {
    //           temp.push({
    //             value: results.rows.item(i).OtherCode,
    //             label:
    //               results.rows.item(i).Name +
    //               ' ' +
    //               results.rows.item(i).OtherCode,
    //           });
    //         }
    //         setRetDataSelected(temp);
    //         console.log('Data is inserted:', temp);
    //       } else {
    //         console.log('No data found');
    //         //setWTData('No data found');
    //       }
    //     },
    //     (tx, error) => {
    //       console.error('Error checking data', error);
    //     },
    //   );
    // });
    if (managerAccess === true) {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM MangerVisitWithTBL',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  // value: results.rows.item(i).Name,
                  // key: results.rows.item(i).IDEmployee,
                  value: results.rows.item(i).IDEmployee,
                  label: results.rows.item(i).EmployeeName,
                });
              setMvisitWTDataSelected(temp);
              console.log('Manger Data is inserted:', temp);
            } else {
              console.log('No data found');
              //setSelectedMAreaData('No data found');
            }
          },
          (tx, error) => {
            console.error('MangerVisitWithTBL Error checking data', error);
          },
        );
      });
    } else {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM CRM_EmployeeWiseAreaList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push({
                  value: results.rows.item(i).IDArea,
                  label: results.rows.item(i).Name,
                  // value: results.rows.item(i).Name,
                  // key: results.rows.item(i).IDEmployee,
                });
              setArea(temp);
              //console.log('User Data is inserted:', temp);
            } else {
              console.log('No data found');
            }
          },
          (tx, error) => {
            console.error('Error checking data', error);
          },
        );
      });
    }
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM OrderBookingPrice',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).Code,
                label: results.rows.item(i).Name,
              });
            }
            setPriceType(temp);
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
        'SELECT * FROM OrderBookingBillingSeries',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).Code,
                label: results.rows.item(i).Name,
              });
            }
            setBillingSeries(temp);
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

  const getDateOnline = async () => {
    const url = BASE_URL + 'OrderBooking/TodayDate';
    //console.log(url);
    let result = await fetch(url);
    result = await result.json();
    //console.log('Result ' + result.result);
    setcurrDate(result.result);
  };

  const save = () => {
    let prdAmt = [];
    let prdPack = [];
    let prdCode = [];
    let prdName = [];
    let prdQty = [];
    let prdPurRate = [];
    let data = [];

    if (productData.length === 0) {
      prdAmt = [];
      prdPack = [];
      prdCode = [];
      prdName = [];
      prdQty = [];
      prdPurRate = [];
    } else {
      productData.map(function (value) {
        prdAmt.push(value.amount);
        prdPack.push(value.packsize);
        prdCode.push(value.code);
        prdName.push(value.name);
        prdQty.push(value.key);
        prdPurRate.push(value.purrate);
      });
    }

    var countProdID = Object.keys(prdAmt).length;
    var countProdID = Object.keys(prdPack).length;
    var countProdID = Object.keys(prdCode).length;
    var countProdID = Object.keys(prdName).length;
    var countProdID = Object.keys(prdQty).length;
    var countProdID = Object.keys(prdPurRate).length;
    for (var i = 0; i < countProdID; i++) {
      data.push({
        BookingDate: currDate,
        EmployeeCode: useEmpno,
        EmployeeName: useEmpname,
        CustomerCode: useRetValue,
        CustomerName: useRetLabel,
        Division: useDivision,
        //PriceType: usePriceTypeValue,
        //BillingSeries: useBillingSeriesValue,
        Remarks: useRemarks,
        EntryUser: empEmail,
        Businessid: useBusinessID,
        Pack: prdPack[i],
        Qty: prdQty[i],
        Rate: prdPurRate[i].toFixed(2),
        Amount: prdAmt[i],
        ProductCode: prdCode[i],
        ProductName: prdName[i],
      });
    }

    console.log(data);

    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        setLoading(true);
        try {
          if (useRetLabel === '') {
            Alert.alert('Select Customer');
          } else if (useRemarks === '') {
            Alert.alert('Type Remarks');
          } else if (productData.length === 0) {
            Alert.alert('Add Product');
          } else {
            let result = await fetch(BASE_URL + 'OrderBooking/Save', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            });

            result = await result.json();
            console.log(result.result);
            let errorText = '';
            if (result.result.startsWith('ERROR:')) {
              errorText = result.result;
            }
            console.log(errorText);
            if (result.result === useRemarks) {
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
            }
            // else if (result.result === errorText) {
            //   Alert.alert(
            //     'Success',
            //     'Record Successfully Saved',
            //     [
            //       {
            //         text: 'Ok',
            //         //onPress: () => navigation.navigate('Report DashBoard'),
            //         onPress: () => navigation.navigate('AppNavScreen'),
            //       },
            //     ],
            //     {cancelable: false},
            //   );
            // }
            else {
              Alert.alert(result.result);
              navigation.navigate('AppNavScreen');
            }
          }
        } catch (error) {
          Alert.alert(error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn('OFFLINE');
        db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS OrderBookingDataSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
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
            'INSERT INTO OrderBookingDataSave (data) VALUES (?);',
            [JSON.stringify(data)],
            (_, result) => {
              console.log('Data inserted successfully:', result);
              navigation.navigate('AppNavScreen');
            },
            (_, error) => {
              console.log('Error inserting data:', error);
            },
          );
        });
      }
    }, []);
  };

  const getProductList = () => {
    setLoading(true);
    try {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM OrderBookingProductList',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              var temp = [];
              for (let i = 0; i < results.rows.length; ++i)
                temp.push(results.rows.item(i));
              setdataSample(temp);
              //console.log('Data is inserted:', temp);
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
  };
  const filteredData = dataSample.filter(item => {
    return item.Name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleTextChange = (text, rate) => {
    setDataQty(text);
    let rateValue = (parseFloat(text) * rate).toFixed(2);
    //console.log(rateValue);
    setAmount(rateValue);
  };

  const oncClose = () => {
    setModalVisible(false);
  };

  const addProduct = () => {
    const parsedQty = parseInt(dataQty, 10);
    //const isDataRateAllZero = dataRate.length > 0 && dataRate.every(rate => rate === 0.00);
    if (selectedProduct === '') {
      Alert.alert('Select Sample');
    } else if (dataQty === '') {
      Alert.alert('Type Quantity');
    } else if (!dataQty || parsedQty === 0) {
      Alert.alert('Data quantity cannot be zero or empty.');
    }
    // else if(dataRate.every(rate => rate === 0.00))
    // {
    //   Alert.alert('Data quantity cannot be zero or empty.');
    // }
    else {
      setModalVisible(false);
      setDataQty('');
      // db.transaction(txn => {
      //   //txn.executeSql('DROP TABLE IF EXISTS ManagerAreaListTBL', []);
      //   txn.executeSql(
      //     'CREATE TABLE IF NOT EXISTS CRM_ProductOrder(id INTEGER PRIMARY KEY AUTOINCREMENT,IDProduct VARCHAR,Code VARCHAR,Name VARCHAR,PackSize VARCHAR,MRP VARCHAR,PurRate VARCHAR,Amount VARCHAR,Qty VARCHAR)',
      //     [],
      //   );
      // });

      // let sql =
      //   'INSERT INTO CRM_ProductOrder(IDProduct,Code,Name,PackSize,MRP,PurRate,Amount,Qty) VALUES (?,?,?,?,?,?,?,?)';
      // let params = [
      //   useIDProduct,
      //   useProdcode,
      //   useProdname,
      //   dataPack,
      //   dataMRP,
      //   dataRate,
      //   dataAmount,
      //   dataQty,
      // ]; //storing user data in an array
      // db.executeSql(sql, params);

      // db.transaction(tx => {
      //   tx.executeSql(
      //     'SELECT * FROM CRM_ProductOrder',
      //     [],
      //     (_, results) => {
      //       if (results.rows.length > 0) {
      //         //console.warn('Table has data');
      //         var temp = [];
      //         for (let i = 0; i < results.rows.length; ++i) {
      //           temp.push(results.rows.item(i));
      //         }
      //         setproductData(temp);
      //         //console.log(temp);
      //       }
      //     },
      //     (_, error) => {
      //       console.log('Error fetching data:', error);
      //     },
      //   );
      // });

      setproductData([
        ...productData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        //{key: dataQty, label: sLabel, value: sValue},
        {
          key: dataQty,
          name: useProdname,
          packsize: dataPack,
          purrate: dataRate,
          mrp: dataMRP,
          code: useProdcode,
          idproduct: useIDProduct,
          amount: dataAmount,
        },
      ]);
    }
  };

  const onDeleteProduct = id => {
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'DELETE FROM CRM_ProductOrder WHERE id = ?',
    //     [id],
    //     (tx, results) => {
    //       // Check if deletion was successful
    //       if (results.rowsAffected > 0) {
    //         // Update the state to re-render the FlatList without the deleted item
    //         setproductData(prevData => prevData.filter(item => item.id !== id));
    //       }
    //     },
    //   );
    // });
    const newData = [...productData]; // Create a copy of the data array
    newData.splice(id, 1); // Remove the item at the given index
    setproductData(newData); // Update state
  };

  const multiSelectVisitWith = () => {
    let mvwt = useMvisitWTData;
    let mvwtList = mvwt.toString();
    //console.log(mvwt);
    //managerAreaList(mvwtList);
  };

  const managerAreaList = empLoyee => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeWiseAreaList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          empLoyee;
        //console.log('managerAreaList ' + areaurl);
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
            setMArea(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        console.log(empLoyee);

        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_offlineAreaList where IDEmployee=?',
            [empLoyee],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).IDArea,
                    label: results.rows.item(i).Name,
                  });
                }
                setMArea(temp);
                console.log('Data is inserted:', temp);
              } else {
                // var temp = [];
                // setMArea(temp);
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

  const areaWiseDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          // BASE_URL +
          // 'Retailer/AreaWiseRetailerList?Businessid=' +
          // useBusinessID +
          // '&IDArea=' +
          // IDArea;
          BASE_URL +
          'OrderBooking/AreaWiseCustomerList?Businessid=' +
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
                //value: response.data[i].IDRetailer,
                value: response.data[i].OtherCode,
                label: response.data[i].Name + ' ' + response.data[i].Code,
              });
            }
            setRetDataSelected(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        //Retrieve data from CRM_offlineOrderBookingCustomerList
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM CRM_offlineOrderBookingCustomerList where IDArea=?',
            [IDArea],
            (tx, results) => {
              if (results.rows.length > 0) {
                var temp = [];
                for (let i = 0; i < results.rows.length; ++i) {
                  temp.push({
                    value: results.rows.item(i).OtherCode,
                    label:
                      results.rows.item(i).Name +
                      '  ' +
                      results.rows.item(i).Code,
                  });
                }
                setRetDataSelected(temp);
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

  const areaWiseMDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          // BASE_URL +
          // 'Retailer/AreaWiseRetailerList?Businessid=' +
          // useBusinessID +
          // '&IDArea=' +
          // IDArea;
          BASE_URL +
          'OrderBooking/AreaWiseCustomerList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useMIDEmployee +
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
                value: response.data[i].OtherCode,
                label: response.data[i].Name + ' ' + response.data[i].Code,
              });
            }
            setRetDataSelected(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };
  return (
    <KeyboardAwareLayout>  
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <View style={{justifyContent: 'center' , backgroundColor:'#ffffff'}}>
        {/* <View
        style={{
          backgroundColor: '#ecf0f1',
          justifyContent: 'flex-end',
          flexDirection: 'row',
          alignItems: 'center',
          padding: 10,
          borderWidth: 0.1,
          margin: 10,
          elevation: 2,
          borderRadius: 1,
        }}> */}

        {/* </View> */}

        <View style={{padding: 5, margin: 5}}>
          <TextInput
            //label="Date"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            //style={{marginBottom: 5}}
            value={currDate}
            editable={false}
            style={[style.textInput, {marginBottom: 5}]}
            placeholder="Date"
            placeholderTextColor="#555"
          />
          <View>
            {useManagerAccess ? (
              <View>
                <View style={{marginBottom: 5}}>
                  {/* <MultipleSelectList
                  setSelected={val => setMvisitWTData(val)}
                  data={useMvisitWTDataSelected}
                  placeholder="Select Visit With"
                  label="Visit With"
                  //save="value"
                  save="key"
                  onSelect={() =>
                    //console.log(usevisitWTData)
                    multiSelectVisitWith()
                  }
                  fontFamily="Roboto-Bold"
                  notFoundText="No Data Exists"
                  //badgeTextStyles={{color:'red'}}
                  badgeStyles={{backgroundColor: 'green'}}
                  labelStyles={{fontWeight: '800', color: 'black'}}
                /> */}
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useMvisitWTDataSelected}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    //dropdownPosition="top"
                    placeholder={!isFocus ? 'Select Visit With' : '...'}
                    searchPlaceholder="Search..."
                    //value={wtdataLabel}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      setIsFocus(false);
                      managerAreaList(item.value);
                      setMIDEmployee(item.value);
                    }}
                  />
                </View>
                <View style={{marginBottom: 5, paddingBottom: 5}}>
                  <Dropdown
                    style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useMArea}
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
                      setIsFocus(false);
                      areaWiseMDoctorList(item.value);
                    }}
                  />
                </View>
              </View>
            ) : (
              <View style={{marginBottom: 2, paddingBottom: 2}}>
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
                    setIsFocus(false);
                    areaWiseDoctorList(item.value);
                  }}
                />
              </View>
            )}
          </View>
          <Dropdown
            style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useRetDataSelected}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            //dropdownPosition="top"
            placeholder={!isFocus ? 'Select Customer' : '...'}
            searchPlaceholder="Search..."
            //value={wtdataLabel}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setRetValue(item.value);
              setRetLabel(item.label);
              setIsFocus(false);
              //doctorWiseProductListAPI(item.value);
            }}
          />
          <TextInput
            //label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={[style.textInput, {marginTop: 10}]}
            placeholder="Remarks"
            multiline={true}
            numberOfLines={3}
            placeholderTextColor="#555"
            value={useRemarks}
            onChangeText={text => setRemarks(text)}
          />
        </View>
        {/* <View
          style={{
            backgroundColor: '#fff',
            justifyContent: 'flex-end',
            //flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 0.1,
            marginLeft: 10,
            marginRight: 10,
            elevation: 2,
            borderRadius: 1,
          }}>
          <TouchableOpacity
            style={{
              width: '95%',
              height: 50,
              borderRadius: 10,
              borderWidth: 0.5,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 15,
              paddingRight: 15,
            }}
            onPress={() => {
              setClicked(!clicked);
            }}>
            <Text style={{fontWeight: '600'}}>
              {selectedProduct == '' ? 'Select Product' : selectedProduct}
            </Text>
            {clicked ? (
              <Image
                source={require('../images/upload.png')}
                style={{width: 20, height: 20}}
              />
            ) : (
              <Image
                source={require('../images/dropdown.png')}
                style={{width: 20, height: 20}}
              />
            )}
          </TouchableOpacity>
          {clicked ? (
            <View
              style={{
                elevation: 5,
                marginTop: 20,
                height: 300,
                alignSelf: 'center',
                width: '90%',
                backgroundColor: '#fff',
                borderRadius: 10,
              }}>
              <TextInput
                style={style.searchBar}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              <FlatList
                //data={dataSample}
                data={filteredData}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      style={{
                        width: '85%',
                        alignSelf: 'center',
                        height: 50,
                        justifyContent: 'center',
                        borderBottomWidth: 0.5,
                        borderColor: '#8e8e8e',
                      }}
                      onPress={() => {
                        setSelectedProduct(item.Name);
                        setProdname(item.Name);
                        setDataPack(item.PackSize);
                        setDataRate(item.PurRate);
                        setMRP(item.MRP);
                        setProdcode(item.Code);
                        setIDProduct(item.IDProduct);
                        setClicked(!clicked);
                        // onSearch('');
                        // setSearch('');
                      }}>
                      <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          ) : null}
          <View style={{flexDirection: 'row'}}>
            <TextInput
              label="Qty"
              mode="outlined"
              autoCapitalize="none"
              inputMode="numeric"
              autoCorrect={false}
              value={dataQty}
              style={{
                width: '30%',
                alignItems: 'center',
                margin: 5,
              }}
              // onChangeText={text => setDataQty(text)}
              onChangeText={text =>
                //setDataQty(text)
                ///setAmount((parseFloat(text) * rate).toFixed(2));
                handleTextChange(text, dataRate)
              }
            />
            <TextInput
              label="Amount"
              mode="outlined"
              autoCapitalize="none"
              inputMode="numeric"
              autoCorrect={false}
              editable={false}
              value={dataAmount}
              style={{
                width: '30%',
                alignItems: 'center',
                margin: 5,
              }}
            />
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
          </View>
        </View> */}

        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={style.button}
              // style={{
              //   backgroundColor: '#33767C',
              //   width: '40%',
              //   padding: 5,
              //   margin: 5,
              //   borderRadius: 5,
              //   flexDirection: 'row',
              // }}
              onPress={() => toggleModal()}>
              <Text
                style={style.buttonText}
                // style={{
                //   textAlign: 'center',
                //   fontWeight: '700',
                //   fontSize: 18,
                //   margin: 5,
                //   padding: 5,
                //   fontFamily: 'Lato-Regular',
                //   color: '#fff',
                // }}
              >
                Add Product
              </Text>
            </TouchableOpacity>
            {/* <Button title="Show Modal" onPress={toggleModal} /> */}
            <TouchableOpacity
              style={style.button}
              // style={{
              //   backgroundColor: '#33767C',
              //   width: '30%',
              //   padding: 5,
              //   margin: 5,
              //   borderRadius: 5,
              //   flexDirection: 'row',
              // }}
              onPress={() => save()}>
              <Text
                style={style.buttonText}
                // style={{
                //   textAlign: 'center',
                //   fontWeight: '700',
                //   fontSize: 18,
                //   margin: 5,
                //   padding: 5,
                //   fontFamily: 'Lato-Regular',
                //   color: '#fff',
                // }}
              >
                Submit
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
                  <TouchableOpacity
                    style={{
                      width: '95%',
                      height: 50,
                      borderRadius: 10,
                      borderWidth: 0.5,
                      alignSelf: 'center',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingLeft: 15,
                      paddingRight: 15,
                    }}
                    onPress={() => {
                      setClicked(!clicked);
                    }}>
                    <Text style={{fontWeight: '600'}}>
                      {selectedProduct == ''
                        ? 'Select Product'
                        : selectedProduct}
                    </Text>
                    {clicked ? (
                      <Image
                        source={require('../images/upload.png')}
                        style={{width: 20, height: 20}}
                      />
                    ) : (
                      <Image
                        source={require('../images/dropdown.png')}
                        style={{width: 20, height: 20}}
                      />
                    )}
                  </TouchableOpacity>
                  {clicked ? (
                    <View
                      style={{
                        elevation: 5,
                        marginTop: 20,
                        height: 300,
                        alignSelf: 'center',
                        width: '90%',
                        backgroundColor: '#fff',
                        borderRadius: 10,
                      }}>
                      <TextInput
                        style={[style.searchBar, style.textInput]}
                        placeholder="Search..."
                        placeholderTextColor="#555"
                        value={searchQuery}
                        onChangeText={handleSearch}
                      />
                      <FlatList
                        //data={dataSample}
                        data={filteredData}
                        renderItem={({item, index}) => {
                          return (
                            <TouchableOpacity
                              style={{
                                width: '85%',
                                alignSelf: 'center',
                                height: 50,
                                justifyContent: 'center',
                                borderBottomWidth: 0.5,
                                borderColor: '#8e8e8e',
                              }}
                              onPress={() => {
                                setSelectedProduct(item.Name);
                                setProdname(item.Name);
                                setDataPack(item.PackSize);
                                setDataRate(item.PurRate);
                                setMRP(item.MRP);
                                setProdcode(item.Code);
                                setIDProduct(item.IDProduct);
                                setClicked(!clicked);
                                // onSearch('');
                                // setSearch('');
                              }}>
                              <Text style={{fontWeight: '600'}}>
                                {item.Name}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>
                  ) : null}
                  <View style={{flexDirection: 'row'}}>
                    <TextInput
                      //label="Qty"
                      mode="outlined"
                      autoCapitalize="none"
                      keyboardType="numeric" // This will open the number keypad
                      autoCorrect={false}
                      value={dataQty}
                      style={[
                        style.textInput,
                        {
                          width: '30%',
                          alignItems: 'center',
                          margin: 5,
                        },
                      ]}
                      placeholder="Qty"
                      placeholderTextColor="#555"
                      // onChangeText={text => setDataQty(text)}
                      onChangeText={text =>
                        //setDataQty(text)
                        ///setAmount((parseFloat(text) * rate).toFixed(2));
                        handleTextChange(text, dataRate)
                      }
                    />
                    <TextInput
                      //label="Amount"
                      mode="outlined"
                      autoCapitalize="none"
                      inputMode="numeric"
                      autoCorrect={false}
                      editable={false}
                      value={dataAmount}
                      // style={}

                      style={[
                        style.textInput,
                        {
                          width: '30%',
                          alignItems: 'center',
                          margin: 5,
                        },
                      ]}
                      placeholder="Amount"
                      placeholderTextColor="#555"
                    />
                  </View>
                  <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#005696',
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
                        backgroundColor: '#005696',
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
                </View>
              </View>
            </Modal>
          ) : null}
        </View>
        <View style={{marginLeft: 10, marginRight: 10, marginTop: 5}}>
          <FlatList
            data={productData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}) => {
              return (
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
                          //onDeleteProduct(item.id);
                          onDeleteProduct(index);
                        }}
                      />
                    </View>
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: 5,
                      }}>
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
                          Name :{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Bold',
                            color: '#000',
                            width: '80%',
                            textAlignVertical: 'center',
                          }}>
                          {item.name}
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
                          {item.key}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontFamily: 'Lato-Regular',
                            color: '#000',
                            margin: 2,
                            padding: 2,
                            textAlignVertical: 'center',
                          }}>
                          Amount :{' '}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Bold',
                            color: '#000',
                            textAlignVertical: 'center',
                          }}>
                          {item.amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              );
            }}
          />
        </View>
      </View>
    </KeyboardAwareLayout>
  );
};

export default OrderBookingScreen;

const style = StyleSheet.create({
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
  },
  dropdown: {
    height: 50,
    borderColor: '#333333',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginTop: 5,
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
    fontSize: 15,
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
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
  button: {
    backgroundColor: '#005696',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
  },
});
