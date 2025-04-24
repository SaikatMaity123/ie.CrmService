import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import SmsRetriever from 'react-native-sms-retriever';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo

const UserInfoScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({
    name: 'Not Available',
    email: 'Not Available',
    phone: 'Not Available',
    buildNumber: 'Not Available',
  });

  const [device, setDevice] = useState(''); // To store device name
  const [connectionType, setConnectionType] = useState(''); // For connection type (WiFi, cellular)
  const [connectionSpeed, setConnectionSpeed] = useState('Checking...'); // For connection speed

  useEffect(() => {
    const initializeData = async () => {
      await getUserData(); // Fetch user data from AsyncStorage
      fetchDeviceName(); // Fetch device name
      if (Platform.OS === 'android') {
        await requestPhonePermission(); // Request permission for phone number on Android
        await getPhoneNumber(); // Fetch phone number for Android
        await getBuildNumber(); // Fetch Build number for Android
      }
      await getNetworkInfo(); // Fetch initial network information
    };
    initializeData();

    // Set up listener to monitor changes in network state
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectionType(state.type); // Update connection type
      if (state.isConnected) {
        getConnectionSpeed(); // Update speed only if connected
      } else {
        setConnectionSpeed("No internet connection"); // Set speed to no connection if offline
      }
    });

    // Start measuring speed every 2 seconds
    const id = setInterval(() => {
      getConnectionSpeed();
    }, 2000);

    // Clean up the listener and interval when the component is unmounted
    return () => {
      clearInterval(id);
      unsubscribe();
    };
  }, []);

  // Get the phone number
  const getPhoneNumber = async () => {
    try {
      const phoneNumber = await SmsRetriever.requestPhoneNumber();
      if (phoneNumber) {
        setUserInfo(prevState => ({ ...prevState, phone: phoneNumber }));
      } else {
        console.log('Phone number not available');
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };

  // Fetch device name
  const fetchDeviceName = async () => {
    try {
      const deviceName = await DeviceInfo.getDeviceName();
      setDevice(deviceName);
      console.log('Device Name:', deviceName);
    } catch (error) {
      console.error('Error fetching device name:', error);
    }
  };

  // Retrieve user data from AsyncStorage
  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('UserData');
      if (jsonValue !== null) {
        const userData = JSON.parse(jsonValue);
        setUserInfo({
          name: userData.Empname || 'Not Available',
          email: userData.Empemail || 'Not Available',
          phone: userData.phone || 'Not Available',
          buildNumber: userData.BuildNumber || 'Not Available',
        });
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  // Request permission for phone number (Android only)
  const requestPhonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
          {
            title: 'Phone Permission',
            message: 'We need access to your phone number to show it.',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Phone permission granted');
        } else {
          console.log('Phone permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Fetch Build number
  const getBuildNumber = async () => {
    try {
      const buildNumber = await DeviceInfo.getBuildNumber();
      setUserInfo(prevState => ({ ...prevState, buildNumber }));
    } catch (error) {
      console.error('Error fetching Build number:', error);
    }
  };

  // Fetch network type and check connection status
  const getNetworkInfo = async () => {
    try {
      const state = await NetInfo.fetch();
      setConnectionType(state.type); // Get connection type (WiFi, cellular, etc.)

      // Check if there's an actual internet connection by trying to fetch data
      const isConnected = await fetch('https://www.google.com', { method: 'HEAD' })
        .then(() => true)
        .catch(() => false);

      // if (state.isConnected && isConnected) {
      //   setConnectionSpeed("Good connection");
      // } else {
      //   setConnectionSpeed("No internet connection");
      // }
    } catch (error) {
      console.error('Error fetching network information:', error);
    }
  };

  // Measure the connection speed by downloading a large file
  const getConnectionSpeed = async () => {
    const startTime = Date.now();
    const url = 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png'; // Example small image
  
    try {
      // First, check if the user is connected to the internet
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        setConnectionSpeed('No internet connection');
        return;
      }
  
      // Proceed to measure speed if connected
      const response = await fetch(url); // Attempt to fetch the image
      const data = await response.blob(); // Get data as a blob
  
      const duration = (Date.now() - startTime) / 1000; // Time in seconds
      const fileSizeInBytes = data.size; // Get the file size in bytes
      const speedInKbps = (fileSizeInBytes / duration) / 1024; // Calculate speed in KB/s
  
      setConnectionSpeed(`${speedInKbps.toFixed(2)} KB/s`); // Display the speed in the UI
    } catch (error) {
      console.error('Error fetching connection speed:', error); // Log the error for debugging
      setConnectionSpeed('Unable to measure speed'); // Set speed to unable to measure in case of failure
    }
  };
  
  let deviceId = DeviceInfo.getDeviceId();
  let brand = DeviceInfo.getBrand();

  // Handle navigation back to AppNavScreen
  const handleBack = () => {
    navigation.goBack(); // Go back to the previous screen in the stack
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Information</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Name: {userInfo.name}</Text>
        <Text style={styles.infoText}>Email: {userInfo.email}</Text>
        <Text style={styles.infoText}>Phone: {userInfo.phone}</Text>
        {device && <Text style={styles.infoText}>Device: {brand} {device} </Text>}
        {userInfo.buildNumber !== 'Not Available' && (
          <Text style={styles.infoText}>Build Number: {userInfo.buildNumber}</Text>
        )}
        <Text style={styles.infoText}>DeviceId: {deviceId}</Text>
        <Text style={styles.infoText}>Connection Type: {connectionType}</Text>
        <Text style={styles.infoText}>Connection Speed: {connectionSpeed}</Text>
      </View>

      <Button title="Go Back" onPress={handleBack} />
    </View>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 18,
    marginVertical: 5,
  },
});
