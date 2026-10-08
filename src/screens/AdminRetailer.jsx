import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
  LogBox,
  BackHandler,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { openDatabase } from 'react-native-sqlite-storage';
import moment from 'moment';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import DeviceInfo from 'react-native-device-info';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { MultiSelect, Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import { FlatList } from 'react-native';
import { BASE_URL } from '@env';
import NetInfo from '@react-native-community/netinfo';
import CustomDCR from '../components/custom/CustomDCR';
import ProgressDialog from '../components/custom/ProgressDialog';
import Snackbar from 'react-native-snackbar';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useFocusEffect, useNavigation, } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
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
const AdminRetailer = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [dcrDate, setDcrDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [divisionList, setDivisionList] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [bisnessId, setBisnessId] = useState(null);
  const [IDEmployee, setIDEmployee] = useState(null);
  const [designationList, setDesignationList] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [workTypeList, setWorkTypeList] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [visitWithList, setVisitWithList] = useState([]);
  const [selectedVisitWith, setSelectedVisitWith] = useState([]);
  const [visitListLoaded, setVisitListLoaded] = useState(false);
  const [areaListLoaded, setAreaListLoaded] = useState(false);
  const [areaList, setAreaList] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [retailerList, setRetailerList] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [retailerListLoaded, setRetailerListLoaded] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedTab, setSelectedTab] = useState('Sample');
  const [sampleList, setSampleList] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [sampleQty, setSampleQty] = useState('');
  const [addedSamples, setAddedSamples] = useState([]);
  const [giftList, setGiftList] = useState([]);
  const [selectedGift, setSelectedGift] = useState(null);
  const [giftQty, setGiftQty] = useState('');
  const [addedGifts, setAddedGifts] = useState([]);
  const [deviceType, setDevice] = useState('');

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'DcrAdminDashBoard' }], // or whatever your screen is
          }),
        );
        //navigation.navigate('DcrAdminDashBoard'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('UserData');
        if (userData) {
          const user = JSON.parse(userData);
          //console.log('✅ Loaded user:', user);
          setUserInfo(user);
          const bizId = user.BusinessID?.trim();
          setBisnessId(bizId);
          const empId = user.IDEmployee;
          setIDEmployee(empId);
          if (bizId && empId) {
            const state = await NetInfo.fetch();
            if (!state.isConnected) {
              Alert.alert('⚠️ OFFLINE', 'You are currently offline. Please connect to the internet and try again.');
              getOneTimeLocation();
              handleEnabledPressed();
              handleCheckPressed();
              return;
            }
            // console.log('✅ Calling fetchDivisionList with:', bizId);
            fetchDivisionList(bizId);
            fetchDesignationList(bizId);
            fetchWorkTypeList(bizId);
            // fetchStageOptions(bizId);
            // fetchCampaignList(bizId, empId);
            //fetchVisitWithList(bizId, empId);
          } else {
            console.log('❌ Business ID missing in user');
          }
        } else {
          console.log('❌ No UserData found in AsyncStorage');
        }
      } catch (e) {
        console.log('❌ Error reading AsyncStorage:', e);
      }

      getOneTimeLocation();
      handleEnabledPressed();
      handleCheckPressed();

      const locationInterval = setInterval(() => {
        getOneTimeLocation();
      }, 10000);
      return () => clearInterval(locationInterval);
    };

    initialize();

    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });

  }, []);


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
        setCurrentLong(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLat(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      // {enableHighAccuracy: true, timeout: 15000, maximumAge: 1000},
      { timeout: 15000 }, // 15 seconds timeout
    );
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

  const fetchDivisionList = async (businessId) => {
    //console.log('fetchDivisionList called with businessId:', businessId);
    if (!businessId) {
      console.log(' businessId is missing or empty');
      return;
    }

    try {
      const fullUrl = `${BASE_URL}Division/DivisionList?Businessid=${businessId}`;
      //console.log('🌐 Fetching Division API from URL:', fullUrl);

      const response = await axios.get(fullUrl);
      // console.log('✅ Division API Response:', response.data);

      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name?.trim(),
          value: item.IDDivision,
        }));
        setDivisionList(formatted);
        //console.log('✅ Formatted Division List:', formatted);
      } else {
        console.log('⚠️ Response is not an array');
        setDivisionList([]);
      }
    } catch (err) {
      console.log('❌ Error fetching divisions:', err.message);
    }
  };

  const fetchDesignationList = async (businessId) => {
    // console.log('📡 fetchDesignationList called with businessId:', businessId);
    if (!businessId) {
      console.error('❌ Invalid businessId for Designation fetch');
      return;
    }

    try {
      const fullUrl = `${BASE_URL}Designation/DesignationList?Businessid=${businessId}`;
      // console.log('🌐 Fetching Designation API from URL:', fullUrl);

      const response = await axios.get(fullUrl);
      //console.log('✅ Designation Response:', response.data);

      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name?.trim(),
          value: item.IDDesignation,
        }));
        setDesignationList(formatted);
      } else {
        setDesignationList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching designations:', error);
    }
  };

  const fetchWorkTypeList = async (businessId) => {
    try {
      const url = `${BASE_URL}Misc/List?Businessid=${businessId}&Type=WORKTYPE`;
      //console.log('Calling WorkType API:', url);
      const response = await axios.get(url);

      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name?.trim(),
          value: item.IDMisc,
        }));
        setWorkTypeList(formatted);

        // ✅ Set default selection to "WORKING"
        const defaultItem = formatted.find(item => item.label.toUpperCase() === 'WORKING');
        if (defaultItem) {
          setSelectedWorkType(defaultItem.value);
        }
      } else {
        setWorkTypeList([]);
      }
    } catch (error) {
      console.error('Error fetching WorkType list:', error);
    }
  };

  const fetchVisitWithList = async () => {
    if (selectedDivision === null || selectedDesignation === null) {
      console.log('Division or Designation not selected');
      return;
    }

    try {
      const url = `${BASE_URL}Employee/DivisionDesignationEmployeeListWithoutSelectedEmployee?Businessid=${bisnessId}&IDDivision=${selectedDivision}&IDDesignation=${selectedDesignation}&IDEmployee=${IDEmployee}`;
      console.log('Calling Visit With API:', url);
      const response = await axios.get(url);

      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name?.trim(),
          value: item.IDEmployee,
        }));
        setVisitWithList(formatted);
      } else {
        setVisitWithList([]);
      }
    } catch (error) {
      console.error('Error fetching Visit With list:', error);
    }
  };

  const fetchAreaList = async () => {
    if (!selectedVisitWith || selectedVisitWith.length === 0) {
      console.log(' No VisitWith selected');
      return;
    }

    // Check and map only if the objects are valid
    const employeeIdString = selectedVisitWith
      .map(emp => (typeof emp === 'object' ? emp.value : emp)) // fallback if already string/number
      .filter(Boolean) // remove nulls/undefined
      .join(',');

    if (!employeeIdString) {
      console.log('❌ No valid employee IDs found in VisitWith selection');
      return;
    }

    const url = `${BASE_URL}manager/DCR/MultipleEmployeeWiseAreaList?Businessid=${bisnessId}&Employees=${employeeIdString}`;
    console.log('✅ Calling Area List API:', url);

    try {
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        const formattedList = response.data.map(item => ({
          label: item.Name,
          value: item.IDArea,
        }));
        setAreaList(formattedList);
      } else {
        setAreaList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching area list:', error);
    }
  };

  const fetchRetailerList = async () => {
    if (!selectedVisitWith || selectedVisitWith.length === 0) {
      console.log('⚠️ No employees selected');
      return;
    }

    const employeeIds = selectedVisitWith
      .map(emp => (typeof emp === 'object' ? emp.value : emp))
      .filter(Boolean)
      .join(',');

    if (!employeeIds) {
      console.log('❌ Invalid employee IDs');
      return;
    }

    let url = `${BASE_URL}manager/DCR/MultipleEmployeeAndAreaWiseRetailerList?Businessid=${bisnessId}&Employees=${employeeIds}`;
    if (selectedArea) {
      url += `&IDArea=${selectedArea}`;
    }

    console.log('✅ Calling Retailer List API:', url);

    try {
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        const formattedRetailers = response.data.map(item => ({
          label: item.Name,
          value: item.IDRetailer,
        }));
        setRetailerList(formattedRetailers);
      } else {
        setRetailerList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching retailer list:', error);
    }
  };

  const fetchSampleList = async () => {
    if (!bisnessId || !selectedDivision) return;

    const url = `${BASE_URL}Product/ProductDivisionSampleGiftList?Businessid=${bisnessId}&IDDivision=${selectedDivision}&Type=DOCTORPRODUCT`;
    console.log('Calling Sample List API:', url);

    try {
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name,
          value: item.IDProduct,
        }));
        setSampleList(formatted);
      } else {
        setSampleList([]);
      }
    } catch (error) {
      console.error('Error fetching sample list:', error);
    }
  };

  const fetchGiftList = async () => {
    if (!bisnessId || !selectedDivision) return;
    const url = `${BASE_URL}Product/ProductDivisionSampleGiftList?Businessid=${bisnessId}&IDDivision=${selectedDivision}&Type=GIFT`;
    console.log('Calling Sample List API:', url);

    try {
      const response = await axios.get(url);
      if (Array.isArray(response.data)) {
        const formatted = response.data.map(item => ({
          label: item.Name,
          value: item.IDProduct,
        }));
        setGiftList(formatted);
      } else {
        setGiftList([]);
      }
    } catch (error) {
      console.error('Error fetching sample list:', error);
    }
  };

  const handleSaveDCR = async () => {
    // Basic Validation
    if (!selectedDivision) return Alert.alert('Validation', 'Please select a Division.');
    if (!selectedDesignation) return Alert.alert('Validation', 'Please select a Designation.');
    if (selectedVisitWith.length === 0) return Alert.alert('Validation', 'Please select Visit With employees.');
    if (!selectedArea) return Alert.alert('Validation', 'Please select an Area.');
    if (!selectedRetailer) return Alert.alert('Validation', 'Please select a Retailer.');
    if (!selectedWorkType) return Alert.alert('Validation', 'Please select a Work Type.');
    if (!remarks?.trim()) return Alert.alert('Validation', 'Remarks cannot be empty.');
    if (!currentLat || !currentLong) {
      Alert.alert('Validation', 'Please enable location services and try again.');
      return;
    }

    try {
      const payload = {
        IDDCR: 0,
        IDDay: 0,
        DCRDate: moment(dcrDate).format('YYYY-MM-DD'),
        DCRTime: '',
        DCRType: 'RETAILER',
        EntryType: 'ONLINE_' + deviceType,
        Sync: false,
        UserLat: parseFloat(currentLat),
        UserLong: parseFloat(currentLong),
        Remarks: remarks,
        User: userInfo.Empemail,
        IDEmployee: IDEmployee,
        IDWorktype: selectedWorkType,
        IDDoctor: selectedRetailer,
        Businessid: bisnessId,
        UNListed: false,
        Samples: addedSamples.map(item => ({
          IDProduct: item.id,
          Qty: Number(item.qty),
          Remarks: item.remarks || ''
        })),
        Gifts: addedGifts.map(item => ({
          IDProduct: item.id,
          Qty: Number(item.qty),
          Remarks: item.remarks || ''
        })),
        // ProductStatuss: doctorProductList.map(p => ({
        //     IDProduct: p.IDProduct,
        //     IDCurrentStatus: p.currentStage,
        //     IDFinalStatus: p.finalStage
        // })),
        Visitwiths: selectedVisitWith.map(id => ({ IDEmployee: id })),
        IDArea: selectedArea,
        // Name: '',
        // Campaign: campaignList.map(c => ({
        //     IDCampaign: c.IDCampaign,
        //     IDProduct: c.IDProduct,
        //     Remarks: c.remarks || ''
        // }))
      };

      console.log('Final Payload Preview:', JSON.stringify(payload, null, 2));

      // Check internet connection
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert('⚠️ Offline', 'You are currently offline. DCR submission is not available.');
        return;
      }

      // Confirm submission
      Alert.alert(
        'Confirm',
        'Do you want to submit the DCR?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit',
            onPress: async () => {
              try {
                const response = await axios.post(`${BASE_URL}Manager/DCR/Web/Save`, payload);

                if (response.status === 200) {
                  const res = response.data;

                  if (res && typeof res.result === 'string' && res.result.trim() === '') {
                    Alert.alert('✅ Success', 'DCR saved successfully!', [
                      {
                        text: 'OK',
                        onPress: () =>
                          navigation.dispatch(
                            CommonActions.reset({
                              index: 0,
                              routes: [{ name: 'DcrAdminDashBoard' }],
                            }),
                          ),
                      },
                    ]);

                    // Optional: Reset form states here if needed
                  } else {
                    Alert.alert('Info', `Response: ${res.result}`);
                  }
                } else {
                  Alert.alert('Error', 'Unexpected status from server.');
                }
              } catch (error) {
                console.error('❌ Error saving DCR:', error);
                Alert.alert('Error', 'Something went wrong while saving the DCR.');
              }

            }
          }
        ]
      );
    } catch (e) {
      console.error('❌ Validation/Mapping Error:', e);
      Alert.alert('Error', 'Something went wrong while preparing the data.');
    }
  };

  return (
    <KeyboardAwareLayout>
      <View style={styles.topInfo}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>Current Lat: {currentLat ?? '--'}</Text>
          <Text style={styles.infoText}>Current Long: {currentLong ?? '--'}</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveDCR}>
          <Text style={styles.saveButtonText}>Save DCR</Text>
        </TouchableOpacity>

      </View>


      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>Dcr Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
          <Text style={styles.dateText}>{moment(dcrDate).format('DD-MM-YYYY')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dcrDate}
            mode="date"
            display="default"
            maximumDate={new Date()} // 👈 This restricts selection to today and earlier
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDcrDate(selectedDate);
            }}
          />
        )}
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Work Type:</Text>
        <Dropdown
          style={styles.dropdown}
          data={workTypeList}
          labelField="label"
          valueField="value"
          placeholder="Select Work Type"
          value={selectedWorkType}
          onChange={item => setSelectedWorkType(item.value)}
          maxHeight={200}
          search
          searchPlaceholder="Search..."
          disable={true} // ✅ Makes it non-editable
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Division:</Text>
        <Dropdown
          style={styles.dropdown}
          data={divisionList}
          labelField="label"
          valueField="value"
          placeholder="Select Division"
          value={selectedDivision}
          onChange={item => setSelectedDivision(item.value)}
          maxHeight={200}
          search
          searchPlaceholder="Search..."
        />

      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Designation:</Text>
        <Dropdown
          style={styles.dropdown}
          data={designationList}
          labelField="label"
          valueField="value"
          placeholder="Select Designation"
          value={selectedDesignation}
          onChange={item => setSelectedDesignation(item.value)}
          maxHeight={200}
          search
          searchPlaceholder="Search..."
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Visit With:</Text>
        <MultiSelect
          style={styles.dropdown}
          data={visitWithList}
          labelField="label"
          valueField="value"
          placeholder="Select Employee(s)"
          value={selectedVisitWith}
          onChange={item => {
            console.log(' Selected items:', item);
            setSelectedVisitWith(item);
            setAreaListLoaded(false); //  Reset so area fetch can happen again
          }}
          onFocus={() => {
            if (!visitListLoaded && selectedDivision && selectedDesignation) {
              fetchVisitWithList(bisnessId, userInfo.Empno);
              setVisitListLoaded(true);
              setRetailerListLoaded(false);
            }
          }}
          search
          searchPlaceholder="Search..."
          renderItem={(item, selected) => (
            <View style={styles.itemContainer}>
              <Feather
                name={selected ? 'check-square' : 'square'}
                size={18}
                color={selected ? '#167d80' : '#aaa'}
                style={styles.checkboxIcon}
              />
              <Text style={[styles.itemText, selected && styles.selectedText]}>
                {item.label}
              </Text>
              <Feather
                name="user"
                size={16}
                color={selected ? '#167d80' : '#888'}
                style={styles.rightIcon}
              />
            </View>
          )}
          renderSelectedItem={(item, unSelect) => (
            <TouchableOpacity
              onPress={() => unSelect && unSelect(item)}
              style={styles.selectedChip}
            >
              <Text style={styles.chipText}>{item.label}</Text>
              <Feather name="x" size={14} color="#fff" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          )}
        />

      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Area :</Text>
        <Dropdown
          style={styles.dropdown}
          data={areaList}
          labelField="label"
          valueField="value"
          placeholder="Select Area"
          value={selectedArea}
          onFocus={() => {
            if (selectedVisitWith.length > 0 && !areaListLoaded) {
              fetchAreaList();
              setAreaListLoaded(true);
              setRetailerListLoaded(false);
            }
          }}
          search
          searchPlaceholder="Search..."
          onChange={item => setSelectedArea(item.value)}
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Select Retailer :</Text>
        <Dropdown
          style={styles.dropdown}
          data={retailerList}
          labelField="label"
          valueField="value"
          placeholder="Select Retailer"
          value={selectedRetailer}
          onChange={item => {
            setSelectedRetailer(item.value);
            // fetchRetailerProducts(item.value); // pass the selected retailer directly
          }}

          onFocus={() => {
            if (selectedVisitWith.length > 0) {
              fetchRetailerList();
              setRetailerListLoaded(true);
            } else {
              console.log('Select employees first before loading retailers.');
            }
          }}
          search
          searchPlaceholder="Search..."
        />
      </View>

      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Remarks :</Text>
        <TextInput
          style={styles.remarksInput1}
          placeholder="Enter remarks here"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
      <View style={styles.tabsContainer}>
        {['SAMPLE', 'GIFT'].map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTab === 'SAMPLE' && (
        <>
          <View style={styles.rowContainer}>
            <View style={styles.flex2}>
              <Text style={styles.dropdownLabel}>Select Sample:</Text>
              <Dropdown
                style={styles.dropdown}
                data={sampleList}
                labelField="label"
                valueField="value"
                placeholder="Select Sample"
                value={selectedSample}
                onFocus={() => {
                  if (sampleList.length === 0) fetchSampleList();
                }}
                onChange={item => setSelectedSample(item.value)}
                search
                searchPlaceholder="Search..."
              />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.dropdownLabel}>Qty:</Text>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={sampleQty}
                onChangeText={setSampleQty}
                placeholder="0"
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (!selectedSample || !sampleQty) {
                  Alert.alert('Error', 'Please select a sample and enter quantity.');
                  return;
                }

                const isDuplicate = addedSamples.some(item => item.id === selectedSample);
                if (isDuplicate) {
                  Alert.alert('Duplicate Entry', 'This sample is already added.');
                  return;
                }

                const selected = sampleList.find(s => s.value === selectedSample);
                const newItem = {
                  name: selected?.label,
                  id: selectedSample,
                  qty: sampleQty,
                };
                setAddedSamples(prev => [...prev, newItem]);
                setSelectedSample(null);
                setSampleQty('');
              }}

            >
              <Feather name="plus-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {addedSamples.length > 0 && (
            <View style={styles.addedSamplesContainer}>
              {addedSamples.map((item, index) => (
                <View key={index} style={styles.sampleRow}>
                  <Text style={styles.sampleText}>{item.name}</Text>
                  <Text style={styles.sampleQty}>{item.qty}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = addedSamples.filter((_, i) => i !== index);
                      setAddedSamples(updated);
                    }}
                  >
                    <Feather name="trash-2" size={20} color="#ff5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {selectedTab === 'GIFT' && (
        <>
          <View style={styles.rowContainer}>
            <View style={styles.flex2}>
              <Text style={styles.dropdownLabel}>Select Gift:</Text>
              <Dropdown
                style={styles.dropdown}
                data={giftList}
                labelField="label"
                valueField="value"
                placeholder="Select Gift"
                value={selectedGift}
                onFocus={() => {
                  if (giftList.length === 0) fetchGiftList();
                }}
                onChange={item => setSelectedGift(item.value)}
                search
                searchPlaceholder="Search..."
              />
            </View>

            <View style={styles.flex1}>
              <Text style={styles.dropdownLabel}>Qty:</Text>
              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                value={giftQty}
                onChangeText={setGiftQty}
                placeholder="0"
              />
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                if (!selectedGift || !giftQty) {
                  Alert.alert('Error', 'Please select a gift and enter quantity.');
                  return;
                }

                const isDuplicate = addedGifts.some(item => item.id === selectedGift);
                if (isDuplicate) {
                  Alert.alert('Duplicate Entry', 'This gift is already added.');
                  return;
                }

                const selected = giftList.find(s => s.value === selectedGift);
                const newItem = {
                  name: selected?.label,
                  id: selectedGift,
                  qty: giftQty,
                };
                setAddedGifts(prev => [...prev, newItem]);
                setSelectedGift(null);
                setGiftQty('');
              }}

            >
              <Feather name="plus-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {addedGifts.length > 0 && (
            <View style={styles.addedSamplesContainer}>
              {addedGifts.map((item, index) => (
                <View key={index} style={styles.sampleRow}>
                  <Text style={styles.sampleText}>{item.name}</Text>
                  <Text style={styles.sampleQty}>{item.qty}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = addedGifts.filter((_, i) => i !== index);
                      setAddedGifts(updated);
                    }}
                  >
                    <Feather name="trash-2" size={20} color="#ff5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}


    </KeyboardAwareLayout>
  );
};

