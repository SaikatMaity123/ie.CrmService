import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  BackHandler,
  Modal,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import React, {useEffect, useState} from 'react';

import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';

import {useFocusEffect} from '@react-navigation/native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';

import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Geocoder from 'react-native-geocoding';
import {GOOGLE_MAPS_API_KEY, BASE_URL} from '@env';
import DeviceInfo from 'react-native-device-info';

Geocoder.init(GOOGLE_MAPS_API_KEY);

const data = [
  {label: 'Item 1', value: 'Attendance'},
  {label: 'Item 2', value: 'Client Visit Report'},
  {label: 'Item 3', value: 'Master'},
  {label: 'Item 4', value: 'Lead Sourcing'},
  {label: 'Item 5', value: 'Reports'},
];

const DashBoard = ({navigation}) => {
  const [visible, setVisible] = useState(false);

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const [empName, setEmpName] = useState('');
  const [empNo, setEmpNo] = useState('');

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [device, setDevice] = useState('');

  /* ---------------- USER DATA + TIME ---------------- */
  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);
    AsyncStorage.getItem('UserData').then(value => {
      if (value) {
        const user = JSON.parse(value);
        setEmpName(user.UserName);
        setEmpNo(user.IDUser);
      }
    });

    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    );

    const validateDay = async () => {
      const dayInfoStr = await AsyncStorage.getItem('DAY_INFO');
      if (!dayInfoStr) return;

      const dayInfo = JSON.parse(dayInfoStr);
      const today = new Date().toISOString().split('T')[0];

      if (dayInfo.StartDateOnly !== today) {
        // New day → reset
        await AsyncStorage.multiRemove(['DAY_STARTED', 'DAY_INFO']);
        console.log('Previous day cleared');
      }
    };

    validateDay();

    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ---------------- GPS ENABLE CHECK ---------------- */
  const ensureGpsEnabled = async () => {
    if (Platform.OS === 'android') {
      const enabled = await isLocationEnabled();
      if (!enabled) {
        Alert.alert('GPS Not Active');
        await promptForEnableLocationIfNeeded();
      }
    }
  };

  /* ---------------- CACHED LOCATION (FAST) ---------------- */
  const getLastKnownLocation = () => {
    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        console.log('📍 CACHED LOCATION:', latitude, longitude);
        //Alert.alert('Cached Location', `Lat: ${latitude}\nLon: ${longitude}`);
        setLocation({latitude, longitude});
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        try {
          const geo = await Geocoder.from(latitude, longitude);
          if (geo.results?.length) {
            setPlaceName(geo.results[0].formatted_address);
          }
        } catch {}
      },
      () => {},
      {
        enableHighAccuracy: false,
        maximumAge: 300000, // 5 min cache
        timeout: 3000,
      },
    );
  };

  /* ---------------- LIVE GPS WATCH ---------------- */
  useEffect(() => {
    if (!visible) return;

    let watchId = null;

    const startGps = async () => {
      await ensureGpsEnabled();

      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }

      // 1️⃣ show cached immediately
      getLastKnownLocation();

      // 2️⃣ start live tracking
      watchId = Geolocation.watchPosition(
        async position => {
          const {latitude, longitude, accuracy} = position.coords;

          console.log('LIVE GPS:', latitude, longitude, 'Accuracy:', accuracy);
          //Alert.alert('GPS Update', `Lat: ${latitude}\nLon: ${longitude}`);
          setLocation({latitude, longitude});
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });

          try {
            const geo = await Geocoder.from(latitude, longitude);
            if (geo.results?.length) {
              setPlaceName(geo.results[0].formatted_address);
            }
          } catch {}
        },
        error => console.log('GPS ERROR:', error),
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          interval: 5000,
          fastestInterval: 3000,
          maximumAge: 0,
        },
      );
    };

    startGps();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [visible]);

  /* ---------------- BACK HANDLER ---------------- */
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Exit app?', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'YES', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => backHandler.remove();
    }, []),
  );

  const submit = async item => {
    if (item.value === 'Attendance') {
      // if (dayStarted === 'true') {
      //   navigation.navigate('Attendance');
      // } else {
      //   setVisible(true); // open Start Day modal
      // }
      try {
        const value = await AsyncStorage.getItem('DAY_INFO');
        if (value === null) {
          // ❌ Not stored
          setVisible(true);
        } else {
          // ✅ Exists
          const dayInfo = JSON.parse(value);
          console.log('DAY_INFO exists:', dayInfo);
          navigation.navigate('Attendance');
        }
      } catch (error) {
        console.error('Error reading DAY_INFO:', error);
      }
    } else if (item.value === 'Client Visit Report') {
      navigation.navigate('Client Visit List');
    } else if (item.value === 'Master') {
      navigation.navigate('AppNavMaster');
    } else if (item.value === 'Lead Sourcing') {
      navigation.navigate('AppNavLead');
    } else if (item.value === 'Reports') {
      const url = 'https://iecrmservice.iecsl.in/Login';
      console.log(url);

      Linking.openURL(url).catch(err =>
        console.error('An error occurred', err),
      );
    } else {
      Alert.alert('Work In Progress');
    }
  };

  const startDay = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('UserData');

      if (!userDataStr) {
        Alert.alert('User data not found. Please login again.');
        return;
      }

      const user = JSON.parse(userDataStr);

      if (!location.latitude || !location.longitude) {
        Alert.alert('Location not available. Please wait for GPS.');
        return;
      }
      HexKey = user.CompanyHexKey;
      console.log('Using Company HexKey:', HexKey);
      const payload = {
        IDUser: user.IDUser,
        StartLat: Number(location.latitude),
        StartLong: Number(location.longitude),
        StartLocation: placeName || '',
        DeviceID: device || '',
      };

      console.log('START DAY PAYLOAD:', payload);

      const response = await fetch(
        `${BASE_URL}Attendance/Day/Start?HexKey=${HexKey}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      console.log('START DAY RESPONSE:', result);
      if (result?.Status === 'SUCCESS') {
        const {IDDay, StartDate} = result.Data;

        // derive YYYY-MM-DD from StartDate
        const todayKey = new Date().toISOString().split('T')[0];

        const dayInfo = {
          IDDay,
          StartDate,
          StartDateOnly: todayKey,
        };

        await AsyncStorage.multiSet([
          ['DAY_STARTED', 'true'],
          ['DAY_INFO', JSON.stringify(dayInfo)],
        ]);

        console.log('DAY INFO STORED:', dayInfo);

        Alert.alert('Success', result?.Message);
        setVisible(false);
        navigation.navigate('Attendance');
        //} else if (result?.Status === 'FAILED' && result.Data?.IDDay !== 0) {
      } else if (result.Data?.DayEnd === false) {
        //else if (result.Data?.IDDay !== '0') {
        const {IDDay, StartDate} = result.Data;

        // derive YYYY-MM-DD from StartDate
        const todayKey = new Date().toISOString().split('T')[0];

        const dayInfo = {
          IDDay,
          StartDate,
          StartDateOnly: todayKey,
        };

        await AsyncStorage.multiSet([
          ['DAY_STARTED', 'true'],
          ['DAY_INFO', JSON.stringify(dayInfo)],
        ]);
        //await AsyncStorage.setItem('IDDay', String(result.Data?.IDDay));
        console.log('DAY INFO STORED:', dayInfo);

        Alert.alert('Success', result?.Message);
        setVisible(false);

        //navigation.navigate('Attendance');
      } else {
        Alert.alert('Failed', 'Unable to start day');
      }
    } catch (error) {
      console.log('START DAY ERROR:', error);
      Alert.alert('Error', 'Something went wrong while starting day');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg height={200} width={200} />

          <FlatList
            data={data}
            numColumns={2}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => submit(item)}>
                <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                  <HomeImg height={40} width={40} style={styles.imageDesign} />
                  <Text style={styles.menuItem}>{item.value}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ImageBackground>

      {/* ---------------- MODAL ---------------- */}
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <MapView style={styles.map} region={mapRegion}>
            <Marker coordinate={location} />
          </MapView>

          <View style={styles.infoCard}>
            <View style={styles.headerRow}>
              <View style={styles.iconTextRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={22}
                  color="#005696"
                />
                <Text style={styles.empName}> {empName}</Text>
              </View>

              <View style={styles.iconTextRow}>
                <Ionicons name="card-outline" size={18} color="#6B7280" />
                <Text style={styles.empCode}> Code: {empNo}</Text>
              </View>
            </View>

            <View style={styles.iconTextRowTop}>
              <Ionicons name="location-outline" size={18} />
              <Text style={styles.latLongText}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            </View>

            {placeName !== '' && (
              <View style={styles.iconTextRowTop}>
                <Ionicons name="business-outline" size={18} />
                <Text style={styles.placeText}>{placeName}</Text>
              </View>
            )}

            <View style={styles.iconTextRow}>
              <Ionicons name="calendar-outline" size={18} />
              <Text style={styles.dateText}> {currentDate}</Text>
            </View>

            <View style={styles.iconTextRow}>
              <Ionicons name="time-outline" size={18} />
              <Text style={styles.timeText}> {currentTime}</Text>
            </View>
          </View>

          {/* <TouchableOpacity style={styles.startBtn} onPress={startDay}>
            <Text style={styles.startText}>Start Day</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity> */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              padding: 10,
              borderTopWidth: 1,
              borderColor: '#ccc',
              backgroundColor: '#fff',
              position: 'absolute',
              bottom: 0,
              width: '100%',
            }}>
            <TouchableOpacity
              style={{
                flex: 1,
                marginRight: 5,
                backgroundColor: 'green',
                padding: 12,
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={startDay}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Start Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                marginLeft: 5,
                backgroundColor: '#FF0000',
                padding: 12,
                borderRadius: 5,
                alignItems: 'center',
              }}
              onPress={() => setVisible(false)}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DashBoard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  menuItem: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  imageDesign: {
    width: 40,
    height: 40,
    marginTop: 15,
    marginBottom: 5,
    padding: 5,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center', //Centered vertically
    alignSelf: 'center', // Centered horizontally
  },
  card: {
    height: 150,
    width: Dimensions.get('window').width,
    padding: 5,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
  },

  gridView: {
    marginTop: 10,
    flex: 1,
    color: '',
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
  openBtn: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
  },

  btnText: {color: 'white', fontWeight: 'bold'},

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    alignItems: 'center',
  },

  map: {
    width: '100%',
    height: '55%',
  },

  latLongText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },

  startBtn: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 15,
    width: '90%',
    borderRadius: 10,
    alignItems: 'center',
  },

  startText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  closeBtn: {
    marginTop: 15,
  },

  closeText: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
  },
  infoCard: {
    width: '92%',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,

    // 3D / Elevation
    elevation: 8, // Android
    shadowColor: '#000', // iOS
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  empName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2540',
  },

  empCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  iconTextRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔑 KEY FIX
    marginTop: 6,
  },

  latLongText: {
    marginLeft: 6, // spacing from icon
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1, // allows wrapping
    lineHeight: 18,
  },

  dateTimeRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005696',
  },
  placeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
});
