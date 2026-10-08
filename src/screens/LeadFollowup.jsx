import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ImageBackground,
  Linking,
  ScrollView,
  TextInput as RNTextInput,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import axios from 'axios';
import { BASE_URL, GOOGLE_MAPS_API_KEY } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dropdown } from 'react-native-element-dropdown';
import DocumentPicker from 'react-native-document-picker';
import NetInfo from '@react-native-community/netinfo';
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

Geocoder.init(GOOGLE_MAPS_API_KEY);

/* =========================================================
   CUSTOM GLASS LOADER COMPONENT
========================================================= */
const CustomGlassLoader = ({ visible, message = 'Loading...' }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={loaderStyles.overlay} pointerEvents="auto">
      <View style={loaderStyles.card}>
        <Animated.View style={[loaderStyles.ring, { transform: [{ rotate: spin }] }]} />
        <Animated.Text style={[loaderStyles.text, { opacity: pulseAnim }]}>
          {message}
        </Animated.Text>
      </View>
    </View>
  );
};

const LeadFollowup = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Loading...');
  const [refreshing, setRefreshing] = useState(false);
  const [hexKey, setHexKey] = useState('');
  const [businessID, setBusinessID] = useState('');
  const [idUser, setIdUser] = useState('');
  const [userType, setUserType] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(
    moment().subtract(6, 'months').format('DD-MM-YYYY')
  );
  const [endDate, setEndDate] = useState(moment().format('DD-MM-YYYY'));
  const [useUName, setuserName] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [dateType, setDateType] = useState('');
  const [followups, setFollowups] = useState([]);
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUser();
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleMakeCall = (phone) => {
    if (!phone) {
      Alert.alert('Unavailable', 'No phone number provided.');
      return;
    }
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Phone call facility is not supported on this device.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.log('Call Error:', err));
  };

  const handleSendEmail = (email) => {
    if (!email) {
      Alert.alert('Unavailable', 'No email address provided.');
      return;
    }
    const url = `mailto:${email}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Error', 'Email app is not available on this device.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.log('Email Error:', err));
  };

  const checkInternet = async () => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        'Offline',
        'You are currently offline. Please check your internet connection.'
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
      setLoaderMessage('Fetching lead follow-ups...');
      setLoading(true);

      const url = `${BASE_URL}LeadFollowUp/List?HexKey=${hex}&IDUser=${uid}&UserType=${type}&BusinessID=${business}&SDate=${sDate}&EDate=${eDate}`;

      const response = await axios.get(url);

      const list = response.data.data || [];
      setData(list);
      setFilteredData(list);
    } catch (error) {
      console.log('API Error', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFollowups = async (leadNo) => {
    const online = await checkInternet();

    if (!online) return;

    try {
      setLoaderMessage('Loading pre-calls details...');
      setLoading(true);

      const url = `${BASE_URL}LeadFollowUp/Detail?HexKey=${hexKey}&LeadNo=${leadNo}`;

      const res = await axios.get(url);
      const list = res?.data?.data || [];

      setFollowups(list);

      // Important for iOS: close the loading overlay first,
      // then present the native Pre-Calls modal on the next frame.
      setLoading(false);

      requestAnimationFrame(() => {
        setShowFollowModal(true);
      });
    } catch (e) {
      console.log('FollowUp API Error', e);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);

    if (text === '') {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (item) =>
        item.LeadNo?.toLowerCase().includes(text.toLowerCase()) ||
        item.Account?.toLowerCase().includes(text.toLowerCase()) ||
        item.Phone?.toLowerCase().includes(text.toLowerCase()) ||
        item.Email?.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads(hexKey, idUser, userType, businessID, startDate, endDate);
  };

  const RatingStars = ({ rating }) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color="#FFB800"
          style={{ marginRight: 2 }}
        />
      );
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {stars}
        <Text style={{ marginLeft: 4, color: '#6B7280', fontSize: 12 }}>
          ({rating}/5)
        </Text>
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
    const formatted = moment(date).format('DD/MMM/YYYY').toUpperCase();

    if (dateType === 'start') {
      setStartDate(formatted);
    } else if (dateType === 'end') {
      setEndDate(formatted);
    } else if (dateType === 'next') {
      setNextDate(formatted);
    }

    setDatePickerVisible(false);
  };

  const applyFilter = () => {
    fetchLeads(hexKey, idUser, userType, businessID, startDate, endDate);
    setShowFilter(false);
  };

  const handleAddFollowup = async (lead) => {
    setLoaderMessage('Preparing follow-up form...');
    setLoading(true);
    try {
      setSelectedLeadId(lead.IDLead);

      await loadAutoCode();
      await loadCommunication();

      setAddModalVisible(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAutoCode = async () => {
    const url = `${BASE_URL}LeadFollowUp/AutoCode?HexKey=${hexKey}&Type=LEADFOLLOWUP`;
    const res = await axios.get(url);
    setAutoCode(res.data.data.AutoCode);
  };

  const loadCommunication = async () => {
    try {
      const url = `${BASE_URL}Misc/MiscList?HexKey=${hexKey}&type=COMMUNICATION`;
      const res = await axios.get(url);

      const list = res.data.data.map((x) => ({
        label: x.Name,
        value: x.Code,
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

  const handleCommunicationChange = async (item) => {
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
        }
      );

      return fineGranted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.log('Permission Error:', error);
      return false;
    }
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
          'Please allow location permission for this app.'
        );
        return false;
      }

      try {
        const cachedLocation = await new Promise((resolve, reject) => {
          Geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 600000,
          });
        });

        const { latitude, longitude } = cachedLocation.coords;
        const place = await getPlaceNameFromLatLong(latitude, longitude);

        setVisitLat(latitude);
        setVisitLong(longitude);
        setVisitPlaceName(place);

        setVisitLocationLoading(false);
        return true;
      } catch (cachedError) {
        console.log('Fast Location Failed:', cachedError);
      }

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
        }, 45000);

        watchId = Geolocation.watchPosition(
          async (position) => {
            if (completed) return;

            const { latitude, longitude, accuracy } = position.coords;

            if (latitude && longitude) {
              completed = true;

              clearTimeout(timeoutId);

              if (watchId !== null) {
                Geolocation.clearWatch(watchId);
              }

              resolve(position);
            }
          },
          (error) => {
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
          }
        );
      });

      const { latitude, longitude } = liveLocationResult.coords;
      const place = await getPlaceNameFromLatLong(latitude, longitude);

      setVisitLat(latitude);
      setVisitLong(longitude);
      setVisitPlaceName(place);

      setVisitLocationLoading(false);
      return true;
    } catch (error) {
      console.log('Visit Location Error:', error);
      setVisitLocationLoading(false);

      if (error.code === 3) {
        Alert.alert(
          'Location Timeout',
          'Location is not available. Please check GPS, internet, and try again in an open area.'
        );
      } else if (error.code === 1) {
        Alert.alert(
          'Permission Denied',
          'Please allow location permission from app settings.'
        );
      } else if (error.code === 2) {
        Alert.alert(
          'Location Unavailable',
          'Phone location service is unavailable right now.'
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

      if (type === 'given') {
        if (givenDocs.length >= 5) {
          Alert.alert('Limit Reached', 'Maximum 5 files allowed.');
          return;
        }

        setGivenDocs([...givenDocs, file]);
      } else {
        if (receivedDocs.length >= 5) {
          Alert.alert('Limit Reached', 'Maximum 5 files allowed.');
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
    if (type === 'given') {
      const updated = [...givenDocs];
      updated.splice(index, 1);
      setGivenDocs(updated);
    } else {
      const updated = [...receivedDocs];
      updated.splice(index, 1);
      setReceivedDocs(updated);
    }
  };

  const cleanFileName = (fileName) => {
    if (!fileName) {
      return `file_${Date.now()}`;
    }

    return fileName
      .replace(/\s+/g, '_')
      .replace(/[()]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/_+/g, '_');
  };

  const getOriginalNameWithoutExtension = (fileName) => {
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

  const getExtension = (fileName) => {
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
    if (isSaving) {
      return;
    }
    if (!nextDate || !contactPerson || !followBy || !communication || !autoCode || !remarks) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }
    if (!isConnected) {
      Alert.alert(
        'Offline',
        'You are currently offline. Please check your internet connection.'
      );
      return;
    }
    setIsSaving(true);
    try {
      const url = `${BASE_URL}LeadFollowUp/Save?HexKey=${hexKey}`;

      const param = {
        IDFollowUp: 0,
        IDLead: selectedLeadId,
        FollowupCode: autoCode,
        NextFollowupDate: nextDate,
        Points: rating ?? 0,
        ContactPerson: contactPerson,
        ComMethod: communication,
        FollowedBy: followBy,
        Commercial: false,
        Remarks: remarks,
        EntryUser: useUName,
        IDUser: idUser,
        BusinessID: businessID,
        Place: visitPlaceName ?? '',
        Latitude: visitLat ?? '',
        Longitude: visitLong ?? '',
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(param));

      receivedDocs.forEach((file) => {
        const originalName = getOriginalNameWithoutExtension(file.name);
        const extension = getExtension(file.name);

        const customFileName = extension
          ? `${selectedLeadId}_${autoCode}_${originalName}_Received.${extension}`
          : `${selectedLeadId}_${autoCode}_${originalName}_Received`;

        appendFileToFormData(formData, file, customFileName);
      });

      givenDocs.forEach((file) => {
        const originalName = getOriginalNameWithoutExtension(file.name);
        const extension = getExtension(file.name);

        const customFileName = extension
          ? `${selectedLeadId}_${autoCode}_${originalName}_Given.${extension}`
          : `${selectedLeadId}_${autoCode}_${originalName}_Given`;

        appendFileToFormData(formData, file, customFileName);
      });

      if (visitImage) {
        const imageName = visitImage.name || `visit_${Date.now()}.jpg`;
        const originalName = getOriginalNameWithoutExtension(imageName);
        const extension = getExtension(imageName) || 'jpg';

        const customFileName = `${selectedLeadId}_${autoCode}_${originalName}_Visit.${extension}`;

        appendFileToFormData(formData, visitImage, customFileName);
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.Status === 'SUCCESS') {
        Alert.alert('Success', result.Message);

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
        Alert.alert('Error', result.Message);
      }
    } catch (error) {
      console.log('Save Followup Error', error);
    } finally {
      setIsSaving(false);
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

  const renderItem = ({ item }) => {
    const getBadgeStyle = (status) => {
      switch (status?.toLowerCase()) {
        case 'upcoming':
          return { bg: '#E6F4EA', text: '#137333' };
        case 'today':
          return { bg: '#FEF7E0', text: '#B06000' };
        case 'completed':
          return { bg: '#E8EAED', text: '#3C4043' };
        default:
          return { bg: '#E8F0FE', text: '#1A73E8' };
      }
    };

    const statusStyle = getBadgeStyle(item.Status || 'Upcoming');

    return (
      <View style={styles.glassCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeftRow}>
            <View style={styles.avatarIconBox}>
              <Ionicons name="business" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.leadNo}>{item.LeadNo}</Text>
              <Text style={styles.account}>{item.Account}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.date}>{item.LeadDate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                {item.Status || 'Upcoming'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.interactiveInfoContainer}>
          <TouchableOpacity
            style={styles.interactiveRow}
            onPress={() => handleMakeCall(item.Phone)}
            activeOpacity={0.7}
          >
            <Ionicons name="call-outline" size={16} color="#3B82F6" />
            <Text style={styles.interactiveValue}> {item.Phone || 'N/A'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactiveRow}
            onPress={() => handleSendEmail(item.Email)}
            activeOpacity={0.7}
          >
            <Ionicons name="mail-outline" size={16} color="#3B82F6" />
            <Text style={styles.interactiveValue}> {item.Email || 'N/A'}</Text>
          </TouchableOpacity>

          <View style={styles.metricsRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="eye-outline" size={15} color="#6B7280" />
              <Text style={styles.metricText}> Visit: {item.Visit || 0}</Text>
            </View>
            <Text style={styles.metricDivider}>|</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.metricText}>Rating: </Text>
              <RatingStars rating={item.Rating || 0} />
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.glassActionBtn}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedLead(item);
              fetchFollowups(item.LeadNo);
            }}
          >
            <Ionicons name="list-outline" size={16} color="#3B82F6" />
            <Text style={styles.actionText}>Pre-Calls</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.glassActionBtnPrimary}
            activeOpacity={0.8}
            onPress={() => handleAddFollowup(item)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionTextPrimary}>Add Follow-up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFollowItem = ({ item }) => (
    <View style={styles.followCard}>
      <View style={styles.followHeader}>
        <Text style={styles.followNo}>{item.FollowUpNo}</Text>
        <Text style={styles.followDate}>{item.FollowUpDate}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="person-outline" size={16} color="#3B82F6" />
        <Text style={styles.followText}> {item.ContactPerson}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="chatbox-ellipses-outline" size={16} color="#3B82F6" />
        <Text style={styles.followText}> {item.CommunicationMethod}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
        <Text style={styles.followText}> Next: {item.NextFollowDate}</Text>
      </View>

      <View style={styles.followRow}>
        <Ionicons name="person-outline" size={16} color="#3B82F6" />
        <Text style={styles.followText}> Followed By: {item.FollowedBy}</Text>
      </View>

      <Text style={styles.remarks}>Remarks: {item.Remarks}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../images/bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />

      <View style={styles.container}>
        {/* CUSTOM HEADER WITH SAFE AREA NOTCH PADDING */}
        <View
          style={[
            styles.customHeader,
            { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight : 12) }
          ]}
        >
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AppNavDash')}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>Lead Followup</Text>

          <View style={styles.rightHeaderSpace} />
        </View>

        {/* Search Header */}
        <View style={styles.searchGlassBox}>
          <Ionicons name="search-outline" size={18} color="#718096" />
          <RNTextInput
            placeholder="Search lead..."
            placeholderTextColor="#A0AEC0"
            value={searchText}
            onChangeText={handleSearch}
            style={styles.glassSearchInput}
          />
          <TouchableOpacity onPress={() => setShowFilter(!showFilter)}>
            <Ionicons name="filter-outline" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        {showFilter && (
          <View style={styles.glassFilterBox}>
            <TouchableOpacity onPress={() => showDatePicker('start')}>
              <View style={styles.filterInputStyle}>
                <Text style={styles.filterInputText}>{startDate}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => showDatePicker('end')}>
              <View style={styles.filterInputStyle}>
                <Text style={styles.filterInputText}>{endDate}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchBtn} onPress={applyFilter}>
              <Ionicons name="search-outline" size={18} color="#fff" />
              <Text style={styles.searchText}> Apply Filter</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.IDLead.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* Pre-Calls Modal */}
        <Modal
          visible={showFollowModal}
          animationType="slide"
          transparent={true}
          presentationStyle="overFullScreen"
          statusBarTranslucent={true}
          onRequestClose={() => setShowFollowModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Pre-Calls {selectedLead?.LeadNo}
                </Text>

                <TouchableOpacity onPress={() => setShowFollowModal(false)}>
                  <Ionicons name="close-circle-outline" size={28} color="#3B82F6" />
                </TouchableOpacity>
              </View>

              {followups.length === 0 ? (
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

        {/* Add Followup Modal */}
        <Modal
          visible={addModalVisible}
          animationType="fade"
          transparent={true}
          statusBarTranslucent={true}
        >
          <View style={styles.glassModalOverlay}>
            <View style={styles.glassModalCard}>

              {/* Modal Header */}
              <View style={styles.glassModalHeader}>
                <View style={styles.headerTitleRow}>
                  <Text style={styles.glassModalTitle}>Add Follow-up</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    clearVisitData();
                    setAddModalVisible(false);
                  }}
                  style={styles.closeIconButton}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Form Content Wrapper */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
              >

                {/* Follow-up Code */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Follow-up Code</Text>
                  <View style={styles.glassInputBox}>
                    <View style={styles.inputBadgeIcon}>
                      <Ionicons name="document-text-outline" size={18} color="#6366F1" />
                    </View>
                    <RNTextInput
                      value={autoCode}
                      editable={false}
                      style={styles.glassTextInput}
                    />
                  </View>
                </View>

                {/* Next Follow Date */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Next Follow Date *</Text>
                  <TouchableOpacity
                    onPress={() => showDatePicker('next')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.glassInputBox}>
                      <View style={styles.inputBadgeIcon}>
                        <Ionicons name="calendar-outline" size={18} color="#6366F1" />
                      </View>
                      <Text style={[styles.glassTextInputText, !nextDate && { color: '#93C5FD' }]}>
                        {nextDate || 'Select date'}
                      </Text>
                      <Ionicons name="calendar-outline" size={18} color="#6366F1" style={{ marginLeft: 'auto' }} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Contact Person */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Contact Person *</Text>
                  <View style={styles.glassInputBox}>
                    <View style={styles.inputBadgeIcon}>
                      <Ionicons name="person-outline" size={18} color="#6366F1" />
                    </View>
                    <RNTextInput
                      placeholder="Enter contact person"
                      placeholderTextColor="#93C5FD"
                      value={contactPerson}
                      onChangeText={setContactPerson}
                      style={styles.glassTextInput}
                    />
                  </View>
                </View>

                {/* Followed By */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Followed By *</Text>
                  <View style={styles.glassInputBox}>
                    <View style={styles.inputBadgeIcon}>
                      <Ionicons name="people-outline" size={18} color="#6366F1" />
                    </View>
                    <RNTextInput
                      placeholder="Enter name"
                      placeholderTextColor="#93C5FD"
                      value={followBy}
                      onChangeText={setFollowBy}
                      style={styles.glassTextInput}
                    />
                  </View>
                </View>

                {/* Communication Method */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Communication Method *</Text>
                  <View style={styles.glassInputBox}>
                    <View style={styles.inputBadgeIcon}>
                      <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6366F1" />
                    </View>
                    <Dropdown
                      style={styles.glassDropdown}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      data={communicationList}
                      labelField="label"
                      valueField="value"
                      placeholder="Select method"
                      value={communication}
                      onChange={handleCommunicationChange}
                    />
                  </View>
                </View>

                {/* Visit Location logic */}
                {communication === 'VISIT' && (
                  <View style={styles.visitLocationBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="location" size={18} color="#3B82F6" style={{ marginRight: 6 }} />
                      <Text style={styles.visitLocationTitle}>Visit Location</Text>
                    </View>

                    {visitLocationLoading ? (
                      <View style={styles.locationLoadingRow}>
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text style={styles.locationLoadingText}>
                          Fetching live GPS location...
                        </Text>
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
                          activeOpacity={0.8}
                        >
                          <Ionicons name="refresh" size={14} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={styles.refreshLocationText}>
                            Refresh Location
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                {/* Live Visit Camera Capture */}
                {communication === 'VISIT' && (
                  <View style={styles.glassUploadCard}>
                    <Text style={styles.fieldLabelText}>Live Visit Image</Text>

                    <TouchableOpacity
                      style={styles.imageCaptureBtn}
                      onPress={captureVisitImage}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera-outline" size={20} color="#3B82F6" />
                      <Text style={styles.uploadText}>
                        {visitImage ? 'Retake Visit Image' : 'Capture Visit Image'}
                      </Text>
                    </TouchableOpacity>

                    {visitImage && (
                      <View style={{ marginTop: 10, alignItems: 'center' }}>
                        <Image
                          source={{ uri: visitImage.uri }}
                          style={{
                            width: '100%',
                            height: 140,
                            borderRadius: 14,
                            resizeMode: 'cover',
                          }}
                        />

                        <TouchableOpacity
                          onPress={() => setVisitImage(null)}
                          style={{ marginTop: 8 }}
                        >
                          <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 13 }}>
                            Remove Image
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {/* Rating Selector */}
                <View style={styles.glassRatingCard}>
                  <Text style={styles.fieldLabelText}>Rating</Text>
                  <View style={styles.starRatingRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={star <= (rating || 0) ? 'star' : 'star-outline'}
                          size={24}
                          color={star <= (rating || 0) ? '#3B82F6' : '#93C5FD'}
                          style={{ marginRight: 16 }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Remarks Input */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>Remarks *</Text>
                  <View style={[styles.glassInputBox, { alignItems: 'flex-start', paddingTop: 12, height: 80 }]}>
                    <View style={styles.inputBadgeIcon}>
                      <Ionicons name="create-outline" size={18} color="#6366F1" />
                    </View>
                    <RNTextInput
                      placeholder="Write your remarks here..."
                      placeholderTextColor="#93C5FD"
                      multiline
                      numberOfLines={3}
                      value={remarks}
                      onChangeText={setRemarks}
                      style={[styles.glassTextInput, { textAlignVertical: 'top' }]}
                    />
                  </View>
                </View>

                {/* Given Documents Dropzone */}
                <View style={styles.glassUploadCard}>
                  <Text style={styles.fieldLabelText}>Given Documents</Text>

                  <TouchableOpacity
                    style={styles.dashedDropzone}
                    onPress={() => pickDocument('given')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
                    <Text style={styles.dropzoneTitle}>Upload File</Text>
                    <Text style={styles.dropzoneSub}>PDF, JPG, PNG (Max 5MB)</Text>
                  </TouchableOpacity>

                  {givenDocs.map((file, index) => (
                    <View key={index} style={styles.fileRow}>
                      <Ionicons name="document-text" size={18} color="#3B82F6" />
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => removeFile(index, 'given')}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                {/* Received Documents Dropzone */}
                <View style={styles.glassUploadCard}>
                  <Text style={styles.fieldLabelText}>Received Documents</Text>

                  <TouchableOpacity
                    style={styles.dashedDropzone}
                    onPress={() => pickDocument('received')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cloud-upload" size={24} color="#3B82F6" />
                    <Text style={styles.dropzoneTitle}>Upload File</Text>
                    <Text style={styles.dropzoneSub}>PDF, JPG, PNG (Max 5MB)</Text>
                  </TouchableOpacity>

                  {receivedDocs.map((file, index) => (
                    <View key={index} style={styles.fileRow}>
                      <Ionicons name="document-text" size={18} color="#10B981" />
                      <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                      <TouchableOpacity onPress={() => removeFile(index, 'received')}>
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

              </ScrollView>

              {/* Bottom Modal Actions */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, isSaving && { opacity: 0.5 }]}
                  disabled={isSaving}
                  onPress={() => {
                    clearVisitData();
                    setAddModalVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveFollowupBtnWrapper, isSaving && styles.saveBtnDisabled]}
                  onPress={saveFollowup}
                  disabled={isSaving}
                  activeOpacity={0.9}
                >
                  <Svg height="48" width="100%" style={StyleSheet.absoluteFillObject}>
                    <Defs>
                      <LinearGradient id="saveBtnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#C084FC" stopOpacity="1" />
                      </LinearGradient>
                    </Defs>
                    <Rect x="0" y="0" width="100%" height="100%" rx="20" ry="20" fill="url(#saveBtnGrad)" />
                  </Svg>

                  <View style={styles.saveBtnContent}>
                    <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.saveFollowupText}>Save Follow-up</Text>
                  </View>
                </TouchableOpacity>
              </View>

            </View>

            <DateTimePickerModal
              isVisible={datePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              modalPropsIOS={{
                supportedOrientations: ['portrait', 'landscape'],
              }}
            />

          </View>
        </Modal>
      </View>

      {/* Global Custom Glass Loaders */}
      <CustomGlassLoader visible={loading} message={loaderMessage} />
      <CustomGlassLoader visible={isSaving} message="Saving follow-up..." />
    </ImageBackground>
  );
};

export default LeadFollowup;

const loaderStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    //elevation: 99999,
  },
  card: {
    width: 170,
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    //elevation: 8,
  },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(59, 130, 246, 0.15)',
    borderTopColor: '#3B82F6',
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
});

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    //elevation: 3,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  rightHeaderSpace: {
    width: 40,
  },
  searchGlassBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  glassSearchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'transparent',
    fontSize: 14,
    color: '#2D3748',
  },
  glassFilterBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 15,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  filterInputStyle: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  filterInputText: {
    fontSize: 14,
    color: '#334155',
  },
  searchBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#A3B1C6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leadNo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A202C',
  },
  account: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
    marginTop: 2,
  },
  date: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  interactiveInfoContainer: {
    marginVertical: 4,
  },
  interactiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  interactiveValue: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metricText: {
    fontSize: 12,
    color: '#718096',
  },
  metricDivider: {
    marginHorizontal: 8,
    color: '#CBD5E0',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 10,
  },
  glassActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  glassActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  actionTextPrimary: {
    marginLeft: 6,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    height: '75%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  followCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  followHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  followNo: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  followDate: {
    color: '#777',
    fontSize: 12,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  followText: {
    color: '#333',
  },
  remarks: {
    marginTop: 5,
    fontStyle: 'italic',
    color: '#444',
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#777',
  },
  glassModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(120, 140, 180, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 10 : 20,
  },
  glassModalCard: {
    width: '100%',
    height: '85%',
    maxHeight: '88%',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 32,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    flexDirection: 'column',
  },
  glassModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glassModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  closeIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 6,
    marginLeft: 2,
  },
  glassInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    height: 52,
  },
  inputBadgeIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  glassTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  glassTextInputText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  glassDropdown: {
    flex: 1,
    height: 40,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#93C5FD',
  },
  dropdownSelectedText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  glassRatingCard: {
    marginBottom: 14,
    paddingVertical: 12,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  glassUploadCard: {
    marginBottom: 14,
  },
  dashedDropzone: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#60A5FA',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 6,
  },
  dropzoneSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  imageCaptureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
  },
  uploadText: {
    marginLeft: 8,
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileName: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    color: '#334155',
    fontSize: 12,
    fontWeight: '500',
  },
  visitLocationBox: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  visitLocationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  locationLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLoadingText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  placeText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  locationErrorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  refreshLocationBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  refreshLocationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.6)',
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
  },
  cancelBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 14,
  },
  saveFollowupBtnWrapper: {
    flex: 1.6,
    height: 48,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  saveFollowupText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
});