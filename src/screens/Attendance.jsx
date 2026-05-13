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
  {label: 'Item 1', value: 'End Day'},
  {label: 'Item 2', value: 'Client Visit'},
];
const Attendance = ({navigation}) => {
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
    console.log('dayInfoStr', AsyncStorage.getItem('DAY_INFO'));

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
    //handleCheckPressed();
  }, [visible]);

  // useEffect(() => {
  //   Geolocation.getCurrentPosition(
  //     pos => {
  //       setLocation({
  //         latitude: pos.coords.latitude,
  //         longitude: pos.coords.longitude,
  //       });
  //     },
  //     err => console.log(err),
  //     {enableHighAccuracy: true},
  //   );
  //   handleCheckPressed();
  // }, []);
  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        //BackHandler.exitApp();
        handleEnabledPressed();
      } else if (checkEnabled === true) {
        //Alert.alert('GPS Active');
      }
    }
  };

  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  };

  const submit = modulename => {
    if (modulename.value === 'End Day') {
      //navigation.navigate('Attendance');
      setVisible(true);
    } else if (modulename.value === 'Client Visit') {
      navigation.navigate('Client Visits');
      // Alert.alert('Work In Progress');
    }
  };
  const endDay = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('UserData');
      const dayInfoStr = await AsyncStorage.getItem('DAY_INFO');

      if (!userDataStr || !dayInfoStr) {
        Alert.alert('Session error', 'Day information not found.');
        return;
      }

      const user = JSON.parse(userDataStr);
      const dayInfo = JSON.parse(dayInfoStr);

      if (!dayInfo.IDDay) {
        Alert.alert('Invalid state', 'Day ID missing. Please contact admin.');
        return;
      }

      if (!location.latitude || !location.longitude) {
        Alert.alert('Location not available. Please wait for GPS.');
        return;
      }

      const HexKey = user.CompanyHexKey;

      const payload = {
        IDDAY: dayInfo.IDDay, // 🔑 USE STORED IDDAY
        IDUser: user.IDUser,
        EndLat: Number(location.latitude),
        EndLong: Number(location.longitude),
        EndLocation: placeName || '',
        DeviceID: device || '',
      };

      console.log('END DAY PAYLOAD:', payload);

      const response = await fetch(
        `${BASE_URL}Attendance/Day/End?HexKey=${HexKey}`,
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
      console.log('END DAY RESPONSE:', result);

      if (result?.Status === 'SUCCESS') {
        Alert.alert('Success', 'Day ended successfully');

        // 🔥 CLEAR LOCAL DAY STATE
        await AsyncStorage.multiRemove(['DAY_STARTED', 'DAY_INFO']);

        setVisible(false);
        navigation.navigate('AppNavDash');
      } else {
        Alert.alert('Failed', result?.Message || 'Unable to end day');
      }
    } catch (error) {
      console.log('END DAY ERROR:', error);
      Alert.alert('Error', 'Something went wrong while ending day');
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
            showsVerticalScrollIndicator={false}
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
      {/* MODAL */}
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

          {/* <TouchableOpacity style={styles.startBtn} onPress={endDay}>
            <Text style={styles.startText}>End Day</Text>
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
              onPress={endDay}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>End Day</Text>
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

export default Attendance;
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
