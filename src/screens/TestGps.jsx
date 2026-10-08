import {Platform} from 'react-native';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import React, {useEffect} from 'react';

const TestGps = () => {
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED:
        console.log('✅ Permission granted');
        return true;
      case RESULTS.DENIED:
        console.log('❌ Permission denied');
        return false;
      case RESULTS.BLOCKED:
        console.log('🚫 Permission blocked. Ask user to enable in settings');
        return false;
      default:
        return false;
    }
  };
};

export default TestGps;
