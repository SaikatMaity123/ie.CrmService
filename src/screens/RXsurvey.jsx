import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  PermissionsAndroid,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';
import {MultipleSelectList} from 'react-native-dropdown-select-list';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {BASE_URL, image_url} from '@env';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;

const RXsurvey = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [doctors, setdoctors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(false);
  const [useDocId, setDocId] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpno, setEmpno] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [usevisitWTDataSelected, setvisitWTDataSelected] = useState('');
  const [usevisitWTData, setvisitWTData] = useState([]);
  const [useEmpemail, setEmpemail] = useState('');
  const [useMultipleVisitWith, setMultipleVisitWith] = useState('');
  const [useMultipleProducts, setMultipleProducts] = useState('');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [deviceType, setDevice] = useState('');
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useMvisitWTData, setMvisitWTData] = useState('');
  const [useMvisitWTDataSelected, setMvisitWTDataSelected] = useState([]);
  const [showData, setshowData] = useState(false);
  const [viewdata, setviewData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFocus, setIsFocus] = useState(false);
  useEffect(() => {
    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setIDEmployee(user.IDEmployee);
          setEmpemail(user.Empemail);
          setEmpno(user.Empno);
          setuseMobileAccess(user.MobileAccess);
          setuseManagerAccess(user.ManagerAccess);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              if (user.ManagerAccess === true) {
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
                        value: response.data[i].IDEmployee,
                        label: response.data[i].EmployeeName,
                      });
                    }
                    setMvisitWTDataSelected(wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              } else {
                const docurl =
                  BASE_URL +
                  'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&IDArea=0';

                let result = await fetch(docurl);
                result = await result.json();
                // console.log(result);
                // console.log(docurl);
                setdoctors(result);

                // const vwturl =
                //   BASE_URL +
                //   'Employee/EmployeeUpwardManagerList?Businessid=' +
                //   user.BusinessID +
                //   '&IDEmployee=' +
                //   user.IDEmployee;
                // console.log(vwturl);

                // fetch(vwturl)
                //   .then(res => res.json())
                //   .then(json => {
                //     // Map API response to dropdown format
                //     const formatted = json.map(emp => ({
                //       label: emp.Name, // what to show
                //       value: emp.IDEmployee, // actual value
                //     }));
                //     setVisitWith(formatted);
                //   })
                //   .catch(err => {
                //     console.error(err);
                //   });
                const vwturl =
                  BASE_URL +
                  //'Employee/EmployeeUpwardManagerList?Businessid=' +
                  'Employee/Hierarchy/All?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee;
                console.log(vwturl);
                var config = {
                  method: 'get',
                  url: vwturl,
                };
                axios(config)
                  .then(function (response) {
                    var count = Object.keys(response.data).length;
                    let wtNameArray = [];
                    for (var i = 0; i < count; i++) {
                      wtNameArray.push({
                        //value: response.data[i].Value,
                        value: response.data[i].EmployeeName,
                        key: response.data[i].IDEmployee,
                      });
                    }
                    setvisitWTDataSelected(wtNameArray);
                    console.log('wtNameArray', wtNameArray);
                  })
                  .catch(function (error) {
                    Alert.alert(error);
                  });
              }
            } else {
              Alert.alert('No Internet Connection');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    const API_URL =
      BASE_URL +
      'RXSurvey/RXSurveyList?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      useMvisitWTData;
      console.log(API_URL);
      
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      setviewData(json);
    } catch (error) {
      console.error('Error fetching RX Survey List:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔍 Filter logic
  const filteredDoctors = doctors.filter(d => {
    const nameMatch = d.Name?.toLowerCase().includes(search.toLowerCase());
    const idMatch = d.IDDoctor?.toString().includes(search);
    return nameMatch || idMatch;
  });

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => getDoctorId(item.IDDoctor)}>
      <Text style={styles.name}>{item.Name}</Text>
      <Text style={styles.docId}>{item.IDDoctor}</Text>
    </TouchableOpacity>
  );

  const getDoctorId = IDDoctor => {
    setDocId(IDDoctor);
    setModalVisible(true);
    const returl =
      BASE_URL +
      'Doctor/ManagerDCRDoctorProductMappingOfflineList?Businessid=' +
      useBusinessID +
      '&IDDoctor=' +
      IDDoctor;
    fetch(returl)
      .then(res => res.json())
      .then(json => {
        // API returns inside `d`
        const formatted = json.d.map(item => ({
          key: item.IDProduct.toString(), // value for dropdown
          value: item.ProductName, // label shown in dropdown
        }));
        setProducts(formatted);
      })
      .catch(err => {
        console.error(err);
      });
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
    }
    setModalImage(false);
  };

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };
    launchImageLibrary(options, handleResponse);
  };

  let options = {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: false,
  };

  const handleResponse = response => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('Image picker error: ', response.error);
    } else {
      //let imageUri = response.uri || response.assets?.[0]?.uri;
      const imageuri = response.assets[0].uri;
      const fileName = response.assets[0].fileName;
      const fileType = response.assets[0].type;
      setSelectedImage(imageuri);
      setSelectedImageName(fileName);
      setSelectedImageType(fileType);
    }
    setModalImage(false);
  };
  const handleSubmit = async () => {
    if (usevisitWTData.length === 0) {
      Alert.alert('Please select at least one Visit With.');
      return;
    } else if (selected.length === 0) {
      Alert.alert('Please select at least one product.');
      return;
    } else if (!selectedImage) {
      Alert.alert('Please select an image before submitting.');
      return;
    } else {
      let formData = new FormData();
      formData.append('IDBooking', '0');
      formData.append('IDDoctor', useDocId);
      formData.append('IDEmployee', useIDEmployee);
      formData.append('EntryUser', useEmpemail);
      formData.append('Businessid', useBusinessID);
      formData.append('Employeeno', useEmpno);
      formData.append('RXProducts', useMultipleProducts);
      formData.append('RXvisitWithEmployees', useMultipleVisitWith);
      formData.append('DeviceType', 'MOBILE_' + deviceType);
      formData.append('file', {
        uri: selectedImage, // Replace with actual path
        type: selectedImageType,
        name: selectedImageName,
      });
      console.log('Form Data:', formData);

      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              let response = await fetch(
                BASE_URL + 'RXSurvey/RXSurveyAddEdit',
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
              let response = await fetch(
                BASE_URL + 'RXSurvey/RXSurveyAddEdit',
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
            Alert.alert('You are in Offline Mode.');
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
        //Alert.alert(useMobileAccess);
      }
    }
  };

  const multiSelectVisitWith = () => {
    let mvwt = usevisitWTData;
    let mvwtList = mvwt.toString();
    console.log(mvwt);
    setMultipleVisitWith(mvwtList);
  };
  const multiSelectProducts = () => {
    let useProd = selected;
    let useProducts = useProd.toString();
    //console.log(useProd);
    setMultipleProducts(useProducts);
  };

  // Render each item
  const renderRxViewItem = ({item}) => (
    <View style={styles.card}>
      <Image
        source={{uri: `${image_url}${item.PhotoPath}`}}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.doctor}>{item.Doctor}</Text>
        <Text style={styles.label}>Products:</Text>
        <Text style={styles.value}>{item.Products}</Text>
        <Text style={styles.label}>Visit With:</Text>
        <Text style={styles.value}>{item.Visitwith}</Text>
        <Text style={styles.employee}>By: {item.Employee}</Text>
      </View>
    </View>
  );
  // Show loading spinner
  // if (loading) {
  //   return (
  //     <View style={styles.loaderContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //     </View>
  //   );
  // }
  // const handleResponse = response => {
  //   if (response.didCancel) {
  //     console.log('User cancelled image picker');
  //   } else if (response.error) {
  //     console.log('Image picker error: ', response.error);
  //   } else {
  //     let imageUri = response.uri || response.assets?.[0]?.uri;
  //     //setSelectedImage(imageUri);
  //     //uploadImage(imageUri);
  //     const imageuri = response.assets[0].uri;
  //     const fileName = response.assets[0].fileName;
  //     const fileType = response.assets[0].type;
  //     setSelectedImage(imageuri);
  //     setSelectedImageName(fileName);
  //     setSelectedImageType(fileType);
  //     // console.log('imageuri',imageuri);
  //     // console.log('fileName',fileName);
  //     // console.log('fileType',fileType);
  //   }
  //   setModalVisible(false);
  // };

  // const multiSelectMVisitWith = async () => {
  //   // let mvwt = useMvisitWTData;
  //   // let mvwtList = mvwt.toString();
  //   // console.log(mvwt);
  //   // console.log(mvwtList);
  //   setshowData(true);
  //   //managerAreaList(mvwtList);
  // };
  return (
    <SafeAreaView>
      {useManagerAccess ? (
        <View style={{margin: 10}}>
          {/* <MultipleSelectList
            setSelected={val => setMvisitWTData(val)}
            data={useMvisitWTDataSelected}
            placeholder="Select Visit With"
            label="Visit With"
            save="key"
            onSelect={() => multiSelectMVisitWith()}
            fontFamily="Roboto-Bold"
            notFoundText="No Data Exists"
            badgeStyles={{backgroundColor: 'green'}}
            labelStyles={{fontWeight: '800', color: 'black'}}
          /> */}
          <Dropdown
            style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={useMvisitWTDataSelected}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            //dropdownPosition="top"
            placeholder={!isFocus ? 'Select Visit With' : '...'}
            searchPlaceholder="Search..."
            value={useMvisitWTData}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={async item => {
              setMvisitWTData(item.value);
              setshowData(true);
              setIsFocus(false);
              const API_URL =
                BASE_URL +
                'RXSurvey/RXSurveyList?Businessid=' +
                useBusinessID +
                '&IDEmployee=' +
                item.value;
              try {
                const response = await fetch(API_URL);
                const json = await response.json();
                setviewData(json);
              } catch (error) {
                console.error('Error fetching RX Survey List:', error);
              } finally {
                setLoading(false);
                setRefreshing(false);
              }
            }}
          />

          {showData ? (
            <FlatList
              data={viewdata}
              keyExtractor={item => item.IDRXSurvey.toString()}
              renderItem={renderRxViewItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              contentContainerStyle={{padding: 10}}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No RX Survey records found.
                </Text>
              }
            />
          ) : null}
        </View>
      ) : (
        <View>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="gray" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, number"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          {/* Doctor List */}
          <FlatList
            data={filteredDoctors}
            keyExtractor={item => item.IDDoctor.toString()}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{height: 10}} />}
            contentContainerStyle={{paddingBottom: 100}}
          />
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)', // dim background
              }}>
              <View
                style={{
                  width: '90%',
                  backgroundColor: '#fff', // <- full modal is white now
                  borderRadius: 12,
                  padding: 15,
                }}>
                <View
                  style={{
                    marginBottom: 15,
                  }}>
                  <View style={{alignItems: 'center', margin: 10}}>
                    {/* Image Preview */}
                    {selectedImage && (
                      <Image
                        source={{uri: selectedImage}}
                        style={{height: 100, width: 200, alignSelf: 'center'}}
                        resizeMode="contain"
                      />
                    )}

                    {/* Upload Button */}

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setModalImage(true)}>
                      <Text style={styles.buttonText}>
                        Take Photo or Select From Gallery
                      </Text>
                    </TouchableOpacity>

                    {/* Dropdown */}
                    {/* <Dropdown
                  style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={useVisitWith}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  //dropdownPosition="top"
                  placeholder={!isFocus ? 'Select Visit With' : '...'}
                  searchPlaceholder="Search..."
                  value={selectedVisitWith}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={item => {
                    setSelectedVisitWith(item.value);
                    setIsFocus(false);
                  }}
                /> */}
                  </View>
                  {/* Multi Select */}
                  <MultipleSelectList
                    setSelected={val => setvisitWTData(val)}
                    data={usevisitWTDataSelected}
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
                  />
                  <MultipleSelectList
                    setSelected={val => setSelected(val)}
                    data={products}
                    placeholder="Select Products"
                    save="key"
                    badgeStyles={{backgroundColor: 'green'}}
                    labelStyles={{color: 'black'}}
                    onSelect={() =>
                      //console.log(usevisitWTData)
                      multiSelectProducts()
                    }
                  />
                </View>
                {/* Buttons Row */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.actionButton, {backgroundColor: '#808080'}]}
                    onPress={handleSubmit}>
                    <Text style={styles.actionText}>Submit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, {backgroundColor: '#FF0000'}]}
                    onPress={() => setModalVisible(false)}>
                    <Text style={styles.actionText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalImage}
            onRequestClose={() => {
              setModalImage(!modalImage);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCameraLaunch}>
                  <Text>Take Photo...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={openImagePicker}>
                  <Text>Choose from Library...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalImage(!modalImage)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </SafeAreaView>
  );
};

export default RXsurvey;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1565C0', // Blue
    padding: 16,
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    padding: 8,
    marginLeft: 5,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specialization: {
    fontSize: 14,
    color: 'gray',
  },
  docId: {
    fontSize: 12,
    color: 'gray',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#1565C0',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // dimmed background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#d3d3d3', // light gray box
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'gray',
    fontWeight: 'bold',
  },
  smallButton: {
    backgroundColor: 'gray',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 40,
  },
  smallButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dropdown: {
    height: 50,
    //width: 350,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  placeholderStyle: {fontSize: 16},
  selectedTextStyle: {fontSize: 14},
  iconStyle: {width: 20, height: 20},
  inputSearchStyle: {height: 40, fontSize: 16},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1, // each takes half
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  textContainer: {
    flex: 1,
    padding: 10,
  },
  doctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 4,
  },
  value: {
    fontSize: 13,
    color: '#333',
  },
  employee: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 6,
    fontStyle: 'italic',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
