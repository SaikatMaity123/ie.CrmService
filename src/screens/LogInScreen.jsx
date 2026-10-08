import React, { useState,useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  Easing,
  Modal,
  PanResponder,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CRMImg from '../images/CRMNEW.svg';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

/* ==========================================================================
   CUSTOM INTERACTIVE GLASSMORPHIC LOADER
   Features:
   - Dynamic 3D tilt & physics response on touch drag (PanResponder)
   - Dual-layer counter-rotating gradient rings + core orb pulse
   - Orbiting glass particle beads
   - Ripple touch waves & interactive dismiss action
   ========================================================================== */
const InteractiveGlassLoader = ({ visible, message = 'Processing...', onCancel }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const reverseSpinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleModalAnim = useRef(new Animated.Value(0.85)).current;
  const opacityModalAnim = useRef(new Animated.Value(0)).current;

  // Interactive Pan / Tilt / Touch Physics
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const touchScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Modal Entry
      Animated.parallel([
        Animated.spring(scaleModalAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityModalAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Outer Ring Rotation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }),
      ).start();

      // Inner Reverse Ring Rotation
      Animated.loop(
        Animated.timing(reverseSpinAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      // Glowing Center Orb Pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.9,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      scaleModalAnim.setValue(0.85);
      opacityModalAnim.setValue(0);
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible]);

  // Touch Drag / Tilt Responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(touchScale, {
          toValue: 0.95,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(touchScale, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = reverseSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  // Tilt Interpolations based on pan distance
  const rotateX = pan.y.interpolate({
    inputRange: [-60, 60],
    outputRange: ['15deg', '-15deg'],
    extrapolate: 'clamp',
  });

  const rotateY = pan.x.interpolate({
    inputRange: [-60, 60],
    outputRange: ['-15deg', '15deg'],
    extrapolate: 'clamp',
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={loaderStyles.overlay}>
        <Animated.View style={[loaderStyles.backdrop, { opacity: opacityModalAnim }]} />

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            loaderStyles.cardContainer,
            {
              opacity: opacityModalAnim,
              transform: [
                { scale: scaleModalAnim },
                { scale: touchScale },
                { translateX: pan.x },
                { translateY: pan.y },
                { perspective: 800 },
                { rotateX },
                { rotateY },
              ],
            },
          ]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(238, 242, 255, 0.85)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={loaderStyles.glassCard}>
            
            {/* Multi-tier Rotating Glass Rings */}
            <View style={loaderStyles.spinnerWrapper}>
              {/* Outer Glow Ring */}
              <Animated.View
                style={[
                  loaderStyles.outerRing,
                  { transform: [{ rotate: spin }] },
                ]}>
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6', 'transparent']}
                  style={loaderStyles.ringGradient}
                />
                <View style={loaderStyles.orbitBead} />
              </Animated.View>

              {/* Inner Reverse Counter-Ring */}
              <Animated.View
                style={[
                  loaderStyles.innerRing,
                  { transform: [{ rotate: reverseSpin }] },
                ]}>
                <LinearGradient
                  colors={['#EC4899', '#6366F1', 'transparent']}
                  style={loaderStyles.ringGradient}
                />
                <View style={loaderStyles.orbitBeadInner} />
              </Animated.View>

              {/* Center Floating Sphere */}
              <Animated.View
                style={[
                  loaderStyles.centerSphere,
                  { transform: [{ scale: pulseAnim }] },
                ]}>
                <LinearGradient
                  colors={['#60A5FA', '#3B82F6', '#2563EB']}
                  style={loaderStyles.sphereGradient}>
                  <Feather name="shield" size={18} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Dynamic Status Text */}
            <Text style={loaderStyles.messageText}>{message}</Text>
            <Text style={loaderStyles.subHintText}>Drag to interact with the orb</Text>

            {/* Optional Touch Cancel Pill */}
            {/* {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                activeOpacity={0.7}
                style={loaderStyles.cancelBtn}>
                <Text style={loaderStyles.cancelBtnText}>Dismiss</Text>
              </TouchableOpacity>
            )} */}
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ---------------- CUSTOM GLASS ALERT COMPONENT ---------------- */
const GlassAlertModal = ({ visible, title, message, type = 'info', onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const btnScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose && onClose());
  };

  const getAlertConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: 'alert-circle',
          iconColor: '#EF4444',
          badgeBg: 'rgba(239, 68, 68, 0.15)',
          btnGradient: ['rgba(239, 68, 68, 0.22)', 'rgba(220, 38, 38, 0.35)'],
          btnTextColor: '#DC2626',
        };
      case 'warning':
        return {
          icon: 'alert-triangle',
          iconColor: '#F59E0B',
          badgeBg: 'rgba(245, 158, 11, 0.15)',
          btnGradient: ['rgba(245, 158, 11, 0.22)', 'rgba(217, 119, 6, 0.35)'],
          btnTextColor: '#D97706',
        };
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#10B981',
          badgeBg: 'rgba(16, 185, 129, 0.15)',
          btnGradient: ['rgba(16, 185, 129, 0.22)', 'rgba(5, 150, 105, 0.35)'],
          btnTextColor: '#059669',
        };
      default:
        return {
          icon: 'info',
          iconColor: '#3B82F6',
          badgeBg: 'rgba(59, 130, 246, 0.15)',
          btnGradient: ['rgba(59, 130, 246, 0.22)', 'rgba(37, 99, 235, 0.35)'],
          btnTextColor: '#2563EB',
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={alertStyles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[alertStyles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            alertStyles.alertCardWrapper,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.92)', 'rgba(241, 245, 249, 0.82)']}
            style={alertStyles.alertCard}>
            <View style={[alertStyles.iconBadge, { backgroundColor: config.badgeBg }]}>
              <Feather name={config.icon} size={28} color={config.iconColor} />
            </View>

            <Text style={alertStyles.alertTitle}>{title}</Text>
            <Text style={alertStyles.alertMessage}>{message}</Text>

            <TouchableWithoutFeedback
              onPressIn={() =>
                Animated.spring(btnScaleAnim, { toValue: 0.94, useNativeDriver: true }).start()
              }
              onPressOut={() =>
                Animated.spring(btnScaleAnim, { toValue: 1, useNativeDriver: true }).start()
              }
              onPress={handleClose}>
              <Animated.View
                style={[
                  alertStyles.alertBtnWrapper,
                  { transform: [{ scale: btnScaleAnim }] },
                ]}>
                <LinearGradient
                  colors={config.btnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={alertStyles.alertBtnGradient}>
                  <Text style={[alertStyles.alertBtnText, { color: config.btnTextColor }]}>
                    Okay
                  </Text>
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

/* ---------------- MAIN SCREEN COMPONENT ---------------- */
const LogInScreen = ({ navigation }) => {
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Custom Glass Alert State
  const [alertState, setAlertState] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title, message, type = 'warning') => {
    setAlertState({ visible: true, title, message, type });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  // Background Glass Orbs Animation Values
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;

  // Custom Button Interactive Animations
  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const loaderSpinAnim = useRef(new Animated.Value(0)).current;
  const loaderPulseAnim = useRef(new Animated.Value(1)).current;

  const dash_url = BASE_URL + 'Login/ValidateLogin';
  const [device, setDevice] = useState('');
  const [uName, setUname] = useState('');
  const [uPwd, setPwd] = useState('');
  const [showData, setshowData] = useState(true);
  const [showNData, setshowNData] = useState(false);
  const [loginLocation, setLoginLocation] = useState({
    lat: 0,
    lng: 0,
    address: '',
  });

  const togglePasswordVisibility = () => setSecureText(!secureText);

  const handleEditUsername = () => {
    setshowNData(false);
    setshowData(true);
    setPwd('');
  };

  /* ---------------- ANIMATED BUBBLES & SHIMMER ---------------- */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb3Anim, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orb3Anim, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  /* ---------------- INLINE BUTTON LOADER ANIMATION ---------------- */
  useEffect(() => {
    if (checkingUser) {
      Animated.loop(
        Animated.timing(loaderSpinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(loaderPulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(loaderPulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      loaderSpinAnim.setValue(0);
      loaderPulseAnim.setValue(1);
    }
  }, [checkingUser]);

  const loaderSpin = loaderSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width * 0.8, width * 0.8],
  });

  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const orb3TranslateY = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const orb3Scale = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  /* ---------------- LOCATION ---------------- */
  const fetchLocationForLogin = () =>
    new Promise(resolve => {
      Geolocation.getCurrentPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          let address = '';
          try {
            const geo = await Geocoder.from(lat, lng);
            if (geo.results?.length) {
              address = geo.results[0].formatted_address;
            }
          } catch {}

          const loc = { lat, lng, address };
          setLoginLocation(loc);
          resolve(loc);
        },
        () => {
          resolve({ lat: 0, lng: 0, address: '' });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 300000,
          timeout: 5000,
        },
      );
    });

  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          navigation.navigate('AppNavDash');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const login = () => {
    if (loading) return;
    NetInfo.fetch().then(async state => {
      if (!state.isConnected) {
        showAlert('No Internet', 'Please connect to an active internet network.', 'warning');
        return;
      }

      setLoading(true);

      try {
        const loc = await fetchLocationForLogin();
        submit(loc);
      } catch (e) {
        setLoading(false);
        showAlert('Location Error', 'Unable to fetch your current location.', 'error');
      }
    });
  };

  const submit = async loc => {
    if (uName === '') {
      showAlert('Input Required', 'User Name cannot be empty.', 'warning');
      setLoading(false);
      return;
    }

    if (uPwd === '') {
      showAlert('Input Required', 'Password cannot be empty.', 'warning');
      setLoading(false);
      return;
    }

    const data_api = {
      UserName: uName,
      Password: uPwd,
      DeviceID: `Mobile- ${device}`,
      MobileLat: loc?.lat?.toString() || '0',
      MobileLong: loc?.lng?.toString() || '0',
      MobileLocation: loc?.address || '',
    };

    try {
      let response = await fetch(dash_url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_api),
      });

      let result = await response.json();

      if (result?.data?.Result === 'Success') {
        await AsyncStorage.setItem('UserData', JSON.stringify(result.data));
        setLoading(false);
        navigation.replace('AppNavDash');
      } else if (result?.data?.Result === 'Active') {
        setLoading(false);
        showAlert('Account Active', 'User already logged in from another device!', 'warning');
      } else {
        setLoading(false);
        showAlert('Authentication Failed', 'Either username or password is incorrect!', 'error');
      }
    } catch (error) {
      setLoading(false);
      showAlert('Network Error', 'Login failed. Please try again.', 'error');
    }
  };

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const checkUserExist = async () => {
    if (uName.trim() === '') {
      showAlert('Required Field', 'Please enter a valid User ID.', 'warning');
      return;
    }

    setCheckingUser(true);
    try {
      const url = BASE_URL + 'Login/Validate/Account/Name?UserName=' + uName;
      const response = await fetch(url);
      const json = await response.json();

      setCheckingUser(false);

      if (json?.data?.Result === 'SUCCESS') {
        setshowData(false);
        setshowNData(true);
      } else {
        showAlert('Invalid User', 'The specified User ID does not exist.', 'error');
      }
    } catch (error) {
      setCheckingUser(false);
      showAlert('Check Failed', 'Error verifying user ID. Please try again.', 'error');
    }
  };

  return (
    <LinearGradient
      colors={['#EBF3FF', '#F4F7FF', '#FCEEF5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#EBF3FF" />

      {/* Background Glass Orbs */}
      <Animated.View
        style={[
          styles.leftGlassOrb,
          { transform: [{ translateY: orb1TranslateY }, { scale: orb1Scale }] },
        ]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(186, 218, 255, 0.35)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.rightGlassOrb,
          { transform: [{ translateY: orb2TranslateY }, { scale: orb2Scale }] },
        ]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.9)', 'rgba(238, 180, 245, 0.4)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.bottomGlassOrb,
          { transform: [{ translateY: orb3TranslateY }, { scale: orb3Scale }] },
        ]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.85)', 'rgba(219, 234, 254, 0.45)']}
          style={styles.orbGradient}
        />
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          
          <TouchableOpacity style={styles.dotsMenu} activeOpacity={0.6}>
            <Text style={styles.dotsText}>•••</Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <CRMImg height={220} width={220} />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.subtitleText}>Login to continue your journey</Text>
          </View>

          <View style={styles.cardContainer}>
            {/* STEP 1: USERNAME */}
            {showData ? (
              <View>
                <Text style={styles.label}>User Name</Text>
                <View style={styles.inputBox}>
                  <Feather name="user" size={18} color="#64748B" style={styles.leftIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your user name"
                    placeholderTextColor="#A1A1AA"
                    value={uName}
                    onChangeText={text => setUname(text)}
                    autoCapitalize="none"
                  />
                </View>

                {/* COMPACT NEXT BUTTON */}
                <TouchableWithoutFeedback
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={checkUserExist}
                  disabled={checkingUser}>
                  <Animated.View
                    style={[
                      styles.transparentPillWrapper,
                      styles.nextBtnCompact,
                      { transform: [{ scale: scaleValue }] },
                    ]}>
                    <LinearGradient
                      colors={[
                        'rgba(59, 130, 246, 0.22)',
                        'rgba(99, 102, 241, 0.28)',
                        'rgba(236, 72, 153, 0.18)',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.transparentPillGradient}>
                      
                      <Animated.View
                        style={[
                          styles.pillShimmer,
                          { transform: [{ translateX: shimmerTranslate }, { rotate: '25deg' }] },
                        ]}
                      />

                      {checkingUser ? (
                        <View style={styles.loaderContainer}>
                          <Animated.View
                            style={[
                              styles.customSpinnerRing,
                              { transform: [{ rotate: loaderSpin }] },
                            ]}
                          />
                          <Animated.Text
                            style={[styles.loaderText, { opacity: loaderPulseAnim }]}>
                            Verifying...
                          </Animated.Text>
                        </View>
                      ) : (
                        <View style={styles.btnInnerRow}>
                          <Text style={styles.pillBtnText}>Next</Text>
                          <View style={styles.pillIconCircle}>
                            <Feather name="arrow-right" size={15} color="#3B82F6" />
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}

            {/* STEP 2: PASSWORD */}
            {showNData ? (
              <View>
                <Text style={styles.label}>User Name</Text>
                <View style={[styles.inputBox, styles.disabledInput]}>
                  <Feather name="user" size={18} color="#94A3B8" style={styles.leftIcon} />
                  <TextInput
                    placeholder="User Name"
                    value={uName}
                    editable={false}
                    autoCapitalize="none"
                    style={[styles.input, { color: '#64748B' }]}
                  />
                  <TouchableOpacity
                    onPress={handleEditUsername}
                    activeOpacity={0.7}
                    style={styles.editBtnInside}>
                    <Feather name="edit-2" size={14} color="#2563EB" style={{ marginRight: 4 }} />
                    <Text style={styles.editTextInside}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.inputBox}>
                  <Feather name="lock" size={18} color="#64748B" style={styles.leftIcon} />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#A1A1AA"
                    value={uPwd}
                    onChangeText={text => setPwd(text)}
                    style={styles.input}
                    secureTextEntry={secureText}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility}>
                    <Feather
                      name={secureText ? 'eye-off' : 'eye'}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={styles.rememberRow}
                    activeOpacity={0.7}
                    onPress={() => setRememberMe(!rememberMe)}>
                    <MaterialCommunityIcons
                      name={rememberMe ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={20}
                      color={rememberMe ? '#3B82F6' : '#CBD5E1'}
                    />
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>
                </View>

                {/* FULL WIDTH LOGIN BUTTON */}
                <TouchableWithoutFeedback
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  onPress={login}
                  disabled={loading}>
                  <Animated.View
                    style={[
                      styles.transparentPillWrapper,
                      { transform: [{ scale: scaleValue }] },
                    ]}>
                    <LinearGradient
                      colors={[
                        'rgba(37, 99, 235, 0.24)',
                        'rgba(124, 58, 237, 0.28)',
                        'rgba(236, 72, 153, 0.20)',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.transparentPillGradient}>
                      
                      <Animated.View
                        style={[
                          styles.pillShimmer,
                          { transform: [{ translateX: shimmerTranslate }, { rotate: '25deg' }] },
                        ]}
                      />

                      <View style={styles.btnInnerRow}>
                        <Text style={styles.pillBtnText}>Login</Text>
                        <View style={styles.pillIconCircle}>
                          <Feather name="log-in" size={15} color="#2563EB" />
                        </View>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                </TouchableWithoutFeedback>
              </View>
            ) : null}
          </View>

          <Text style={styles.versionText}>Version 0.3</Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* USER INTERACTIVE GLASSMORPHIC LOADER */}
      <InteractiveGlassLoader
        visible={loading}
        message="Authenticating Session..."
        onCancel={() => setLoading(false)}
      />

      {/* Glassmorphic Animated Alert */}
      <GlassAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        onClose={hideAlert}
      />
    </LinearGradient>
  );
};

export default LogInScreen;

/* ---------------- INTERACTIVE GLASS LOADER STYLES ---------------- */
const loaderStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 310,
    borderRadius: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 12,
  },
  glassCard: {
    borderRadius: 30,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  spinnerWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderTopColor: '#3B82F6',
    borderRightColor: '#8B5CF6',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  innerRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    borderBottomColor: '#EC4899',
    borderLeftColor: '#6366F1',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  ringGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 50,
    opacity: 0.15,
  },
  orbitBead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    top: -5,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  orbitBeadInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EC4899',
    bottom: -4,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  centerSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  sphereGradient: {
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  messageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subHintText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.6)',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});

/* ---------------- GLASS ALERT STYLES ---------------- */
const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  alertCardWrapper: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  alertCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertBtnWrapper: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  alertBtnGradient: {
    height: 46,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  alertBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

/* ---------------- MAIN SCREEN STYLES ---------------- */
const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  leftGlassOrb: {
    position: 'absolute',
    top: 100,
    left: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    overflow: 'hidden',
  },
  rightGlassOrb: {
    position: 'absolute',
    top: 150,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    overflow: 'hidden',
  },
  bottomGlassOrb: {
    position: 'absolute',
    bottom: -40,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    overflow: 'hidden',
  },
  orbGradient: { flex: 1, borderRadius: 140 },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  dotsMenu: {
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: 4,
  },
  dotsText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: -10,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  leftIcon: {
    marginRight: 10,
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  editBtnInside: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  editTextInside: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 6,
  },

  /* ================= CLEAN THEME PILL BUTTONS ================= */
  transparentPillWrapper: {
    marginTop: 14,
    width: '100%',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  nextBtnCompact: {
    width: '85%',
    alignSelf: 'center',
  },
  transparentPillGradient: {
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  pillShimmer: {
    position: 'absolute',
    width: 60,
    height: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    top: -35,
  },
  btnInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pillBtnText: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  customSpinnerRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    borderTopColor: '#2563EB',
  },
  loaderText: {
    color: '#1E293B',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 24,
  },
});