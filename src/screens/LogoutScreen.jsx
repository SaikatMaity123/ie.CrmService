import React, {
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

import CRMImg from '../images/CRMNEW.svg';

import AsyncStorage from
  '@react-native-async-storage/async-storage';

import axios from 'axios';

import { BASE_URL } from '@env';

import Ionicons from
  'react-native-vector-icons/Ionicons';

import LinearGradient from
  'react-native-linear-gradient';

import {
  CommonActions,
} from '@react-navigation/native';


// ============================================================
// CUSTOM ALERT MODAL
// ============================================================

const CustomAlertModal = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  loading,
}) => {

  const scaleValue =
    useRef(new Animated.Value(0)).current;

  const fadeValue =
    useRef(new Animated.Value(0)).current;

  const pulseValue =
    useRef(new Animated.Value(1)).current;


  useEffect(() => {

    if (visible) {

      Animated.parallel([
        Animated.timing(
          fadeValue,
          {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          scaleValue,
          {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }
        ),
      ]).start();


      Animated.loop(
        Animated.sequence([

          Animated.timing(
            pulseValue,
            {
              toValue: 1.15,
              duration: 800,
              easing: Easing.ease,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            pulseValue,
            {
              toValue: 1,
              duration: 800,
              easing: Easing.ease,
              useNativeDriver: true,
            }
          ),

        ])
      ).start();

    } else {

      Animated.parallel([

        Animated.timing(
          fadeValue,
          {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }
        ),

        Animated.timing(
          scaleValue,
          {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }
        ),

      ]).start();
    }

  }, [
    visible,
    fadeValue,
    scaleValue,
    pulseValue,
  ]);


  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onCancel}
    >

      <Animated.View
        style={[
          styles.overlayContainer,
          {
            opacity: fadeValue,
          },
        ]}
      >

        <Animated.View
          style={[
            styles.alertCard,
            {
              transform: [
                {
                  scale: scaleValue,
                },
              ],
            },
          ]}
        >

          <LinearGradient
            colors={[
              '#FEF2F2',
              '#FEE2E2',
            ]}
            style={styles.alertHeaderAccent}
          >

            <Animated.View
              style={[
                styles.iconRing,
                {
                  transform: [
                    {
                      scale: pulseValue,
                    },
                  ],
                },
              ]}
            >

              <Ionicons
                name="log-out-outline"
                size={28}
                color="#EF4444"
              />

            </Animated.View>

          </LinearGradient>


          <View style={styles.logoWrapper}>

            <CRMImg
              height={42}
              width={100}
            />

          </View>


          <Text style={styles.alertTitle}>
            {title}
          </Text>


          <Text style={styles.alertMessage}>
            {message}
          </Text>


          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={[
                styles.btn,
                styles.cancelBtn,
              ]}
              activeOpacity={0.7}
              disabled={loading}
              onPress={onCancel}
            >

              <Text
                style={styles.cancelBtnText}
              >
                CANCEL
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              style={[
                styles.btn,
                styles.logoutBtn,
              ]}
              activeOpacity={0.8}
              disabled={loading}
              onPress={onConfirm}
            >

              {loading ? (

                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />

              ) : (

                <Text
                  style={styles.logoutBtnText}
                >
                  LOGOUT
                </Text>

              )}

            </TouchableOpacity>

          </View>

        </Animated.View>

      </Animated.View>

    </Modal>
  );
};


// ============================================================
// LOGOUT SCREEN
// ============================================================

