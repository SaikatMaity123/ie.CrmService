import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { openDatabase } from 'react-native-sqlite-storage';
import CustomButton from '../components/custom/CustomButton';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import { BASE_URL } from '@env';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import { useFocusEffect, useNavigation, } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
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

const AdminOthers = () => {
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState({});
  const [currentLat, setCurrentLat] = useState(null);
  const [currentLong, setCurrentLong] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [dcrDate, setDcrDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bisnessId, setBisnessId] = useState(null);
  const [IDEmployee, setIDEmployee] = useState(null);
  const [workTypeList, setWorkTypeList] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState(null);
  const [remarks, setRemarks] = useState('');
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

        // // ✅ Set default selection to "WORKING"
        // const defaultItem = formatted.find(item => item.label.toUpperCase() === 'WORKING');
        // if (defaultItem) {
        //   setSelectedWorkType(defaultItem.value);
        // }
      } else {
        setWorkTypeList([]);
      }
    } catch (error) {
      console.error('Error fetching WorkType list:', error);
    }
  };

  const handleSaveDCR = async () => {
    console.log('Saving DCR with:', selectedWorkType, remarks, currentLat, currentLong);
    // Basic Validation
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
        DCRType: 'OTHERS',
        EntryType: 'ONLINE_' + deviceType,
        Sync: false,
        UserLat: parseFloat(currentLat),
        UserLong: parseFloat(currentLong),
        Remarks: remarks,
        User: userInfo.Empemail,
        IDEmployee: IDEmployee,
        IDWorktype: selectedWorkType,
        // IDRetailer: 0,
        Businessid: bisnessId,
        UNListed: false,
        // Samples: addedSamples.map(item => ({
        //   IDProduct: item.id,
        //   Qty: Number(item.qty),
        //   Remarks: item.remarks || ''
        // })),
        // Gifts: addedGifts.map(item => ({
        //   IDProduct: item.id,
        //   Qty: Number(item.qty),
        //   Remarks: item.remarks || ''
        // })),
        // ProductStatuss: doctorProductList.map(p => ({
        //     IDProduct: p.IDProduct,
        //     IDCurrentStatus: p.currentStage,
        //     IDFinalStatus: p.finalStage
        // })),
        // Visitwiths: selectedVisitWith.map(id => ({ IDEmployee: id })),
        // IDArea: selectedArea,
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
          //disable={true} // ✅ Makes it non-editable
        />
      </View>
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Remarks :</Text>
        <TextInput
          style={styles.remarksInput}
          placeholder="Enter remarks here"
          value={remarks}
          onChangeText={setRemarks}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </KeyboardAwareLayout>
  );
};

export default AdminOthers;
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
  remarksInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    minHeight: 80,
    fontSize: 14,
    color: '#333',
  },
});