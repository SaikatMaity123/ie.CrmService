import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  PermissionsAndroid,
  Modal,
  Image,
} from 'react-native';

import MapView, {Marker} from 'react-native-maps';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import {
  launchImageLibrary as _launchImageLibrary,
  launchCamera as _launchCamera,
} from 'react-native-image-picker';
let launchImageLibrary = _launchImageLibrary;
let launchCamera = _launchCamera;

import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GOOGLE_MAPS_API_KEY, BASE_URL} from '@env';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import DashBoard from './DashBoard';
Geocoder.init(GOOGLE_MAPS_API_KEY);

const DashBoardNew = () => {
  const [visible, setVisible] = useState(true);

  const [location, setLocation] = useState({latitude: 0, longitude: 0});
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
  });
  const [placeName, setPlaceName] = useState('');
  const [device, setDevice] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const compressImageIfNeeded = async asset => {
    let fileSize = asset.fileSize;

    // If already <= 5MB, return original
    if (fileSize <= MAX_SIZE) {
      return asset;
    }

    // Compress image
    const resizedImage = await ImageResizer.createResizedImage(
      asset.uri,
      1280, // width
      1280, // height
      'JPEG',
      80, // quality (reduce if still > 5MB)
    );

    const stats = await RNFS.stat(resizedImage.uri);

    // If still > 5MB, block upload
    if (stats.size > MAX_SIZE) {
      throw new Error('Image size is more than 5MB even after compression');
    }

    return {
      uri: resizedImage.uri,
      name: resizedImage.name || asset.fileName,
      type: 'image/jpeg',
    };
  };

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      // maxHeight: 180,
      // maxWidth: 150,
    };

    launchImageLibrary(options, handleResponse);
  };

  // const handleCameraLaunch = async () => {
  //   try {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.CAMERA,
  //       );
  //       if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
  //         return;
  //       }
  //     }

  //     const result = await launchCamera({
  //       mediaType: 'photo',
  //       saveToPhotos: true,
  //       quality: 1,
  //     });

  //     if (result.didCancel) return;
  //     if (result.errorMessage) {
  //       console.log('Camera error:', result.errorMessage);
  //       return;
  //     }

  //     const asset = result.assets?.[0];
  //     if (!asset) return;

  //     setSelectedImage(asset.uri);
  //     setSelectedImageName(asset.fileName);
  //     setSelectedImageType(asset.type);
  //     setModalVisible(false);
  //   } catch (error) {
  //     console.log('Camera launch error: ', error);
  //   }
  // };

  // const handleResponse = response => {
  //   if (response.didCancel) {
  //     console.log('User cancelled image picker');
  //   } else if (response.error) {
  //     console.log('Image picker error: ', response.error);
  //   } else {
  //     let imageUri = response.uri || response.assets?.[0]?.uri;
  //     //setSelectedImage(imageUri);
  //     //uploadImage(imageUri);
  //     const imageuri = response.assets[0].uri;
  //     const fileName = response.assets[0].fileName;
  //     const fileType = response.assets[0].type;
  //     setSelectedImage(imageuri);
  //     setSelectedImageName(fileName);
  //     setSelectedImageType(fileType);
  //     // console.log('imageuri',imageuri);
  //     // console.log('fileName',fileName);
  //     // console.log('fileType',fileType);
  //   }
  //   setModalVisible(false);
  // };

  const handleCameraLaunch = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      const finalImage = await compressImageIfNeeded(asset);

      setSelectedImage(finalImage.uri);
      setSelectedImageName(finalImage.name);
      setSelectedImageType(finalImage.type);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleResponse = async response => {
    try {
      if (response.didCancel) return;

      const asset = response.assets?.[0];
      if (!asset) return;

      const finalImage = await compressImageIfNeeded(asset);

      setSelectedImage(finalImage.uri);
      setSelectedImageName(finalImage.name);
      setSelectedImageType(finalImage.type);
    } catch (error) {
      Alert.alert('Error', error.message);
    }

    setModalVisible(false);
  };

  /* ---------------- TIME ---------------- */
  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);
    const timer = setInterval(() => {
      setTime(
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

  /* ---------------- CACHED LOCATION ---------------- */
  const getLastKnownLocation = () => {
    Geolocation.getCurrentPosition(
      async pos => {
        const {latitude, longitude} = pos.coords;
        console.log('📍 CACHED LOCATION:', latitude, longitude);

        setLocation({latitude, longitude});
        setMapRegion({...mapRegion, latitude, longitude});

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
        maximumAge: 300000,
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

      // show cached immediately
      getLastKnownLocation();

      watchId = Geolocation.watchPosition(
        async position => {
          const {latitude, longitude} = position.coords;

          console.log('LIVE GPS:', latitude, longitude);

          setLocation({latitude, longitude});
          setMapRegion({...mapRegion, latitude, longitude});

          try {
            const geo = await Geocoder.from(latitude, longitude);
            if (geo.results?.length) {
              setPlaceName(geo.results[0].formatted_address);
            }
          } catch {}
        },
        err => console.log('GPS ERROR', err),
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
    return () => watchId && Geolocation.clearWatch(watchId);
  }, [visible]);

  /* ---------------- CAMERA ---------------- */
  // const takePhoto = async () => {
  //   const res = await launchCamera({
  //     mediaType: 'photo',
  //     cameraType: 'back',
  //     quality: 0.7,
  //     saveToPhotos: true,
  //   });

  //   if (res.assets?.length) {
  //     setAttachments(prev => [...prev, res.assets[0]]);
  //   }
  // };

  /* ---------------- FILE PICKER ---------------- */
  // const pickFile = async () => {
  //   try {
  //     const file = await DocumentPicker.pickSingle({
  //       type: [DocumentPicker.types.allFiles],
  //     });
  //     setAttachments(prev => [...prev, file]);
  //   } catch {}
  // };

  // const deleteAttachment = index => {
  //   Alert.alert(
  //     'Remove Attachment',
  //     'Are you sure you want to delete this attachment?',
  //     [
  //       {text: 'Cancel', style: 'cancel'},
  //       {
  //         text: 'Delete',
  //         style: 'destructive',
  //         onPress: () => {
  //           setAttachments(prev => prev.filter((_, i) => i !== index));

  //           // Close preview if the same file is open
  //           if (previewFile && attachments[index]?.uri === previewFile.uri) {
  //             setPreviewVisible(false);
  //             setPreviewFile(null);
  //           }
  //         },
  //       },
  //     ],
  //   );
  // };

  const saveVisit = async () => {
    /* ---------------- BASIC VALIDATION ---------------- */
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter name');
      return;
    } else if (!phone.trim()) {
      Alert.alert('Validation', 'Please enter phone');
      return;
    } else if (!location.latitude || !location.longitude) {
      Alert.alert('Validation', 'Location not available yet');
      return;
    } else if (!selectedImage) {
      Alert.alert('Validation', 'Please select an image');
      return;
    } else {
      try {
        /* ---------------- FETCH STORED DATA ---------------- */
        const userStr = await AsyncStorage.getItem('UserData');
        const dayStr = await AsyncStorage.getItem('DAY_INFO');

        if (!userStr || !dayStr) {
          Alert.alert('Error', 'User / Day information missing');
          return;
        }

        const user = JSON.parse(userStr);
        const dayInfo = JSON.parse(dayStr);

        /* ---------------- FORM DATA ---------------- */
        const formData = new FormData();

        // IDs
        formData.append('IDDay', dayInfo.IDDay);
        formData.append('IDUser', user.IDUser);
        formData.append('CompanyCode', user.CompanyCode);

        // Client details
        formData.append('AccountName', name);
        formData.append('AccountPhone', phone);
        formData.append('AccuountEmail', email);
        formData.append('Remarks', remarks);

        // Location
        formData.append('SiteLat', location.latitude.toString());
        formData.append('SiteLong', location.longitude.toString());
        formData.append('SiteLocation', placeName);

        // Device
        formData.append('DeviceID', device);
        formData.append('EntryUser', user.UserName);
        //formData.append('FileName', '');
        formData.append('Attachment', {
          uri: selectedImage, // Replace with actual path
          type: selectedImageType,
          name: selectedImageName,
        });
        console.log('FormData', formData);

        const url =
          BASE_URL + 'Attendance/Site/Visit?HexKey=' + user.CompanyHexKey;
        console.log('URL', url);

        const response = await fetch(url, {
          method: 'POST',
          body: formData,
        });

        const responseText = await response.text();
        console.log('RAW RESPONSE:', responseText);

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.log('JSON Parse Error:', e);
          Alert.alert('Error', 'Invalid server response');
          return;
        }

        if (result?.Status === 'SUCCESS') {
          Alert.alert('Success', 'Record saved successfully');
          navigation.navigate('AppNavScreen');
        } else {
          Alert.alert('Error wrong', result?.Status || 'Something went wrong');
        }
        // let response = await fetch(url, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'multipart/form-data',
        //   },
        //   body: formData,
        // });

        // let result = await response.json();
        // console.log('Response:', result);
        // if (result?.Status === 'SUCCESS') {
        //   const successMessage =
        //     result?.Message ||
        //     result?.Data?.Result ||
        //     'Record saved successfully'; // 👈 fallback

        //   Alert.alert('Success', successMessage);
        //   navigation.navigate('AppNavScreen');
        //   return;
        // } else {
        //   if (result?.Status === 'FAILED') {
        //     const errorMessage =
        //       result?.Message || result?.Data?.Result || 'Something went wrong';

        //     Alert.alert('Error', errorMessage);
        //     return;
        //   }
        // }

        /* ---------------- ATTACHMENTS (IFormFile) ---------------- */
        // attachments.forEach((file, index) => {
        //   formData.append('Attachment', {
        //     uri:
        //       Platform.OS === 'android'
        //         ? file.uri
        //         : file.uri.replace('file://', ''),
        //     type: file.type || 'application/octet-stream',
        //     name: file.fileName || file.name || `attachment_${index}`,
        //   });
        // });

        /* ---------------- DEBUG PAYLOAD (IMPORTANT) ---------------- */
        // console.log('📦 VISIT SAVE FORM DATA ↓↓↓');
        // formData._parts.forEach(p => {
        //   if (typeof p[1] === 'object') {
        //     console.log(p[0], {
        //       name: p[1].name,
        //       type: p[1].type,
        //       uri: p[1].uri,
        //     });
        //   } else {
        //     console.log(p[0], p[1]);
        //   }
        // });
        // console.log('📦 VISIT SAVE FORM DATA ↑↑↑');

        // /* ---------------- API CALL ---------------- */
        // const response = await fetch(`${BASE_URL}Attendance/Site/Visit`, {
        //   method: 'POST',
        //   headers: {
        //     //Accept: 'application/json',
        //     'Content-Type': 'multipart/form-data',
        //     // ❌ DO NOT SET Content-Type
        //   },
        //   body: formData,
        // });

        // const result = await response.json();
        // console.log('✅ VISIT SAVE RESPONSE:', result);

        // if (result?.Status === 'SUCCESS') {
        //   Alert.alert('Success', 'Client visit saved successfully');
        // } else {
        //   Alert.alert('Failed', result?.Message || 'Unable to save visit');
        // }
      } catch (error) {
        console.log('❌ SAVE VISIT ERROR:', error);
        Alert.alert('Error', 'Unable to save visit');
      }
    }
  };

  return (
    <KeyboardAwareLayout>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* MAP */}
        {/* <MapView style={styles.map} region={mapRegion}>
          <Marker coordinate={location} />
        </MapView> */}

        {/* LOCATION CARD */}
        {/* <View style={styles.card}>
          <Row
            icon="location-outline"
            text={`${location.latitude.toFixed(
              6,
            )}, ${location.longitude.toFixed(6)}`}
          />
          {placeName !== '' && <Row icon="business-outline" text={placeName} />}
          <Row icon="time-outline" text={time} />
        </View> */}

        {/* INPUTS */}
        <Input label="Name" value={name} onChangeText={setName} />
        <InputP
          label="Phone"
          value={phone}
          keyboardType="phone-pad"
          onChangeText={setPhone}
        />
        <Input
          label="Email"
          value={email}
          keyboardType="email-address"
          onChangeText={setEmail}
        />
        <Input
          label="Remarks"
          value={remarks}
          multiline
          onChangeText={setRemarks}
        />
        <View style={{alignItems: 'center', margin: 10}}>
          {selectedImage && (
            <Image
              source={{uri: selectedImage}}
              style={{height: 200, width: 200}}
              resizeMode="contain"
            />
          )}
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 5,
          }}>
          {/* <Button
                      title="Attach Image"
                      onPress={() => setModalVisible(true)}
                    /> */}
          <TouchableOpacity
            style={styles.button1}
            onPress={() => setModalVisible(true)}>
            <Text style={{color: '#fff'}}>Attach Image</Text>
          </TouchableOpacity>
          {/* <AvatarAlert
                      visible={modalVisible}
                      onClose={() => setModalVisible(false)}
                    /> */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleCameraLaunch}>
                  <Text style={styles.modalText}>Take Photo...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.button}
                  onPress={openImagePicker}>
                  <Text style={styles.modalText}>Choose from Library...</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(!modalVisible)}>
                  <Text style={styles.modalText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* ATTACHMENTS */}
        {/* <View style={styles.rowBtns}>
          <Btn title="Take Photo" onPress={takePhoto} />
          <Btn title="Attach File" onPress={pickFile} />
        </View>

        {attachments.map((file, index) => (
          <View key={index} style={styles.attachmentRow}>
            
            <TouchableOpacity
              style={styles.attachmentInfo}
              onPress={() => {
                setPreviewFile(file);
                setPreviewVisible(true);
              }}>
              <Ionicons
                name={
                  file.type?.startsWith('image/')
                    ? 'image-outline'
                    : 'document-outline'
                }
                size={20}
                color="#005696"
              />
              <Text numberOfLines={1} style={styles.attachmentName}>
                {file.fileName || file.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteAttachment(index)}
              style={styles.deleteIcon}>
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))} */}

        <TouchableOpacity style={styles.saveBtn} onPress={saveVisit}>
          <Text style={styles.saveText}>Save Visit</Text>
        </TouchableOpacity>

        {/* <Modal visible={previewVisible} transparent animationType="fade">
          <View style={styles.previewOverlay}>
            {previewFile?.type?.startsWith('image/') ? (
              <ImageViewer
                imageUrls={[
                  {
                    url: previewFile.uri,
                  },
                ]}
                enableSwipeDown
                onSwipeDown={() => setPreviewVisible(false)}
                renderIndicator={() => null}
                backgroundColor="rgba(0,0,0,0.85)"
              />
            ) : (
              <View style={styles.previewContainer}>
                <Ionicons name="document-outline" size={48} color="#374151" />
                <Text style={styles.previewFileName}>
                  {previewFile?.fileName || previewFile?.name}
                </Text>

                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  onPress={() => setPreviewVisible(false)}>
                  <Text style={styles.previewCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal> */}
      </ScrollView>
    </KeyboardAwareLayout>
  );
};