const LogoutScreen = ({
  navigation,
}) => {

  const [
    modalVisible,
    setModalVisible,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ----------------------------------------------------------
  // SHOW LOGOUT MODAL
  // ----------------------------------------------------------

  useEffect(() => {

    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 50);

    return () => {
      clearTimeout(timer);
    };

  }, []);


  // ----------------------------------------------------------
  // CANCEL LOGOUT
  // ----------------------------------------------------------

  const onCancel = () => {

    setModalVisible(false);

    /*
     * We remain inside the Drawer here.
     * Dashboard belongs to the Drawer.
     */
    navigation.navigate('Dashboard');
  };


  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------

  const onLogout = async () => {

    if (loading) {
      return;
    }

    try {

      setLoading(true);


      // ------------------------------------------------------
      // GET USER DATA
      // ------------------------------------------------------

      const userDataStr =
        await AsyncStorage.getItem('UserData');


      // ------------------------------------------------------
      // CALL LOGOUT API
      // ------------------------------------------------------

      if (userDataStr) {

        try {

          const userData =
            JSON.parse(userDataStr);

          if (userData?.IDUser) {

            await axios.post(
              `${BASE_URL}Login/Logout`,
              {
                IDUser: userData.IDUser,
              },
              {
                timeout: 10000,
              }
            );
          }

        } catch (apiError) {

          console.log(
            'Logout API Error:',
            apiError
          );

          /*
           * IMPORTANT:
           * Even if logout API fails, we still
           * clear local session and logout.
           */
        }
      }


      // ------------------------------------------------------
      // CLEAR LOCAL STORAGE
      // ------------------------------------------------------

      await AsyncStorage.clear();


      // ------------------------------------------------------
      // CLOSE MODAL
      // ------------------------------------------------------

      setModalVisible(false);


      // ------------------------------------------------------
      // IMPORTANT NAVIGATION FIX
      // ------------------------------------------------------
      //
      // LogoutScreen is inside:
      //
      // NativeStack
      //    |
      //    +-- AppNavDash
      //          |
      //          +-- Drawer
      //                |
      //                +-- LogoutScreen
      //
      // LogIn belongs to NativeStack.
      //
      // Therefore DO NOT do:
      //
      // navigation.reset(...)
      //
      // because that resets the Drawer.
      //
      // Instead dispatch RESET to the parent/root navigator.
      // ------------------------------------------------------

      const rootNavigation =
        navigation.getParent();


      if (rootNavigation) {

        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,

            routes: [
              {
                name: 'LogIn',
              },
            ],
          })
        );

      } else {

        console.log(
          'Root navigation not found'
        );

      }

    } catch (error) {

      console.log(
        'Logout Error:',
        error
      );

      /*
       * Even if anything unexpected happens,
       * make sure the user is logged out locally.
       */

      try {
        await AsyncStorage.clear();
      } catch (storageError) {
        console.log(
          'Storage clear error:',
          storageError
        );
      }


      setModalVisible(false);


      const rootNavigation =
        navigation.getParent();


      if (rootNavigation) {

        rootNavigation.dispatch(
          CommonActions.reset({
            index: 0,

            routes: [
              {
                name: 'LogIn',
              },
            ],
          })
        );

      }

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <LinearGradient
      colors={[
        '#F0F4FF',
        '#F9FAFB',
      ]}
      style={{
        flex: 1,
      }}
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />


      <SafeAreaView
        style={{
          flex: 1,
        }}
      >

        <CustomAlertModal
          visible={modalVisible}

          title="Logout"

          message={
            'Are you sure you want to log out of your account?'
          }

          onCancel={onCancel}

          onConfirm={onLogout}

          loading={loading}
        />

      </SafeAreaView>

    </LinearGradient>
  );
};


export default LogoutScreen;


// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  overlayContainer: {
    flex: 1,

    backgroundColor:
      'rgba(15, 23, 42, 0.60)',

    justifyContent: 'center',

    alignItems: 'center',

    paddingHorizontal: 28,
  },


  alertCard: {
    width: '100%',

    maxWidth: 320,

    backgroundColor: '#FFFFFF',

    borderRadius: 24,

    paddingHorizontal: 20,

    paddingBottom: 20,

    alignItems: 'center',

    elevation: 12,

    shadowColor: '#0F172A',

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.22,

    shadowRadius: 24,

    overflow: 'hidden',
  },


  alertHeaderAccent: {
    width: '120%',

    height: 75,

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 8,

    borderBottomLeftRadius: 100,

    borderBottomRightRadius: 100,
  },


  iconRing: {
    width: 54,

    height: 54,

    borderRadius: 27,

    backgroundColor: '#FFFFFF',

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 22,

    elevation: 4,

    shadowColor: '#EF4444',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.2,

    shadowRadius: 6,
  },


  logoWrapper: {
    marginTop: 18,

    marginBottom: 4,

    alignItems: 'center',
  },


  alertTitle: {
    fontSize: 20,

    fontWeight: '700',

    color: '#0F172A',

    marginTop: 6,
  },


  alertMessage: {
    fontSize: 13.5,

    color: '#64748B',

    textAlign: 'center',

    marginTop: 6,

    marginBottom: 22,

    lineHeight: 19,

    paddingHorizontal: 8,
  },


  buttonRow: {
    flexDirection: 'row',

    justifyContent: 'space-between',

    width: '100%',
  },


  btn: {
    flex: 1,

    height: 44,

    borderRadius: 14,

    justifyContent: 'center',

    alignItems: 'center',
  },


  cancelBtn: {
    backgroundColor: '#F1F5F9',

    marginRight: 6,

    borderWidth: 1,

    borderColor: '#E2E8F0',
  },


  cancelBtnText: {
    fontSize: 13,

    fontWeight: '700',

    color: '#64748B',

    letterSpacing: 0.5,
  },


  logoutBtn: {
    backgroundColor: '#EF4444',

    marginLeft: 6,

    elevation: 3,

    shadowColor: '#EF4444',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.3,

    shadowRadius: 6,
  },


  logoutBtnText: {
    fontSize: 13,

    fontWeight: '700',

    color: '#FFFFFF',

    letterSpacing: 0.5,
  },

});