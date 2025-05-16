import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

const UserInfoScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    name: 'Not Available',
    email: 'Not Available',
    phone: 'Not Available',
    buildNumber: 'Not Available',
  });

  const [device, setDevice] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [connectionSpeed, setConnectionSpeed] = useState('Checking...');
  const deviceId = DeviceInfo.getDeviceId();
  const brand = DeviceInfo.getBrand();

  useEffect(() => {
    const initializeData = async () => {
      try {
        await getUserData();
        await fetchDeviceName();
        await getBuildNumber();
        await getNetworkInfo();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeData();

    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type);
      if (state.isConnected) {
        getConnectionSpeed();
      } else {
        setConnectionSpeed('No internet connection');
      }
    });

    const intervalId = setInterval(() => {
      getConnectionSpeed();
    }, 2000);

    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  }, []);

  const fetchDeviceName = async () => {
    try {
      const deviceName = await DeviceInfo.getDeviceName();
      setDevice(deviceName);
    } catch (error) {
      console.error('Error fetching device name:', error);
    }
  };

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserData');
      if (jsonValue !== null) {
        const userData = JSON.parse(jsonValue);
        setUserInfo({
          name: userData.Empname || 'Not Available',
          email: userData.Empemail || 'Not Available',
          phone: userData.phone || 'Not Available', // fallback only
          buildNumber: userData.BuildNumber || 'Not Available',
        });
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  const getBuildNumber = async () => {
    try {
      const buildNumber = await DeviceInfo.getBuildNumber();
      setUserInfo(prev => ({ ...prev, buildNumber }));
    } catch (error) {
      console.error('Error fetching Build number:', error);
    }
  };

  const getNetworkInfo = async () => {
    try {
      const state = await NetInfo.fetch();
      setConnectionType(state.type);
    } catch (error) {
      console.error('Error fetching network information:', error);
    }
  };

  const getConnectionSpeed = async () => {
    const startTime = Date.now();
    const url = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';

    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        setConnectionSpeed('No internet connection');
        return;
      }

      const response = await fetch(url);
      const data = await response.blob();

      const duration = (Date.now() - startTime) / 1000;
      const fileSizeInBytes = data.size;
      const speedInKbps = (fileSizeInBytes / duration) / 1024;

      setConnectionSpeed(`${speedInKbps.toFixed(2)} KB/s`);
    } catch (error) {
      console.error('Speed test error:', error.message);
      setConnectionSpeed('Unable to measure speed');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 User Profile</Text>
  
      {/* ✅ Card View Starts */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>👤 Name:</Text>
          <Text style={styles.value}>{userInfo.name}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>📧 Email:</Text>
          <Text style={styles.value}>{userInfo.email}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>📱 Device:</Text>
          <Text style={styles.value}>{brand} {device}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>🏗️ Build No :</Text>
          <Text style={styles.value}>{userInfo.buildNumber}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>🔑 Device ID:</Text>
          <Text style={styles.value}>{deviceId}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>🌐 Network:</Text>
          <Text style={styles.value}>{connectionType}</Text>
        </View>
  
        <View style={styles.infoRow}>
          <Text style={styles.label}>⚡ Speed:</Text>
          <Text style={styles.value}>{connectionSpeed}</Text>
        </View>
      </View>
      {/* ✅ Card View Ends */}
  
      <Button title="⬅ Go Back" color="#33767C" onPress={handleBack} />
    </View>
  );
  
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#EAF1F1',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#33767C',
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 5, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#555',
    width: 130,
  },
  value: {
    fontSize: 16,
    color: '#111',
    flex: 1,
    flexWrap: 'wrap',
  },
});


