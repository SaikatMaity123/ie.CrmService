import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert, Image, PermissionsAndroid, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL } from '@env';
import { TextInput } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import DocumentPicker from 'react-native-document-picker';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import NetInfo from "@react-native-community/netinfo";
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import { GOOGLE_MAPS_API_KEY } from '@env';
Geocoder.init(GOOGLE_MAPS_API_KEY);
import { fi } from 'date-fns/locale';

const LeadFollowup = () => {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hexKey, setHexKey] = useState('');
  const [businessID, setBusinessID] = useState('');
  const [idUser, setIdUser] = useState('');
  const [userType, setUserType] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(
    moment().subtract(6, 'months').format("DD-MM-YYYY")
  );
  const [endDate, setEndDate] = useState(
    moment().format("DD-MM-YYYY")
  );
  const [useUName, setuserName] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState('');
  const [followups, setFollowups] = useState([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [autoCode, setAutoCode] = useState('');

  const [nextDate, setNextDate] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [followBy, setFollowBy] = useState('');
  const [remarks, setRemarks] = useState('');

  const [rating, setRating] = useState(null);

  const [communicationList, setCommunicationList] = useState([]);
  const [communication, setCommunication] = useState(null);
  const [visitImage, setVisitImage] = useState(null);
  const [visitLat, setVisitLat] = useState(null);
  const [visitLong, setVisitLong] = useState(null);
  const [visitPlaceName, setVisitPlaceName] = useState('');
  const [visitLocationLoading, setVisitLocationLoading] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [givenDocs, setGivenDocs] = useState([]);
  const [receivedDocs, setReceivedDocs] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  const ratingList = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];


  useEffect(() => {
    loadUser();
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);


  const checkInternet = async () => {

    const state = await NetInfo.fetch();

    if (!state.isConnected) {

      Alert.alert(
        "Offline",
        "You are currently offline. Please check your internet connection."
      );

      return false;
    }

    return true;
  };


  const loadUser = async () => {

    try {

      const userDataStr = await AsyncStorage.getItem('UserData');

      if (!userDataStr) return;

      const user = JSON.parse(userDataStr);

      setHexKey(user.CompanyHexKey);
      setBusinessID(user.CompanyCode);
      setIdUser(user.IDUser);
      setUserType(user.UserType);
      setuserName(user.UserName);

      fetchLeads(
        user.CompanyHexKey,
        user.IDUser,
        user.UserType,
        user.CompanyCode,
        startDate,
        endDate
      );

    } catch (error) {
      console.log(error);
    }
  };


  const fetchLeads = async (hex, uid, type, business, sDate, eDate) => {
    const online = await checkInternet();

    if (!online) return;
    try {

      setLoading(true);

      const url =
        `${BASE_URL}LeadFollowUp/List?HexKey=${hex}&IDUser=${uid}&UserType=${type}&BusinessID=${business}&SDate=${sDate}&EDate=${eDate}`;

      const response = await axios.get(url);

      const list = response.data.data || [];
      setData(list);
      setFilteredData(list);

    } catch (error) {

      console.log("API Error", error);

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };

  const fetchFollowups = async (leadNo) => {
    const online = await checkInternet();

    if (!online) return;


    try {
      setFollowLoading(true);

      const url =
        `${BASE_URL}LeadFollowUp/Detail?HexKey=${hexKey}&LeadNo=${leadNo}`;

      const res = await axios.get(url);
      const list = res?.data?.data || [];

      setFollowups(list);
      setShowFollowModal(true);
    } catch (e) {
      console.log('FollowUp API Error', e);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSearch = (text) => {

    setSearchText(text);

    if (text === '') {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item =>
      item.LeadNo?.toLowerCase().includes(text.toLowerCase()) ||
      item.Account?.toLowerCase().includes(text.toLowerCase()) ||
      item.Phone?.toLowerCase().includes(text.toLowerCase()) ||
      item.Email?.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const onRefresh = () => {

    setRefreshing(true);

    fetchLeads(
      hexKey,
      idUser,
      userType,
      businessID,
      startDate,
      endDate
    );
  };

  const RatingStars = ({ rating }) => {

    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color="#FFC107"
          style={{ marginRight: 2 }}
        />
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
        <Text style={{ marginLeft: 5, color: '#777' }}>{rating}/5</Text>
      </View>
    );
  };

  const showDatePicker = (type) => {
    setDateType(type);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date) => {

    const formatted = moment(date).format("DD/MMM/YYYY").toUpperCase();

    if (dateType === "start") {
      setStartDate(formatted);
    }

    else if (dateType === "end") {
      setEndDate(formatted);
    }

    else if (dateType === "next") {
      setNextDate(formatted);
    }

    setDatePickerVisible(false);

  };

  const applyFilter = () => {

    fetchLeads(
      hexKey,
      idUser,
      userType,
      businessID,
      startDate,
      endDate
    );

    setShowFilter(false);
  };

  const handleAddFollowup = async (lead) => {
    setFollowLoading(true);
    try {

      const url =
        `${BASE_URL}LeadFollowUp/Exist/Today?HexKey=${hexKey}&IDLead=${lead.IDLead}`;

      const res = await axios.get(url);

      if (res.data.data.ResultID !== 0) {

        Alert.alert(
          "Follow-up Exists",
          "A follow-up has already been added today."
        );

        return;

      }

      setSelectedLeadId(lead.IDLead);

      await loadAutoCode();
      await loadCommunication();

      setAddModalVisible(true);

    } catch (err) {

      console.log(err);

    } finally {
      setFollowLoading(false);

    }

  };

  const loadAutoCode = async () => {

    const url =
      `${BASE_URL}LeadFollowUp/AutoCode?HexKey=${hexKey}&Type=LEADFOLLOWUP`;

    const res = await axios.get(url);

    setAutoCode(res.data.data.AutoCode);

  };

  // const loadCommunication = async () => {

  //   const url =
  //     `${BASE_URL}Misc/MiscList?HexKey=${hexKey}&type=COMMUNICATION`;

  //   console.log("Fetching communication methods...", url);
  //   const res = await axios.get(url);

  //   const list = res.data.data.map(x => ({
  //     label: x.Name,
  //     value: x.Name
  //   }));

  //   setCommunicationList(list);

  // };

  const loadCommunication = async () => {
    try {
      const url = `${BASE_URL}Misc/MiscList?HexKey=${hexKey}&type=COMMUNICATION`;

      console.log('Fetching communication methods...', url);

      const res = await axios.get(url);

      const list = res.data.data.map(x => ({
        label: x.Name,
        value: x.Code,       // VISIT, PHONE CALL, EMAIL
        id: x.IDMisc,
        name: x.Name,
      }));

      setCommunicationList(list);
    } catch (error) {
      console.log('Communication Load Error:', error);
      Alert.alert('Error', 'Unable to load communication methods.');
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Camera permission is required to capture visit image.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const captureVisitImage = async () => {
    try {
      const hasPermission = await requestCameraPermission();

      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.7,
        saveToPhotos: false,
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
        return;
      }

      if (result.errorCode) {
        console.log('Camera Error:', result.errorMessage);
        Alert.alert('Camera Error', result.errorMessage || 'Unable to open camera.');
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert('Error', 'No image captured.');
        return;
      }

      const imageObj = {
        uri: asset.uri,
        name: asset.fileName || `visit_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
      };

      setVisitImage(imageObj);
    } catch (error) {
      console.log('Capture Visit Image Error:', error);
      Alert.alert('Error', 'Something went wrong while capturing image.');
    }
  };

  const handleCommunicationChange = async item => {
    const selectedValue = item.value;

    setCommunication(selectedValue);

    if (item.value === 'VISIT') {
      await getVisitLocation();
      await captureVisitImage();
    } else {
      setVisitLat(null);
      setVisitLong(null);
      setVisitPlaceName('');
      setVisitImage(null);
    }
  };

  const ensureGpsEnabled = async () => {
    try {
      if (Platform.OS === 'android') {
        const enabled = await isLocationEnabled();

        if (!enabled) {
          Alert.alert('GPS Not Active', 'Please enable GPS location.');
          await promptForEnableLocationIfNeeded();
        }
      }

      return true;
    } catch (error) {
      console.log('GPS Enable Error:', error);
      return false;
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const fineGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Location permission is required for Visit follow-up.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );

      return fineGranted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission Error:', error);
      return false;
    }
  };

  const getCurrentPositionAsync = options => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  const getPlaceNameFromLatLong = async (latitude, longitude) => {
    try {
      const geo = await Geocoder.from(latitude, longitude);

      if (geo.results?.length > 0) {
        return geo.results[0].formatted_address;
      }

      return '';
    } catch (error) {
      console.log('Geocoder Error:', error);
      return '';
    }
  };

  const getVisitLocation = async () => {
    try {
      setVisitLocationLoading(true);

      const gpsEnabled = await ensureGpsEnabled();

      if (!gpsEnabled) {
        setVisitLocationLoading(false);
        Alert.alert('GPS Error', 'Please enable GPS manually and try again.');
        return false;
      }

      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        setVisitLocationLoading(false);
        Alert.alert(
          'Permission Denied',
          'Please allow location permission for this app.',
        );
        return false;
      }

      // STEP 1: Try cached/fast location first
      try {
        const cachedLocation = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 600000, // 10 minutes cache
            },
          );
        });

        const { latitude, longitude } = cachedLocation.coords;

        const place = await getPlaceNameFromLatLong(latitude, longitude);

        setVisitLat(latitude);
        setVisitLong(longitude);
        setVisitPlaceName(place);

        console.log('CACHED VISIT LOCATION:', latitude, longitude, place);

        setVisitLocationLoading(false);
        return true;

      } catch (cachedError) {
        console.log('Fast Location Failed:', cachedError);
      }

      // STEP 2: Use watchPosition, same concept as Attendance page
      const liveLocationResult = await new Promise((resolve, reject) => {
        let watchId = null;
        let completed = false;

        const timeoutId = setTimeout(() => {
          if (!completed) {
            completed = true;

            if (watchId !== null) {
              Geolocation.clearWatch(watchId);
            }

            reject({
              code: 3,
              message: 'Live location timeout',
            });
          }
        }, 45000); // wait 45 seconds

        watchId = Geolocation.watchPosition(
          async position => {
            if (completed) return;

            const { latitude, longitude, accuracy } = position.coords;

            console.log(
              'LIVE VISIT LOCATION:',
              latitude,
              longitude,
              'Accuracy:',
              accuracy,
            );

            if (latitude && longitude) {
              completed = true;

              clearTimeout(timeoutId);

              if (watchId !== null) {
                Geolocation.clearWatch(watchId);
              }

              resolve(position);
            }
          },
          error => {
            console.log('Watch Location Error:', error);

            // Do not reject immediately for timeout.
            // Wait for our 45 second timeout.
            if (error.code === 1) {
              if (!completed) {
                completed = true;

                clearTimeout(timeoutId);

                if (watchId !== null) {
                  Geolocation.clearWatch(watchId);
                }

                reject(error);
              }
            }
          },
          {
            enableHighAccuracy: false,
            distanceFilter: 0,
            interval: 3000,
            fastestInterval: 2000,
            maximumAge: 600000,
          },
        );
      });

      const { latitude, longitude } = liveLocationResult.coords;

      const place = await getPlaceNameFromLatLong(latitude, longitude);

      setVisitLat(latitude);
      setVisitLong(longitude);
      setVisitPlaceName(place);

      console.log('FINAL VISIT LAT:', latitude);
      console.log('FINAL VISIT LONG:', longitude);
      console.log('FINAL VISIT PLACE:', place);

      setVisitLocationLoading(false);
      return true;

    } catch (error) {
      console.log('Visit Location Error:', error);

      setVisitLocationLoading(false);

      if (error.code === 3) {
        Alert.alert(
          'Location Timeout',
          'Location is not available. Please check GPS, internet, and try again in an open area.',
        );
      } else if (error.code === 1) {
        Alert.alert(
          'Permission Denied',
          'Please allow location permission from app settings.',
        );
      } else if (error.code === 2) {
        Alert.alert(
          'Location Unavailable',
          'Phone location service is unavailable right now.',
        );
      } else {
        Alert.alert('Location Error', 'Unable to fetch visit location.');
      }

      return false;
    }
  };

  const pickDocument = async (type) => {

    try {

      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const file = res[0];

      if (type === "given") {

        if (givenDocs.length >= 5) {
          Alert.alert("Limit Reached", "Maximum 5 files allowed.");
          return;
        }

        setGivenDocs([...givenDocs, file]);

      } else {

        if (receivedDocs.length >= 5) {
          Alert.alert("Limit Reached", "Maximum 5 files allowed.");
          return;
        }

        setReceivedDocs([...receivedDocs, file]);

      }

    } catch (err) {

      if (!DocumentPicker.isCancel(err)) {
        console.log(err);
      }

    }
  };

  const removeFile = (index, type) => {

    if (type === "given") {

      const updated = [...givenDocs];
      updated.splice(index, 1);
      setGivenDocs(updated);

    } else {

      const updated = [...receivedDocs];
      updated.splice(index, 1);
      setReceivedDocs(updated);

    }

  };


  const cleanFileName = fileName => {
    if (!fileName) {
      return `file_${Date.now()}`;
    }

    return fileName
      .replace(/\s+/g, '_')             // space to underscore
      .replace(/[()]/g, '')             // remove brackets
      .replace(/[^a-zA-Z0-9._-]/g, '')  // remove unsafe chars
      .replace(/_+/g, '_');
  };

  const getOriginalNameWithoutExtension = fileName => {
    if (!fileName) {
      return `document_${Date.now()}`;
    }

    const parts = fileName.split('.');
    if (parts.length <= 1) {
      return fileName;
    }

    parts.pop();
    return parts.join('.');
  };

  const getExtension = fileName => {
    if (!fileName || !fileName.includes('.')) {
      return '';
    }

    return fileName.split('.').pop();
  };

  const appendFileToFormData = (formData, file, customFileName) => {
    if (!file || !file.uri) {
      return;
    }

    formData.append('files', {
      uri: file.uri,
      name: cleanFileName(customFileName),
      type: file.type || 'application/octet-stream',
    });
  };

  const saveFollowup = async () => {
    if (!nextDate || !contactPerson || !followBy || !communication || !autoCode || !remarks) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }
    if (!isConnected) {
      Alert.alert(
        "Offline",
        "You are currently offline. Please check your internet connection."
      );
      return;
    }
    setLoading(true);
    try {

      const url = `${BASE_URL}LeadFollowUp/Save?HexKey=${hexKey}`;

      const param = {

        IDFollowUp: 0,
        IDLead: selectedLeadId,
        FollowupCode: autoCode,
        NextFollowupDate: nextDate,
        Points: rating,
        ContactPerson: contactPerson,
        ComMethod: communication,
        FollowedBy: followBy,
        Commercial: false,
        Remarks: remarks,
        EntryUser: useUName,
        IDUser: idUser,
        BusinessID: businessID,
        Place: visitPlaceName,
        Latitude: visitLat,
        Longitude: visitLong,


      };

      const formData = new FormData();

      // JSON DATA
      formData.append("data", JSON.stringify(param));

      // // RECEIVED DOCUMENTS
      // receivedDocs.forEach(file => {

      //   const originalName = file.name.split('.').slice(0, -1).join('.');
      //   const extension = file.name.split('.').pop();

      //   const customFileName =
      //     `${selectedLeadId}_${autoCode}_${originalName}_Received.${extension}`;

      //   formData.append("files", {
      //     uri: file.uri,
      //     name: customFileName,
      //     type: file.type
      //   });

      // });

      // // GIVEN DOCUMENTS
      // givenDocs.forEach(file => {

      //   const originalName = file.name.split('.').slice(0, -1).join('.');
      //   const extension = file.name.split('.').pop();

      //   const customFileName =
      //     `${selectedLeadId}_${autoCode}_${originalName}_Given.${extension}`;

      //   formData.append("files", {
      //     uri: file.uri,
      //     name: customFileName,
      //     type: file.type
      //   });

      // });

      // // VISIT IMAGE
      // if (visitImage) {
      //   const originalName = visitImage.name.split('.').slice(0, -1).join('.');
      //   const extension = visitImage.name.split('.').pop();
      //   const customFileName = `${selectedLeadId}_${originalName}_Visit.${extension}`;
      //   formData.append("files", {
      //     uri: visitImage.uri,
      //     name: customFileName,
      //     type: visitImage.type
      //   });
      // };

      // RECEIVED DOCUMENTS
      receivedDocs.forEach(file => {
        const originalName = getOriginalNameWithoutExtension(file.name);
        const extension = getExtension(file.name);

        const customFileName = extension
          ? `${selectedLeadId}_${autoCode}_${originalName}_Received.${extension}`
          : `${selectedLeadId}_${autoCode}_${originalName}_Received`;

        appendFileToFormData(formData, file, customFileName);
      });

      // GIVEN DOCUMENTS
      givenDocs.forEach(file => {
        const originalName = getOriginalNameWithoutExtension(file.name);
        const extension = getExtension(file.name);

        const customFileName = extension
          ? `${selectedLeadId}_${autoCode}_${originalName}_Given.${extension}`
          : `${selectedLeadId}_${autoCode}_${originalName}_Given`;

        appendFileToFormData(formData, file, customFileName);
      });

      // VISIT IMAGE - only one live clicked image
      if (visitImage) {
        const imageName = visitImage.name || `visit_${Date.now()}.jpg`;
        const originalName = getOriginalNameWithoutExtension(imageName);
        const extension = getExtension(imageName) || 'jpg';

        const customFileName =
          `${selectedLeadId}_${autoCode}_${originalName}_Visit.${extension}`;

        appendFileToFormData(formData, visitImage, customFileName);
      }

      console.log("Sending formData...");

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data"
        }
      });

      const result = await response.json();

      console.log("SAVE RESPONSE", result);

      if (result.Status === "SUCCESS") {

        Alert.alert("Success", result.Message);

        setAddModalVisible(false);

        setContactPerson('');
        setFollowBy('');
        setRemarks('');
        setRating(null);
        setNextDate('');
        setGivenDocs([]);
        setReceivedDocs([]);
        setCommunication(null);
        setVisitImage(null);

        fetchLeads(hexKey, idUser, userType, businessID, startDate, endDate);

      } else {

        Alert.alert("Error", result.Message);

      }

    } catch (error) {

      console.log("Save Followup Error", error);

    }
    finally {
      setLoading(false);
    }

  };

  const clearVisitData = () => {
    setVisitImage(null);
    setVisitLat(null);
    setVisitLong(null);
    setVisitPlaceName('');
    setVisitLocationLoading(false);
    setCommunication('');
    setRating(null);
  };

  const renderItem = ({ item }) => (

    <View style={styles.card}>

      <View style={styles.cardHeader}>
        <Text style={styles.leadNo}>{item.LeadNo}</Text>
        <Text style={styles.date}>{item.LeadDate}</Text>
      </View>

      <Text style={styles.account}>{item.Account}</Text>

      <View style={styles.row}>
        <Ionicons name="call-outline" size={16} color="#005696" />
        <Text style={styles.value}> {item.Phone}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="mail-outline" size={16} color="#005696" />
        <Text style={styles.value}> {item.Email}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="eye-outline" size={16} color="#005696" />
        <Text style={styles.value}> Visit: {item.Visit}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Rating:</Text>
        <RatingStars rating={item.Rating} />
      </View>

      {/* ACTION BUTTONS */}

      <View style={styles.actionRow}>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            setSelectedLead(item);
            fetchFollowups(item.LeadNo);
          }}
        >
          <Ionicons name="list-outline" size={20} color="#005696" />
          {/* <Text style={styles.actionText}>Follow-ups</Text> */}
          <Text style={styles.actionText}>Pre-Calls</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleAddFollowup(item)}
        >
          <Ionicons name="add-circle-outline" size={22} color="#2ecc71" />
          <Text style={styles.actionText}>Add Follow-up</Text>
        </TouchableOpacity>

      </View>

    </View>
  );

  const renderFollowItem = ({ item }) => (
    <View style={styles.followCard}>
      <View style={styles.followHeader}>
        <Text style={styles.followNo}>{item.FollowUpNo}</Text>
        <Text style={styles.followDate}>{item.FollowUpDate}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="person-outline" size={16} color="#005696" />
        <Text style={styles.followText}> {item.ContactPerson}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="chatbox-ellipses-outline" size={16} color="#005696" />
        <Text style={styles.followText}> {item.CommunicationMethod}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="calendar-outline" size={16} color="#005696" />
        <Text style={styles.followText}> Next: {item.NextFollowDate}</Text>
      </View>
      <View style={styles.followRow}>
        <Ionicons name="person-outline" size={16} color="#005696" />
        <Text style={styles.followText}> Followed By: {item.FollowedBy}</Text>
      </View>

      <Text style={styles.remarks}>Remarks: {item.Remarks}</Text>
    </View>
  );

  return (

    <View style={styles.container}>

      <StatusBar backgroundColor="#005696" barStyle="light-content" />

      {/* HEADER */}

      <View style={styles.header}>

        <View style={styles.searchBox}>

          <Ionicons name="search-outline" size={18} color="#777" />

          <TextInput
            placeholder="Search Lead..."
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            mode="flat"
          />

        </View>

        <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
          <Ionicons name="filter-outline" size={24} color="#005696" />
        </TouchableOpacity>

      </View>

      {/* FILTER SECTION */}

      {showFilter && (

        <View style={styles.filterBox}>

          <TouchableOpacity onPress={() => showDatePicker("start")}>
            <TextInput
              label="Start Date"
              value={startDate}
              mode="outlined"
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => showDatePicker("end")}>
            <TextInput
              label="End Date"
              value={endDate}
              mode="outlined"
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchBtn} onPress={applyFilter}>

            <Ionicons name="search-outline" size={18} color="#fff" />

            <Text style={styles.searchText}> Apply Filter</Text>

          </TouchableOpacity>

        </View>

      )}

      <DateTimePickerModal
        isVisible={datePickerVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={hideDatePicker}
      />

      {loading ?

        <ActivityIndicator size="large" color="#005696" style={{ marginTop: 40 }} />

        :

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.IDLead.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ padding: 15 }}
        />

      }

      {followLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#005696" />
        </View>
      )}

      {loading && (

        <View style={styles.loaderContainer}>

          <ActivityIndicator
            size="large"
            color="#005696"
          />

          <Text style={{ marginTop: 8 }}>Loading...</Text>

        </View>

      )}

      <Modal
        visible={showFollowModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Follow-ups {selectedLead?.LeadNo}
              </Text>

              <TouchableOpacity onPress={() => setShowFollowModal(false)}>
                <Ionicons name="close-circle-outline" size={28} color="#005696" />
              </TouchableOpacity>
            </View>

            {followLoading ? (
              <ActivityIndicator size="large" color="#005696" />
            ) : followups.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="document-text-outline" size={40} color="#999" />
                <Text style={styles.emptyText}>No Follow-ups Found</Text>
              </View>
            ) : (
              <FlatList
                data={followups}
                keyExtractor={(item) => item.IDFollowUp.toString()}
                renderItem={renderFollowItem}
              />
            )}

          </View>
        </View>
      </Modal>

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
      >
        <KeyboardAwareLayout>
          <View style={styles.modalContainer1}>

            <View style={styles.modalBox}>

              <Text style={styles.modalTitle1}>Add Follow-up</Text>

              <TextInput
                label="Follow-up Code"
                value={autoCode}
                mode="outlined"
                editable={false}
              />

              <TouchableOpacity onPress={() => showDatePicker("next")}>

                <TextInput
                  label="Next Follow Date"
                  value={nextDate}
                  mode="outlined"
                  editable={false}
                  right={<TextInput.Icon icon="calendar" />}
                />

              </TouchableOpacity>

              <TextInput
                label="Contact Person"
                mode="outlined"
                value={contactPerson}
                onChangeText={setContactPerson}
              />

              <TextInput
                label="Followed By"
                mode="outlined"
                value={followBy}
                onChangeText={setFollowBy}
              />

              {/* <Dropdown
                style={styles.dropdown}
                data={communicationList}
                labelField="label"
                valueField="value"
                placeholder="Communication Method"
                value={communication}
                onChange={item => setCommunication(item.value)}
              /> */}

              <Dropdown
                style={styles.dropdown}
                data={communicationList}
                labelField="label"
                valueField="value"
                placeholder="Communication Method"
                value={communication}
                onChange={handleCommunicationChange}
              />

              {communication === 'VISIT' && (
                <View style={styles.visitLocationBox}>
                  <Text style={styles.visitLocationTitle}>Visit Location</Text>

                  {visitLocationLoading ? (
                    <View style={styles.locationLoadingRow}>
                      <ActivityIndicator size="small" />
                      <Text style={styles.locationLoadingText}>Fetching location...</Text>
                    </View>
                  ) : (
                    <>
                      {visitLat && visitLong ? (
                        <>
                          <View style={styles.locationRow}>
                            <Text style={styles.locationText}>
                              Lat: {Number(visitLat).toFixed(6)}
                            </Text>

                            <Text style={styles.locationText}>
                              Long: {Number(visitLong).toFixed(6)}
                            </Text>
                          </View>
                          {visitPlaceName !== '' && (
                            <Text style={styles.placeText}>
                              Place: {visitPlaceName}
                            </Text>
                          )}
                        </>
                      ) : (
                        <Text style={styles.locationErrorText}>
                          Location not captured yet.
                        </Text>
                      )}

                      <TouchableOpacity
                        style={styles.refreshLocationBtn}
                        onPress={getVisitLocation}
                      >
                        <Text style={styles.refreshLocationText}>Refresh Location</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {communication === 'VISIT' && (
                <View style={styles.uploadBox}>
                  <Text style={styles.uploadTitle}>Live Visit Image</Text>

                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={captureVisitImage}
                  >
                    <Ionicons name="camera-outline" size={22} color="#005696" />
                    <Text style={styles.uploadText}>
                      {visitImage ? 'Retake Visit Image' : 'Capture Visit Image'}
                    </Text>
                  </TouchableOpacity>

                  {visitImage && (
                    <View style={{ marginTop: 10 }}>
                      <Image
                        source={{ uri: visitImage.uri }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 10,
                          resizeMode: 'cover',
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => setVisitImage(null)}
                        style={{ marginTop: 8 }}
                      >
                        <Text style={{ color: '#e74c3c', fontWeight: '600' }}>
                          Remove Image
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}


              <Dropdown
                style={styles.dropdown}
                data={ratingList}
                labelField="label"
                valueField="value"
                placeholder="Rating"
                value={rating}
                onChange={item => setRating(item.value)}
              />

              <TextInput
                label="Remarks"
                mode="outlined"
                multiline
                numberOfLines={4}
                value={remarks}
                onChangeText={setRemarks}
              />

              {/* GIVEN DOCUMENT */}

              <View style={styles.uploadBox}>

                <Text style={styles.uploadTitle}>Given Documents</Text>

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickDocument("given")}
                >
                  <Ionicons name="cloud-upload-outline" size={22} color="#005696" />
                  <Text style={styles.uploadText}>Upload File</Text>
                </TouchableOpacity>

                {givenDocs.map((file, index) => (

                  <View key={index} style={styles.fileRow}>

                    <Ionicons name="document-outline" size={18} color="#005696" />

                    <Text style={styles.fileName}>{file.name}</Text>

                    <TouchableOpacity onPress={() => removeFile(index, "given")}>

                      <Ionicons name="close-circle" size={20} color="#e74c3c" />

                    </TouchableOpacity>

                  </View>

                ))}

              </View>


              {/* RECEIVED DOCUMENT */}

              <View style={styles.uploadBox}>

                <Text style={styles.uploadTitle}>Received Documents</Text>

                <TouchableOpacity
                  style={styles.uploadBtn}
                  onPress={() => pickDocument("received")}
                >
                  <Ionicons name="cloud-upload-outline" size={22} color="#2ecc71" />
                  <Text style={styles.uploadText}>Upload File</Text>
                </TouchableOpacity>

                {receivedDocs.map((file, index) => (

                  <View key={index} style={styles.fileRow}>

                    <Ionicons name="document-outline" size={18} color="#2ecc71" />

                    <Text style={styles.fileName}>{file.name}</Text>

                    <TouchableOpacity onPress={() => removeFile(index, "received")}>

                      <Ionicons name="close-circle" size={20} color="#e74c3c" />

                    </TouchableOpacity>

                  </View>

                ))}

              </View>

              <View style={styles.modalBtnRow}>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    clearVisitData();
                    setAddModalVisible(false);
                  }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={saveFollowup}
                >
                  <Text style={{ color: '#fff' }}>Save</Text>
                </TouchableOpacity>

              </View>


            </View>
          </View>
        </KeyboardAwareLayout>
      </Modal>

    </View>
  );
};

export default LeadFollowup;
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f3f6fb'
  },

  header: {
    backgroundColor: '#ffffff',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f4f8',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10
  },

  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    marginLeft: 6
  },

  filterBox: {
    backgroundColor: '#fff',
    padding: 15,
    elevation: 3
  },

  input: {
    marginBottom: 10
  },

  searchBtn: {
    flexDirection: 'row',
    backgroundColor: '#005696',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },

  searchText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },

  leadNo: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#005696'
  },

  date: {
    color: '#777'
  },

  account: {
    fontWeight: '600',
    marginBottom: 10
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },

  value: {
    color: '#333'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 0.5,
    borderColor: '#e6e6e6',
    paddingTop: 10
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f3f6fb'
  },

  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#333',
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end'
  },

  modalContent: {
    backgroundColor: '#fff',
    height: '75%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 15
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#005696'
  },

  followCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10
  },

  followHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },

  followNo: {
    fontWeight: 'bold',
    color: '#005696'
  },

  followDate: {
    color: '#777',
    fontSize: 12
  },

  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3
  },

  followText: {
    color: '#333'
  },

  remarks: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#444'
  },

  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  emptyText: {
    marginTop: 10,
    color: '#777'
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  modalContainer1: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center'
  },

  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12
  },

  modalTitle1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#005696'
  },

  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15
  },

  cancelBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6
  },

  saveBtn: {
    padding: 10,
    backgroundColor: '#005696',
    borderRadius: 6
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#f7dada",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 45,
    marginBottom: 5,
    marginTop: 10,
  },

  uploadBox: {
    marginTop: 10
  },

  uploadTitle: {
    fontWeight: '600',
    marginBottom: 6
  },

  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f7f9fc'
  },

  uploadText: {
    marginLeft: 8,
    color: '#555'
  },

  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 6,
    padding: 8,
    marginTop: 6
  },

  fileName: {
    flex: 1,
    marginLeft: 8,
    color: '#333'
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  visitLocationBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F8FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7DFFF',
  },

  visitLocationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005696',
    marginBottom: 8,
  },

  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationLoadingText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 13,
  },

  locationText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '600',
  },

  placeText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
    lineHeight: 18,
  },

  locationErrorText: {
    fontSize: 13,
    color: '#e74c3c',
    marginBottom: 8,
  },

  refreshLocationBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#005696',
    borderRadius: 8,
    alignItems: 'center',
  },

  refreshLocationText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'left',
    gap: 10,
  },
});