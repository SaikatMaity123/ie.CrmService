import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL, url } from '@env';
import Ionicons from "react-native-vector-icons/Ionicons";

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
          // phone: userData.phone || 'Not Available', // fallback only
          // buildNumber: userData.BuildNumber || 'Not Available',
          avatar: userData.ProfilePicPath || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          // role: userData.Designation || 'Employee',
          company: userData.BusinessID || 'Your Company',
          hq: userData.HQ || 'Not Available',
          division: userData.Division || 'Not Available',
          designation: userData.Designation || 'Not Available',
          manager: userData.Manager || 'Not Available',
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

  const handleEditProfilePic = () => {
    Alert.alert('Edit Profile', 'This feature is coming soon!');
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {/* <Text style={styles.title}>📱 User Profile</Text> */}

      {/* ✅ Card View Starts */}
      {/* <View style={styles.card}>
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
      </View> */}
      {/* ✅ Card View Ends */}
      <View style={styles.card}>
        {/* ✅ Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: `${url}/${userInfo.avatar}` }}
              style={styles.avatar}
            />
            {/* ✏️ Edit Icon Overlay */}
            <TouchableOpacity style={styles.editIconBtn} onPress={handleEditProfilePic}>
              <Ionicons name="create-outline" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcome}>Welcome {userInfo.name}</Text>
          <Text style={styles.company}>{userInfo.company}</Text>
        </View>


        <Text style={styles.title}>Profile Detail's</Text>
        {/* ✅ Card View Starts */}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email :</Text>
          <Text style={styles.value}>{userInfo.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Manager :</Text>
          <Text style={styles.value}>{userInfo.manager}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Division :</Text>
          <Text style={styles.value}>{userInfo.division}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Designation :</Text>
          <Text style={styles.value}>{userInfo.designation}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>HQ :</Text>
          <Text style={styles.value}>{userInfo.hq}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Network:</Text>
          <Text style={styles.value}>{connectionType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Speed :</Text>
          <Text style={styles.value}>{connectionSpeed}</Text>
        </View>
      </View>
      {/* ✅ Card View Ends */}

      {/* ✅ Footer Buttons Row */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#005696" style={{ marginRight: 6 }} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfilePic}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
 avatarContainer: {
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
},

avatar: {
  width: 150,
  height: 150,
  borderRadius: 75,
  borderWidth: 1,
  borderColor: "#007AFF",
  backgroundColor: "#e0e0e0",
  marginTop: -75,
},

editIconBtn: {
  position: "absolute",
  bottom: 0,          // 👈 stick to bottom
  right: 0,           // 👈 stick to right
  backgroundColor: "#007AFF",
  borderRadius: 15,
  padding: 6,
  borderWidth: 2,
  borderColor: "#fff", // nice white border like your screenshot
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.5,
},


  welcome: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
    color: "#333333",
  },
  company: {
    fontSize: 14,
    color: "#666666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 45,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 15,
  },
  label: {
    fontWeight: "600",
    width: 110,
    color: "#333333",
    marginLeft: 6,
  },
  title: {
    fontWeight: "600",
    color: "#333333",
    marginLeft: 6,
    fontSize: 18,
    marginBottom: 10,
  },
  value: {
    flex: 1,
    color: "#444444",
    justifyContent: "flex-end",
    textAlign: "right",
    marginRight: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },

  backButton: {
    flexDirection: "row",   // 👈 icon + text in a row
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  backButtonText: {
    color: "#005696",
    fontWeight: "600",
    fontSize: 14,
  },

  editButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

});


