import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Modal,
  Image,
  ImageBackground,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_API_KEY, BASE_URL } from '@env';

Geocoder.init(GOOGLE_MAPS_API_KEY);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Limit

const ClientVisitScreen = ({ navigation }) => {
  const [visible, setVisible] = useState(true);

  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageType, setSelectedImageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaderText, setLoaderText] = useState('Please wait...');

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'warning', // 'warning' | 'success' | 'error' | 'info'
    onConfirm: null,
  });

  const showAlert = (title, message, type = 'warning', onConfirm = null) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      type,
      onConfirm,
    });
  };

  const hideAlert = () => {
    const callback = alertConfig.onConfirm;
    setAlertConfig(prev => ({ ...prev, visible: false, onConfirm: null }));
    if (typeof callback === 'function') {
      callback();
    }
  };

  // Animation values for picker modal
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = callback => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (typeof callback === 'function') callback();
    });
  };

  const options = {
    saveToPhotos: true,
    mediaType: 'photo',
    includeBase64: false,
    quality: 0.8,
  };

  /* ---------------- VALIDATE IMAGE SIZE ---------------- */
  const validateImageSize = asset => {
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
      showAlert(
        'Image Too Large',
        `Selected image size is ${(asset.fileSize / (1024 * 1024)).toFixed(
          2,
        )} MB.\nPlease select an image smaller than 5 MB.`,
        'warning',
      );
      return false;
    }
    return true;
  };

  /* ---------------- PROCESS IMAGE & CONVERT HEIC/HEIF ---------------- */
  const processAndSetImage = async asset => {
    if (!validateImageSize(asset)) {
      return;
    }

    let image = {
      uri: asset.uri,
      name: asset.fileName || asset.uri.split('/').pop() || 'visit_image.jpg',
      type: asset.type || 'image/jpeg',
    };

    if (
      asset.type?.toLowerCase().includes('heic') ||
      asset.type?.toLowerCase().includes('heif') ||
      asset.fileName?.toLowerCase().endsWith('.heic') ||
      asset.fileName?.toLowerCase().endsWith('.heif')
    ) {
      try {
        const resized = await ImageResizer.createResizedImage(
          asset.uri,
          1500,
          1500,
          'JPEG',
          90,
        );

        image = {
          uri: resized.uri,
          name: 'image.jpg',
          type: 'image/jpeg',
        };
      } catch (resizeErr) {
        console.log('Resizer error:', resizeErr);
        showAlert('Conversion Error', 'Failed to convert HEIC/HEIF image format.', 'error');
        return;
      }
    }

    setSelectedImage(image.uri);
    setSelectedImageName(image.name);
    setSelectedImageType(image.type);
  };

  /* ---------------- IMAGE PICKER (GALLERY) ---------------- */
  const openImagePicker = async () => {
    closeModal(async () => {
      try {
        await launchImageLibrary(options, handleResponse);
      } catch (err) {
        console.log('Image picker error:', err);
        showAlert('Error', 'Failed to open image library', 'error');
      }
    });
  };

  /* ---------------- CAMERA LAUNCH ---------------- */
  const handleCameraLaunch = async () => {
    closeModal(async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            showAlert('Permission Denied', 'Camera permission is required.', 'warning');
            return;
          }
        }

        const result = await launchCamera({
          mediaType: 'photo',
          saveToPhotos: true,
          quality: 1,
        });

        if (result.didCancel || result.errorMessage) return;

        const asset = result.assets?.[0];

        if (!asset) return;

        await processAndSetImage(asset);
      } catch (err) {
        console.log('Camera error:', err);
        showAlert('Camera Error', 'Could not access device camera', 'error');
      }
    });
  };

  /* ---------------- HANDLE PICKER RESPONSE ---------------- */
  const handleResponse = async response => {
    if (response.didCancel || !response.assets?.[0]) {
      return;
    }

    const asset = response.assets[0];
    await processAndSetImage(asset);
  };

  /* ---------------- TIME & DEVICE ---------------- */
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
        showAlert('GPS Not Active', 'Please enable location services.', 'warning');
        await promptForEnableLocationIfNeeded();
      }
    }
  };

  /* ---------------- CACHED LOCATION ---------------- */
  const getLastKnownLocation = () => {
    Geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
        setMapRegion({ ...mapRegion, latitude, longitude });

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

      getLastKnownLocation();

      watchId = Geolocation.watchPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setMapRegion({ ...mapRegion, latitude, longitude });

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

  const saveVisit = async () => {
    if (!name.trim()) {
      showAlert('Validation', 'Please enter name', 'warning');
      return;
    } else if (!phone.trim()) {
      showAlert('Validation', 'Please enter phone', 'warning');
      return;
    } else if (!location.latitude || !location.longitude) {
      showAlert('Validation', 'Location not available yet', 'warning');
      return;
    } else if (!selectedImage) {
      showAlert('Validation', 'Please select an image', 'warning');
      return;
    } else {
      setLoading(true);
      try {
        const userStr = await AsyncStorage.getItem('UserData');
        const dayStr = await AsyncStorage.getItem('DAY_INFO');

        if (!userStr || !dayStr) {
          showAlert('Error', 'User / Day information missing', 'error');
          return;
        }

        const user = JSON.parse(userStr);
        const dayInfo = JSON.parse(dayStr);
        const formData = new FormData();

        formData.append('IDDAY', dayInfo.IDDay);
        formData.append('IDUser', user.IDUser);
        formData.append('CompanyCode', user.CompanyCode);
        formData.append('AccountName', name);
        formData.append('AccountPhone', phone);
        formData.append('AccuountEmail', email);
        formData.append('Remarks', remarks);
        formData.append('SiteLat', location.latitude);
        formData.append('SiteLong', location.longitude);
        formData.append('SiteLocation', placeName);
        formData.append('DeviceID', device);
        formData.append('EntryUser', user.UserName);

        formData.append('Attachment', {
          uri: Platform.OS === 'ios' ? selectedImage.replace('file://', '') : selectedImage,
          type: selectedImageType,
          name: selectedImageName,
        });

        const response = await axios.post(
          BASE_URL + 'Attendance/Site/Visit?HexKey=' + user.CompanyHexKey,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (response.data.Status === 'SUCCESS') {
          showAlert('Success', 'Client visit recorded successfully!', 'success', () => {
            navigation.goBack();
          });
        } else {
          showAlert('Submission Error', response.data.Status || 'Failed to submit visit', 'error');
        }
      } catch (error) {
        console.error('API ERROR:', error.response?.data || error.message);
        showAlert('Network Error', error.response?.data?.message || 'Something went wrong', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const getAlertIcon = () => {
    switch (alertConfig.type) {
      case 'success':
        return <Ionicons name="checkmark-circle-outline" size={44} color="#10B981" />;
      case 'error':
        return <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />;
      case 'warning':
      default:
        return <Ionicons name="warning-outline" size={44} color="#F59E0B" />;
    }
  };

  return (
    <ImageBackground
      source={require('../images/bg.png')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.transparentFlex}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.transparentFlex}>
          
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.circleIconButton}
              onPress={() => navigation?.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#3B3B7A" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Client Visit</Text>
            </View>

            <View style={{ width: 44, height: 44 }} />
          </View>

          <ScrollView
            style={styles.transparentFlex}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">

            {/* Main Glass Panel */}
            <View style={styles.mainGlassPanel}>
              <GlassInputRow
                icon="person-outline"
                label="Name"
                required
                placeholder="Enter client name"
                value={name}
                onChangeText={setName}
              />

              <GlassInputRow
                icon="call-outline"
                label="Phone"
                required
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />

              <GlassInputRow
                icon="mail-outline"
                label="Email"
                placeholder="Enter email address"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <GlassInputRow
                icon="chatbubble-ellipses-outline"
                label="Remarks"
                placeholder="Add remarks or notes (optional)"
                multiline
                value={remarks}
                onChangeText={setRemarks}
              />

              {/* Dashed Attach Image Tile */}
              <TouchableOpacity
                style={styles.attachTileContainer}
                activeOpacity={0.8}
                onPress={openModal}>
                <View style={styles.cloudIconCircle}>
                  <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.attachTileTitle}>
                    {selectedImage ? 'Image Attached' : 'Attach Image'}
                  </Text>
                  <Text style={styles.attachTileSubtitle} numberOfLines={1}>
                    {selectedImageName
                      ? selectedImageName
                      : 'Upload visit related image (Max 5MB)'}
                  </Text>
                </View>

                <View style={styles.imageRightIcon}>
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage }}
                      style={{ width: 34, height: 34, borderRadius: 10 }}
                    />
                  ) : (
                    <Ionicons name="image-outline" size={20} color="#8B5CF6" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Save Visit Button */}
              <TouchableOpacity activeOpacity={0.85} onPress={saveVisit}>
                <LinearGradient
                  colors={['#C084FC', '#6366F1', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButton}>
                  <Ionicons name="sparkles" size={16} color="#FDE047" style={{ marginRight: 6 }} />
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveButtonText}>Save Visit</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Animated Custom Image Selection Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => closeModal()}>
          <View style={styles.centeredModalOverlay}>
            <Animated.View
              style={[
                styles.glassModalView,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}>
              <Text style={styles.modalHeaderTitle}>Select Image Source</Text>

              <TouchableOpacity
                style={styles.modalOptionButton}
                activeOpacity={0.7}
                onPress={handleCameraLaunch}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="camera" size={22} color="#6D28D9" />
                </View>
                <Text style={styles.modalOptionText}>Take Photo...</Text>
                <Ionicons name="chevron-forward" size={18} color="#A78BFA" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOptionButton}
                activeOpacity={0.7}
                onPress={openImagePicker}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="images" size={22} color="#6D28D9" />
                </View>
                <Text style={styles.modalOptionText}>Choose from Gallery...</Text>
                <Ionicons name="chevron-forward" size={18} color="#A78BFA" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                activeOpacity={0.7}
                onPress={() => closeModal()}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Custom Generic Alert Modal */}
        <Modal
          visible={alertConfig.visible}
          transparent
          animationType="fade"
          onRequestClose={hideAlert}>
          <View style={styles.modalOverlay}>
            <View style={styles.alertCard}>
              {getAlertIcon()}
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertSubtitle}>{alertConfig.message}</Text>
              <TouchableOpacity
                style={styles.alertBtn}
                activeOpacity={0.8}
                onPress={hideAlert}>
                <Text style={styles.alertBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Loader Modal */}
        {loading && (
          <Modal transparent animationType="fade" visible={loading}>
            <View style={styles.centeredModalOverlay}>
              <View style={styles.loaderGlassBox}>
                <ActivityIndicator size="large" color="#6D28D9" />
                <Text style={styles.loaderText}>{loaderText}</Text>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

/* ---------------- GLASS INPUT COMPONENT ---------------- */

const GlassInputRow = ({
  icon,
  label,
  required,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  multiline,
}) => {
  return (
    <View style={[styles.inputCard, multiline && { height: 'auto', minHeight: 68 }]}>
      <View style={styles.inputIconContainer}>
        <Ionicons name={icon} size={20} color="#635BFF" />
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.inputLabelText}>
          {label} {required && <Text style={{ color: '#EF4444' }}>*</Text>}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          style={[styles.textInputStyle, multiline && { height: 'auto', paddingTop: 2 }]}
        />
      </View>
    </View>
  );
};

export default ClientVisitScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#EBF3FF',
  },
  transparentFlex: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  circleIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  mainGlassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 30,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    marginTop: 10,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(238, 242, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  textInputStyle: {
    fontSize: 13,
    color: '#334155',
    padding: 0,
    marginTop: 2,
  },
  attachTileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 243, 255, 0.35)',
    borderRadius: 22,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(196, 181, 253, 0.6)',
    borderStyle: 'dashed',
    marginVertical: 4,
    marginBottom: 16,
  },
  cloudIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachTileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  attachTileSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  imageRightIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 18,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassModalView: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    //elevation: 8,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  optionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C1D95',
    flex: 1,
  },
  modalCancelButton: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  loaderGlassBox: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4C1D95',
    fontWeight: '600',
  },
  /* Alert Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
   //elevation: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
    lineHeight: 20,
  },
  alertBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  alertBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});