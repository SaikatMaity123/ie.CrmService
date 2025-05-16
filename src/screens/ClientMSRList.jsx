import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Image,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {Dropdown} from 'react-native-element-dropdown';
import {BASE_URL} from '@env';
import axios from 'axios';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import DeviceInfo from 'react-native-device-info';

const ClientMSRList = () => {
  const [clicked, setClicked] = useState(false);
  const [useMvisitWTData, setMvisitWTData] = useState([]);
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [usedoctorData, setdoctorData] = useState([]);
  const [useMultipleIDEmployee, setMultipleIDEmployee] = useState('');
  const [useMArea, setMArea] = useState([]);
  const [docLabel, setdocLabel] = useState('');
  const [docValue, setdocValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useMAreaLabel, setMAreaLabel] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [giftData, setgiftData] = useState([]);
  const [gLabel, setGLabel] = useState('');
  const [gValue, setGValue] = useState('');
  const [useGQty, setGQty] = useState('');
  const [giftQtyData, setgiftQtyDataData] = useState([]);
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [locationStatus, setLocationStatus] = useState('');
  const [selectedMArea, setSelectedMArea] = useState(null);

  useEffect(() => {
    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setEmpEmail(user.Empemail);
          setBusinessID(user.BusinessID);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const empurl =
                BASE_URL +
                'Employee/Hierarchy/All?Businessid=' +
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
                      value: response.data[i].EmployeeName,
                      key: response.data[i].IDEmployee,
                    });
                  }
                  setMvisitWTDataSelected(wtNameArray);
                })
                .catch(function (error) {
                  Alert.alert(error);
                });

              const prdurl =
                BASE_URL +
                'Product/ProductDivisionSampleGiftList?Businessid=' +
                user.BusinessID +
                '&IDDivision=' +
                user.IDDivision +
                '&Type=GIFT';
              //console.log(prdurl);
              var config = {
                method: 'get',
                url: prdurl,
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
                  setgiftData(wtNameArray);
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

  const multiSelectVisitWith = async () => {
    let mvwt = useMvisitWTData;
    let mvwtList = mvwt.toString();
    console.log(mvwtList);

    const docurl =
      BASE_URL +
      'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
      useBusinessID +
      '&Employees=' +
      mvwtList +
      '&IDArea=0';

    let result = await fetch(docurl);
    result = await result.json();
    console.log('useMultipleIDEmployee', useMultipleIDEmployee);
    console.log(docurl);
    setdoctorData(result);
    setMultipleIDEmployee(mvwtList);
    managerAreaList(mvwtList);
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
        Alert.alert('No Internet');
      }
    }, []);
  };

  const areaWiseMDoctorList = IDArea => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const returl =
          BASE_URL +
          'manager/DCR/MultipleEmployeeAndAreaWiseDoctorList?Businessid=' +
          useBusinessID +
          '&Employees=' +
          useMultipleIDEmployee +
          '&IDArea=' +
          IDArea;
        let result = await fetch(returl);
        result = await result.json();
        console.log(result);
        console.log(returl);
        setdoctorData(result);
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };

  const save = () => {
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
    } else {
      if (useMvisitWTData.length === 0) {
        Alert.alert('Select Visit With');
      } else if (docLabel === '') {
        Alert.alert('Select Doctor');
      } else if (giftQtyData.length === 0) {
        Alert.alert('Add Gift');
      } else {
        Alert.alert('Success');
      }
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
  };
  const filteredData = usedoctorData.filter(item => {
    return item.Name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const addGift = () => {
    if (gLabel.length === 0) {
      Alert.alert('Select Gift');
    } else if (useGQty === '') {
      Alert.alert('Type Quantity');
    } else {
      setgiftQtyDataData([
        ...giftQtyData,
        //{key: Math.random().toString(), value: `${sLabel} ${useQty}`},
        {key: useGQty, label: gLabel, value: gValue},
      ]);

      // Clear the inputs
      setGQty('');
    }
  };

  const doctorWiseAreaListAPI = docID => {
    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        const areaurl =
          BASE_URL +
          'Area/EmployeeAndDoctorWiseAreaList?Businessid=' +
          useBusinessID +
          '&IDEmployee=' +
          useMultipleIDEmployee +
          '&IDDoctor=' +
          docID;
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
                label: response.data[i].Area,
              });
            }
            //console.log(wtNameArray);

            setMArea(wtNameArray);
          })
          .catch(function (error) {
            Alert.alert(error);
            if (error.response) {
              // Server responded with a status other than 2xx
              console.log('Error Status:', error.response.status);
              console.log('Error Data:', error.response.data);

              if (error.response.status === 400) {
                // Handle validation errors
                const errors = error.response.data.errors;
                if (errors) {
                  Object.keys(errors).forEach(key => {
                    console.log(`${key}: ${errors[key].join(', ')}`);
                  });
                }
              }
            } else if (error.request) {
              // No response received from server
              console.log('No response received:', error.request);
            } else {
              // Other errors
              console.log('Error:', error.message);
            }
          });
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  };

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
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
          <Text style={{padding: 5}}>Lat : {currentLatitude}</Text>
          <Text style={{padding: 5}}>Long : {currentLongitude} </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#33767C',
            width: '35%',
            padding: 5,
            margin: 5,
            borderRadius: 5,
            flexDirection: 'row',
          }}
          onPress={() => save()}>
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
            Submit
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
      <View>
        <View
          style={{
            paddingLeft: 5,
            paddingRight: 5,
            marginLeft: 5,
            marginRight: 5,
          }}>
          <View>
            <MultipleSelectList
              setSelected={val => setMvisitWTData(val)}
              data={useMvisitWTDataSelected}
              placeholder="Select Visit With"
              label="Visit With"
              //save="value"
              save="key"
              onSelect={
                () => multiSelectVisitWith()
                //console.log(usevisitWTData)
              }
              fontFamily="Roboto-Bold"
              notFoundText="No Data Exists"
              //badgeTextStyles={{color:'red'}}
              badgeStyles={{backgroundColor: 'green'}}
              labelStyles={{fontWeight: '800', color: 'black'}}
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
              value={selectedMArea}
              placeholder={!isFocus ? 'Select Area' : '...'}
              searchPlaceholder="Search..."
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                setSelectedMArea(item.value);
                setMAreaLabel(item.label);
                setIsFocus(false);
                areaWiseMDoctorList(item.value);
              }}
            />
          </View>
          <View style={{marginBottom: 2, paddingBottom: 2}}>
            <TouchableOpacity
              style={{
                width: '100%',
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
                {selectedProduct == '' ? 'Select Doctor' : selectedProduct}
              </Text>
              {clicked ? (
                <Image
                  source={require('../images/upload.png')}
                  style={{width: 10, height: 10}}
                />
              ) : (
                <Image
                  source={require('../images/dropdown.png')}
                  style={{width: 10, height: 10}}
                />
              )}
            </TouchableOpacity>
            {clicked ? (
              <View
                style={{
                  elevation: 5,
                  marginTop: 20,
                  height: 300, // Adjust height or use flex: 1 dynamically
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
                  data={filteredData}
                  keyExtractor={(item, index) => index.toString()} // Ensure unique keys
                  renderItem={({item}) => (
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
                        setdocValue(item.IDDoctor);
                        setdocLabel(item.Name);
                        console.warn(item.IDDoctor);
                        //doctorWiseAreaListAPI(item.IDDoctor);
                      }}>
                      <Text style={{fontWeight: '600'}}>{item.Name}</Text>
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={{paddingBottom: 20}} // Ensures proper scrollable area
                  nestedScrollEnabled={true} // Use this if inside another scrollable view
                />
              </View>
            ) : null}
          </View>
          <View style={{marginBottom: 2, paddingBottom: 2}}>
            <TextInput
              //label="Remarks"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={[style.textInput, {marginBottom: 5}]}
              placeholder="Remarks"
              placeholderTextColor="#555"
              value={useRemarks}
              onChangeText={text => setRemarks(text)}
            />
          </View>
        </View>
        <SafeAreaView style={{flex: 1}}>
          <View style={{marginLeft: 10, marginRight: 10}}>
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
                data={giftData}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isFocus ? 'Select Gift' : '...'}
                searchPlaceholder="Search"
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                  console.log(item.value);
                  setGLabel(item.label);
                  setGValue(item.value);
                  setIsFocus(false);
                }}
              />
              <TextInput
                //label="Quantity"
                mode="outlined"
                autoCapitalize="none"
                inputMode="numeric"
                autoCorrect={false}
                value={useGQty}
                style={[
                  style.textInput,
                  {width: '20%', alignItems: 'center', marginRight: 5},
                ]}
                placeholder="Qty"
                placeholderTextColor="#555"
                onChangeText={text => setGQty(text)}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#33767C',
                  width: '25%',

                  margin: 5,
                  borderRadius: 5,
                  flexDirection: 'row',
                }}
                onPress={() => addGift()}>
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
            <FlatList
              data={giftQtyData}
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
                          //onDeleteGift(item.value);
                          onDeleteGift(index);
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
                          {item.label}
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
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          </View>
        </SafeAreaView>
      </View>
    </ScrollView>
  );
};

export default ClientMSRList;
const style = StyleSheet.create({
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
  dropdownNew: {
    height: 50,
    width: '50%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    marginRight: 5,
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
    marginTop: 10,
  },
  textTab: {
    fontSize: 18,
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
  wrapper: {
    height: 50,
    width: '30%',
    marginTop: 5,
    //marginBottom:5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    //paddingHorizontal: 5,
    backgroundColor: '#fff',
    fontFamily: 'Lato-Bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#000', // Border color
    borderRadius: 8, // Rounded corners
    padding: 10, // Inner padding
    fontSize: 16,
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },
});