export default DashBoardNew;

/* ---------------- SMALL COMPONENTS ---------------- */

// const Row = ({icon, text}) => (
//   <View style={styles.row}>
//     <Ionicons name={icon} size={18} />
//     <Text style={styles.rowText}>{text}</Text>
//   </View>
// );

const Input = props => (
  <TextInput
    {...props}
    placeholder={props.label}
    style={styles.input}
    placeholderTextColor="#888"
  />
);
const InputP = props => (
  <TextInput
    {...props}
    placeholder={props.label}
    maxLength={10}
    style={styles.input}
    placeholderTextColor="#888"
  />
);

// const Btn = ({title, onPress}) => (
//   <TouchableOpacity style={styles.btn} onPress={onPress}>
//     <Text style={styles.btnText}>{title}</Text>
//   </TouchableOpacity>
// );

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {padding: 16},
  map: {height: 180, borderRadius: 12, margin: -15, marginBottom: 5},
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 4,
  },
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 6},
  rowText: {marginLeft: 6, fontSize: 14},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  rowBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  btn: {backgroundColor: '#005696', padding: 12, borderRadius: 8, width: '48%'},
  btnText: {color: '#fff', textAlign: 'center', fontWeight: '700'},
  file: {fontSize: 12, marginTop: 4},
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  attachmentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  attachmentName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
  },

  deleteIcon: {
    padding: 6,
  },

  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },

  previewContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  previewFileName: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  previewCloseBtn: {
    marginTop: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  button1: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#166AD4',
    borderRadius: 5,
    alignItems: 'center',
  },
  previewCloseText: {
    color: '#fff',
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
