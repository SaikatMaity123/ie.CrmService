import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Linking,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';

/* =========================================================
   AVATARS
========================================================= */
const MALE_AVATAR =
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300';
const FEMALE_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

/* =========================================================
   COMPONENT
========================================================= */
const CustomServiceDrawer = (props) => {
  const insets = useSafeAreaInsets();

  /* =======================================================
     USER & COMPANY DATA STATE
  ======================================================= */
  const [empEmail, setEmpEmail] = useState('');
  const [empEmpno, setEmpEmpno] = useState('');
  const [empName, setEmpName] = useState('');
  const [userGender, setUserGender] = useState('');

  const [companyEmail, setCompanyEmail] = useState('');
  const [companyMobile, setCompanyMobile] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCode, setCompanyCode] = useState('');

  /* =======================================================
     IMAGE PREVIEW MODAL STATE
  ======================================================= */
  const [previewImage, setPreviewImage] = useState(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const previewFadeAnim = useRef(new Animated.Value(0)).current;
  const previewScaleAnim = useRef(new Animated.Value(0.7)).current;

  /* =======================================================
     ANIMATION REFS
  ======================================================= */
  const drawerFade = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-25)).current;
  const companyTranslate = useRef(new Animated.Value(25)).current;
  const companyOpacity = useRef(new Animated.Value(0)).current;
  const menuTranslate = useRef(new Animated.Value(35)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.75)).current;
  const closeScale = useRef(new Animated.Value(1)).current;
  const cardPressScale = useRef(new Animated.Value(1)).current;

  /* =======================================================
     LOAD USER DATA
  ======================================================= */
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('UserData');
        if (!storedData) return;

        const user = JSON.parse(storedData);

        // User Details
        setEmpEmail(user.UserEmail || user.Email || '');
        setEmpEmpno(user.IDUser || user.ID || user.EmployeeID || '');
        setEmpName(user.UserName || user.UserFullName || user.Name || 'User');
        setUserGender(user.UserGender || user.Gender || '');

        // Company Details
        setCompanyEmail(user.CompanyEmail || '');
        setCompanyMobile(user.CompanyMobile || '');
        setCompanyAddress(user.CompanyAddress || '');
        setCompanyCode(user.CompanyCode || '');
      } catch (error) {
        console.log('UserData Error:', error);
      }
    };

    loadUserData();
  }, []);

  /* =======================================================
     MOUNT ANIMATIONS
  ======================================================= */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(drawerFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(headerTranslate, {
        toValue: 0,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(companyOpacity, {
        toValue: 1,
        duration: 500,
        delay: 180,
        useNativeDriver: true,
      }),
      Animated.spring(companyTranslate, {
        toValue: 0,
        tension: 60,
        friction: 9,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacity, {
        toValue: 1,
        duration: 500,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(menuTranslate, {
        toValue: 0,
        tension: 60,
        friction: 9,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* =======================================================
     IMAGE PREVIEW CONTROLLERS
  ======================================================= */
  const openImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    setPreviewImage(imageUrl);
    setPreviewModalVisible(true);
    previewFadeAnim.setValue(0);
    previewScaleAnim.setValue(0.75);

    Animated.parallel([
      Animated.timing(previewFadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(previewScaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeImagePreview = () => {
    Animated.parallel([
      Animated.timing(previewFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(previewScaleAnim, {
        toValue: 0.75,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPreviewModalVisible(false);
      setPreviewImage(null);
    });
  };

  /* =======================================================
     PRESS HANDLERS & ANIMATIONS
  ======================================================= */
  const handleAvatarPress = () => {
    Animated.sequence([
      Animated.spring(avatarScale, { toValue: 0.88, useNativeDriver: true }),
      Animated.spring(avatarScale, {
        toValue: 1,
        tension: 80,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseDrawer = () => {
    Animated.sequence([
      Animated.spring(closeScale, { toValue: 0.8, useNativeDriver: true }),
      Animated.spring(closeScale, { toValue: 1, useNativeDriver: true }),
    ]).start(() => {
      props.navigation.closeDrawer();
    });
  };

  const handlePressIn = (animVal) => {
    Animated.spring(animVal, {
      toValue: 0.97,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (animVal) => {
    Animated.spring(animVal, {
      toValue: 1,
      tension: 100,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const openEmail = () => {
    if (companyEmail) Linking.openURL(`mailto:${companyEmail}`).catch(() => {});
  };

  const openPhone = () => {
    if (companyMobile) Linking.openURL(`tel:${companyMobile}`).catch(() => {});
  };

  const avatarSource =
    userGender?.toUpperCase() === 'MALE' ? MALE_AVATAR : FEMALE_AVATAR;

  /* =======================================================
     RENDER
  ======================================================= */
  return (
    <Animated.View style={[styles.root, { opacity: drawerFade }]}>
      {/* GLASS BACKGROUND & AMBIENT GLOWS */}
      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={25}
        reducedTransparencyFallbackColor="#F7F8FF"
      />
      <View pointerEvents="none" style={styles.glassOverlay} />
      <View pointerEvents="none" style={styles.glowPurple} />
      <View pointerEvents="none" style={styles.glowBlue} />

      <DrawerContentScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* ================= HEADER ================= */}
        <Animated.View
          style={[styles.header, { transform: [{ translateY: headerTranslate }] }]}
        >
          <View style={styles.topRow}>
            {/* AVATAR CONTAINER */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                handleAvatarPress();
                openImagePreview(avatarSource);
              }}
            >
              <Animated.View
                style={[styles.avatarContainer, { transform: [{ scale: avatarScale }] }]}
              >
                <View style={styles.avatarGlassRing}>
                  <Image source={{ uri: avatarSource }} style={styles.avatar} />
                </View>
                <View style={styles.onlineDot} />
              </Animated.View>
            </TouchableOpacity>

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCloseDrawer}
            >
              <Animated.View
                style={[styles.closeButton, { transform: [{ scale: closeScale }] }]}
              >
                <Ionicons name="close" size={26} color="#14236D" />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* USER GREETING & ID */}
          <View style={styles.greetingWrapper}>
            <Text
              allowFontScaling={false}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={styles.greeting}
            >
              Hello, {empName || 'User'}! 👋
            </Text>
            {empEmpno ? (
              <View style={styles.badgeContainer}>
                <Text allowFontScaling={false} style={styles.badgeText}>
                  ID: {empEmpno}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ================= COMPANY INFO CARD ================= */}
        <Animated.View
          style={[
            styles.companyCardWrapper,
            {
              opacity: companyOpacity,
              transform: [
                { translateY: companyTranslate },
                { scale: cardPressScale },
              ],
            },
          ]}
        >
          <View style={styles.companyCard}>
            <View style={styles.companyHeader}>
              <View style={styles.companyIconContainer}>
                <Ionicons name="business-outline" size={24} color="#5366FF" />
              </View>
              <View style={styles.companyHeaderText}>
                <Text allowFontScaling={false} style={styles.companyTitle}>
                  Company Information
                </Text>
                <Text allowFontScaling={false} style={styles.companyCode}>
                  Code: {companyCode || 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* EMAIL */}
            {companyEmail ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openEmail}
                onPressIn={() => handlePressIn(cardPressScale)}
                onPressOut={() => handlePressOut(cardPressScale)}
                style={styles.infoRow}
              >
                <View style={[styles.infoIcon, { backgroundColor: 'rgba(83,102,255,0.10)' }]}>
                  <Ionicons name="mail-outline" size={18} color="#5366FF" />
                </View>
                <Text allowFontScaling={false} numberOfLines={1} style={styles.infoText}>
                  {companyEmail}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* PHONE */}
            {companyMobile ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={openPhone}
                onPressIn={() => handlePressIn(cardPressScale)}
                onPressOut={() => handlePressOut(cardPressScale)}
                style={styles.infoRow}
              >
                <View style={[styles.infoIcon, { backgroundColor: 'rgba(16,185,129,0.10)' }]}>
                  <Ionicons name="call-outline" size={18} color="#10B981" />
                </View>
                <Text allowFontScaling={false} numberOfLines={1} style={styles.infoText}>
                  {companyMobile}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* ADDRESS */}
            {companyAddress ? (
              <View style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: 'rgba(245,158,11,0.10)' }]}>
                  <Ionicons name="location-outline" size={18} color="#F59E0B" />
                </View>
                <Text allowFontScaling={false} numberOfLines={2} style={styles.infoText}>
                  {companyAddress}
                </Text>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ================= MENU ITEMS ================= */}
        <Animated.View
          style={[
            styles.menuWrapper,
            {
              opacity: menuOpacity,
              transform: [{ translateY: menuTranslate }],
            },
          ]}
        >
          <DrawerItemList {...props} />
        </Animated.View>

        {/* ================= FOOTER ================= */}
        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <Text allowFontScaling={false} style={styles.version}>
            Version 0.3
          </Text>
        </Animated.View>
      </DrawerContentScrollView>

      {/* ================= FULLSCREEN IMAGE PREVIEW MODAL ================= */}
      <Modal
        visible={previewModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeImagePreview}
      >
        <View style={imageModalStyles.modalContainer}>
          {/* Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              imageModalStyles.backdrop,
              { opacity: previewFadeAnim },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFillObject} onPress={closeImagePreview} />
          </Animated.View>

          {/* Close Button */}
          <TouchableOpacity
            style={imageModalStyles.closeButton}
            onPress={closeImagePreview}
            activeOpacity={0.8}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Expanded Image Card */}
          <Animated.View
            style={[
              imageModalStyles.imageFrame,
              {
                opacity: previewFadeAnim,
                transform: [{ scale: previewScaleAnim }],
              },
            ]}
          >
            {previewImage && (
              <Image
                source={{ uri: previewImage }}
                style={imageModalStyles.expandedImage}
                resizeMode="cover"
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default CustomServiceDrawer;

/* =========================================================
   STYLES
========================================================= */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(245,247,255,0.92)',
    overflow: 'hidden',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,249,255,0.70)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.85)',
  },
  glowPurple: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(120,82,255,0.08)',
    top: 140,
    right: -100,
  },
  glowBlue: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(72,116,255,0.08)',
    top: -50,
    left: -80,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    width: 74,
    height: 74,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlassRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(210,218,255,0.95)',
    shadowColor: '#5565D8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#5B67C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  greetingWrapper: {
    marginTop: 16,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  greeting: {
    color: '#101B61',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: 'rgba(83,102,255,0.10)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#5366FF',
    fontSize: 11,
    fontWeight: '700',
  },
  companyCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  companyCard: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#5967B9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(235,239,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.90)',
  },
  companyHeaderText: {
    flex: 1,
    marginLeft: 10,
  },
  companyTitle: {
    color: '#18236B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  companyCode: {
    marginTop: 2,
    color: '#7180B5',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 10,
    backgroundColor: 'rgba(150,160,210,0.18)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    marginVertical: 2,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    color: '#556596',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  menuWrapper: {
    marginHorizontal: 8,
    marginTop: 2,
  },
  footer: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingBottom: 8,
  },
  version: {
    color: '#8995BA',
    fontSize: 12,
    fontWeight: '600',
  },
});

const imageModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    right: 22,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  imageFrame: {
    width: 300,
    height: 300,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  expandedImage: {
    width: '100%',
    height: '100%',
  },
});