export default AdminRetailer;
const styles = StyleSheet.create({
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  infoBlock: {
    flex: 1,
  },

  saveButton: {
    backgroundColor: '#167d80',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dateContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  dateLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginBottom: 5,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#00796b',
  },
  dropdownContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dropdown: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  checkboxIcon: {
    marginRight: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#167d80',
    fontWeight: '600',
  },
  rightIcon: {
    marginLeft: 10,
  },
  selectedChip: {
    flexDirection: 'row',
    backgroundColor: '#167d80',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 4,
    alignItems: 'center',
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  remarksInput1: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    minHeight: 80,
    fontSize: 14,
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginHorizontal: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderColor: '#dddddd',
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginRight: 8,
    marginLeft: 8,
    flex: 1,
    alignItems: 'center',
  },

  tabButtonActive: {
    backgroundColor: '#167d80',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
  },

  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    marginTop: 20,
    gap: 10,
  },
  flex2: {
    flex: 2,
  },
  flex1: {
    flex: 1,
  },
  qtyInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#167d80',
    height: 45,
    width: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  addedSamplesContainer: {
    marginTop: 10,
    marginHorizontal: 15,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  sampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  sampleText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  sampleQty: {
    width: 40,
    textAlign: 'center',
    color: '#167d80',
    fontWeight: '600',
  },

  productStageContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  productRow: {
    flexDirection: 'column',
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#167d80',
    marginBottom: 8,
  },
  stageDropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  campaignCard: {
    backgroundColor: '#f1f8ff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  campaignText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  remarksInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },

});