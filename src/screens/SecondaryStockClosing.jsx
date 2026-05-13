import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Modal,
  FlatList,
  Button,
  Image,
  BackHandler,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import React, {useEffect, useState, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import axios from 'axios';
import {MGSP_URL, MGSP_URL_NEW} from '@env'; // Ensure you have the correct import for your environment variable
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {TextInput} from 'react-native-paper';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;

const SecondaryStockClosing = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFocus, setIsFocus] = useState(false);
  const [useHQ, setHQ] = useState('');
  const [useEmpNo, setEmpNo] = useState('');
  const [useDivision, setDivision] = useState('');
  const [useCustomerTypeValue, setCustomerTypeValue] = useState('');
  const [useCustomerNameValue, setCustomerNameValue] = useState('');
  const [useCustomerName, setCustomerName] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [imodalVisible, setIModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [usecustomerType, setcustomerType] = useState('');
  const customerType = [
    {label: 'Retailer', value: '1'},
    {label: 'Wholesaler/Stockiest', value: '2'},
  ];
  useEffect(() => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          console.log('user', user);
          // Split by space and take the last part
          const hqParts = user.HQ.split(' ');
          const extractedHQ = hqParts[hqParts.length - 1];
          setHQ(extractedHQ);
          setEmpNo(user.Empno);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
    try {
      AsyncStorage.getItem('SalesLogin').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          if (user.Division === 'MPPL') {
            setDivision('MAD');
          } else {
            setDivision(user.Division);
          }
        }
      });
    } catch (error) {
      Alert.alert(error);
    }
    fetchClosingStockData();
  }, []);
  const fetchClosingStockData = async () => {
    try {
      const response = await axios.post(
        MGSP_URL + 'GetClosingStockMonthYear',
        {}, // if your API requires a body, put it here. Empty object for now.
      );
      if (response.data && Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.monthYearNme,
          value: item.monthYear,
        }));
        setData(formatted);
      }
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setLoading(false);
    }
  };
  const toggleModal = () => {
    if (value === null || value === '') {
      Alert.alert('Please select Month-Year');
      return;
    } else if (usecustomerType === null || usecustomerType === '') {
      Alert.alert('Please select Customer Type');
      return;
    } else if (useCustomerNameValue === null || useCustomerNameValue === '') {
      Alert.alert('Please select Customer Name');
      return;
    } else {
      const [monthStr, yearStr] = value.split('-');
      setModalVisible(true);
      fetchProducts();
      console.log('Selected Month:', month);
      console.log('Selected Year:', year);
    }
  };
  const getCustomerType = async ctype => {
    setLoading(true);
    try {
      const response = await fetch(
        MGSP_URL_NEW +
          'GetClosingStockCustomer?empno=' +
          useEmpNo +
          '&division=' +
          useDivision +
          '&HQ=' +
          useHQ +
          '&customerType=' +
          ctype,
      );
      const json = await response.json();

      // Map it to dropdown format: { label, value }
      const dropdownData = json.map(item => ({
        label: item.customer.trim(),
        value: item.alias,
      }));

      setCustomerName(dropdownData);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const apiUrl = MGSP_URL_NEW + 'GetProductList';
    const params = {
      month: month,
      year: year,
      HQ: useHQ,
      division: useDivision,
      customerType: usecustomerType,
      customer: useCustomerNameValue,
      empno: useEmpNo,
    };
    console.log('Fetching products with params:', params);

    try {
      const response = await axios.get(apiUrl, {params});
      const productsData = response.data.map(item => ({
        ...item,
        qty: '',
        // status: '',
        // remark: '',
        selected: false,
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const handleSubmit = async () => {
    //const selectedItems = products.filter(p => p.selected);

    // const errors = [];
    // products.forEach((item, index) => {
    //   if (item.selected) {
    //     if (!item.qty || item.qty.trim() === '') {
    //       errors.push(`Enter quantity for ${item.productName}`);
    //     }
    //   }
    // });

    // if (errors.length > 0) {
    //   Alert.alert('Validation Error', errors.join('\n'));
    // } else {
    //   // ✅ All valid – proceed to send API or navigate
    //   const selectedItems = products
    //     .filter(item => item.selected) // optional: only send selected ones
    //     .map(({alias, qty}) => ({
    //       alias,
    //       qty,
    //     }));
    //   console.log('Submitted Data:', selectedItems);
    // }

    const selectedItems = products.filter(item => item.selected);
    // ✅ Step 2: Validate Quantity for selected items
    const invalidQty = selectedItems.some(
      item => !item.qty || item.qty.trim() === '',
    );

    // ✅ Step 1: Validate if at least one checkbox is selected
    if (selectedItems.length === 0) {
      Alert.alert('Validation Error', 'Select at least 1 Product.');
      return;
    } else if (invalidQty) {
      Alert.alert(
        'Validation Error',
        'Please enter quantity for selected items.',
      );
      return;
    } else if (selectedImage) {
      //Alert.alert('Please select an image before submitting.');
      // ✅ Step 3: Prepare filtered JSON for API
      const finalData = selectedItems.map(item => ({
        Productalias: item.alias,
        Quty: item.qty,
      }));

      console.log('✔ Final Payload:', finalData);

      const apiUrl =
        MGSP_URL_NEW +
        'SecondaryClodingstkSave?month=' +
        month +
        '&year=' +
        year +
        '&HQ=' +
        useHQ +
        '&Division=' +
        useDivision +
        '&Customertype=' +
        usecustomerType +
        '&Customer=' +
        useCustomerNameValue +
        '&submittedby=' +
        useEmpNo;
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (Array.isArray(data) && data[0]?.status === 'Successs') {
        console.log('✅ Success response received');
        setModalVisible(false);
        Alert.alert(
          'Success',
          'Image Successfully Saved',
          [
            {
              text: 'Ok',
              onPress: () => navigation.navigate('AppNavScreen'),
            },
          ],
          {cancelable: false},
        );
      } else {
        console.log('❌ Failed or unexpected response:', data);
      }
      // 🔁 call API here with finalData
    } else {
      // ✅ Step 3: Prepare filtered JSON for API
      const finalData = selectedItems.map(item => ({
        Productalias: item.alias,
        Quty: item.qty,
      }));

      console.log('✔ Final Payload:', finalData);

      const apiUrl =
        MGSP_URL_NEW +
        'SecondaryClodingstkSave?month=' +
        month +
        '&year=' +
        year +
        '&HQ=' +
        useHQ +
        '&Division=' +
        useDivision +
        '&Customertype=' +
        usecustomerType +
        '&Customer=' +
        useCustomerNameValue +
        '&submittedby=' +
        useEmpNo;
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (Array.isArray(data) && data[0]?.status === 'Successs') {
        console.log('✅ Success response received');
        setModalVisible(false);
        Alert.alert(
          'Success',
          'Record Successfully Saved',
          [
            {
              text: 'Ok',
              onPress: () => navigation.navigate('AppNavScreen'),
            },
          ],
          {cancelable: false},
        );
      } else {
        console.log('❌ Failed or unexpected response:', data);
      }
      // 🔁 call API here with finalData
    }
  };

  const oncClose = () => {
    setModalVisible(false);
  };

  const renderItem = ({item, index}) => (
    <View style={style.card}>
      <Text style={style.productName}>{item.productName}</Text>
      <View style={style.row}>
        {/* Checkbox on the left */}
        <CheckBox
          value={item.selected}
          onValueChange={val => handleInputChange(index, 'selected', val)}
          tintColors={{true: 'green', false: 'gray'}} // optional styling
        />

        {/* Inputs on the right */}
        <View style={style.inputGroup}>
          <TextInput
            label="Enter Qty"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            value={item.qty}
            style={{margin: 5}}
            keyboardType="numeric"
            onChangeText={val => handleInputChange(index, 'qty', val)}
          />

          <TextInput
            label="Status"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{margin: 5}}
            value={item.status === null ? '--' : item.status}
            editable={false}
            // onChangeText={text => setDocCode(text)}
          />
          <TextInput
            label="Remark"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{margin: 5}}
            value={item.remark === null ? '--' : item.remark}
            editable={false}
            // onChangeText={text => setDocCode(text)}
          />
        </View>
      </View>
    </View>
  );

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
    setIModalVisible(false);
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
    setIModalVisible(false);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginTop: 10,
        marginLeft: 10, // prevents overlap with system status bar
        marginRight: 10, // prevents overlap with system status bar
        paddingBottom: insets.bottom, // prevents overlap with system navigation bar
      }}>
      <Dropdown
        style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
        placeholderStyle={style.placeholderStyle}
        selectedTextStyle={style.selectedTextStyle}
        inputSearchStyle={style.inputSearchStyle}
        iconStyle={style.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select Month-Year' : '...'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
          const [monthStr, yearStr] = item.value.split('-');
          console.log('monthStr:', monthStr, 'yearStr:', yearStr); // Log both parts
          setMonth(Number(monthStr));
          setYear(Number(yearStr));
        }}
        disable={loading}
      />
      <View style={{marginTop: 5}}>
        <TextInput
          label="HQ"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{marginBottom: 5}}
          value={useHQ}
          editable={false}
        />
      </View>
      <View style={{marginTop: 5}}>
        <TextInput
          label="Division"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{marginBottom: 5}}
          value={useDivision}
          editable={false}
        />
      </View>
      <View style={{marginTop: 5}}>
        <Dropdown
          style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={customerType}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Customer Type' : '...'}
          searchPlaceholder="Search..."
          value={useCustomerTypeValue}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setCustomerTypeValue(item.value);
            setIsFocus(false);
            if (item.label === 'Retailer') {
              getCustomerType('Retail');
              setcustomerType('Retail');
            } else if (item.label === 'Wholesaler/Stockiest') {
              getCustomerType('Wholesale');
              setcustomerType('Wholesale');
            }
          }}
          disable={loading}
        />
      </View>
      <View style={{marginTop: 10}}>
        <Dropdown
          style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={useCustomerName}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select Customer Name' : '...'}
          searchPlaceholder="Search..."
          value={useCustomerNameValue}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setCustomerNameValue(item.value);
            setIsFocus(false);
          }}
          disable={loading}
        />
      </View>
      <View
        style={{justifyContent: 'center', alignItems: 'center', margin: 15}}>
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{
              backgroundColor: '#6287ff',
              paddingVertical: 15,
              paddingHorizontal: 30,
              marginBottom: 20,
              marginLeft: 5,
              marginRight: 5,
              borderRadius: 5,
              justifyContent: 'center', // Center content vertically
              alignItems: 'center',
            }}
            onPress={() => setIModalVisible(true)}>
            <Text style={style.buttonText}>Upload File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={style.button} onPress={() => toggleModal()}>
            <Text style={style.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{alignItems: 'center', margin: 10}}>
        {selectedImage && (
          <Image
            source={{uri: selectedImage}}
            style={{height: 200, width: 200}}
            resizeMode="contain"
          />
        )}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={imodalVisible}
        onRequestClose={() => {
          setIModalVisible(!imodalVisible);
        }}>
        <View style={style.centeredView}>
          <View style={style.modalView}>
            <TouchableOpacity
              style={style.buttonI}
              onPress={handleCameraLaunch}>
              <Text style={style.modalText}>Take Photo...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={style.buttonI} onPress={openImagePicker}>
              <Text style={style.modalText}>Choose from Library...</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[style.buttonI, style.cancelButton]}
              onPress={() => setIModalVisible(!imodalVisible)}>
              <Text style={style.modalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {isModalVisible ? (
        <Modal transparent={true} animationType="fade">
          <View style={style.container1}>
            <Text style={style.header}>Secondary Closing Stock Details</Text>
            <FlatList
              data={products.slice(0, 10)} // limit for performance
              keyExtractor={item => item.alias}
              renderItem={renderItem}
            />
            <View style={style.buttonRow}>
              <Button title="Submit" onPress={handleSubmit} />
              <Button title="Close" onPress={() => oncClose()} color="red" />
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

export default SecondaryStockClosing;

const style = StyleSheet.create({
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputGroup: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
    backgroundColor: '#fef7f9',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonI: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
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
  container1: {flex: 1, padding: 10, backgroundColor: 'white'},
  header: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
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
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    padding: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12, // Rounded corners
    justifyContent: 'space-between',
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    //textAlign: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'left',
    color: 'red',
  },
  textLabel: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'Left',
  },
  mapView: {
    width: '100%',
    height: 200, // Adjusted height for the map to make it bigger
    marginVertical: 20,
    borderRadius: 10,
  },
  closeButtonContainer: {
    marginTop: 'auto', // Push the button to the bottom
    marginBottom: 10, // Space from the bottom
    width: '90%',
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  button: {
    backgroundColor: '#00695C',
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
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
});
