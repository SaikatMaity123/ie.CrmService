import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
  StatusBar,
  Animated as RNAnimated,
  Easing,
  Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* =========================================================
   CUSTOM GLASS LOADER COMPONENT
========================================================= */
const CustomGlassLoader = ({ visible, message = 'Loading...' }) => {
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      RNAnimated.loop(
        RNAnimated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          RNAnimated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={loaderStyles.overlay}>
        <View style={loaderStyles.card}>
          <RNAnimated.View style={[loaderStyles.ring, { transform: [{ rotate: spin }] }]} />
          <RNAnimated.Text style={[loaderStyles.text, { opacity: pulseAnim }]}>
            {message}
          </RNAnimated.Text>
        </View>
      </View>
    </Modal>
  );
};

// Interactive Animated Wrapper with Micro-Interactions on Entrance
const AnimatedField = ({ children, index = 0, style }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .duration(400)
        .springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

// Interactive Focus Field Wrapper for Text Inputs & Dropdown
const InteractiveGlassInput = ({ children, isFocused }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.015 : 1, {
      damping: 14,
      stiffness: 250,
    });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

// Interactive Gradient Glass Submit Button Component with Animated Icon
const GradientSubmitButton = ({ onPress, label, isSubmitting }) => {
  const scale = useSharedValue(1);
  const arrowTranslateX = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: arrowTranslateX.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    arrowTranslateX.value = withSpring(6, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    arrowTranslateX.value = withSpring(0, { damping: 12, stiffness: 200 });
  };

  return (
    <Animated.View style={animatedButtonStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isSubmitting}
        style={style.gradientButtonContainer}
      >
        <LinearGradient
          colors={['#3A86FF', '#8338EC', '#C77DFF']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={style.gradientButton}
        >
          <Text style={style.gradientButtonText}>{label}</Text>
          <Animated.View style={animatedIconStyle}>
            <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" style={style.buttonIcon} />
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const MasterAccount = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Loader States
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State hooks
  const [useCode, setCode] = useState('');
  const [useName, setName] = useState('');
  const [useAddress, setAddress] = useState('');
  const [useMobile, setMobile] = useState('');
  const [useempEmail, setempEmail] = useState('');
  const [usePcode, setPcode] = useState('');
  const [useSvalue, setSvalue] = useState('');
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useGST, setGST] = useState('');
  const [usePAN, setPAN] = useState('');
  const [useStateData, setStateData] = useState([]);
  const [useRemarks, setRemarks] = useState('');

  // Active focus tracking state for micro-interactions
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setInitialLoading(true);
        const userDataStr = await AsyncStorage.getItem('UserData');
        if (!userDataStr) {
          Alert.alert('User data not found. Please login again.');
          return;
        }

        const user = JSON.parse(userDataStr);
        setHexKey(user.CompanyHexKey);
        setUName(user.UserName);
        setBusinessID(user.CompanyCode);

        // Auto Code API
        const response = await fetch(
          `${BASE_URL}Account/Auto/Code?HexKey=${user.CompanyHexKey}&type=ACCOUNT`
        );
        const json = await response.json();
        if (json.Status === 'SUCCESS' && json.DataList?.length > 0) {
          setCode(json.DataList[0].AutoCode);
        }

        // State List API
        const responseNew = await fetch(
          `${BASE_URL}Misc/MiscList?HexKey=${user.CompanyHexKey}&type=STATE`
        );
        const jsonNew = await responseNew.json();
        if (jsonNew?.data?.length > 0) {
          const stateList = jsonNew.data.map((item) => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));
          setStateData(stateList);
        }
      } catch (error) {
        console.log('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const saveData = async () => {
    setSaving(true);
    const params = {
      IDAccount: 0,
      Code: useCode,
      Name: useName,
      Phone: useMobile,
      Email: useempEmail,
      Address1: useAddress,
      Address2: '',
      State: String(useSvalue),
      Pincode: usePcode,
      GSTNo: useGST,
      PANNo: usePAN,
      Remarks: useRemarks,
      EntryUser: useUName,
      BusinessID: useBusinessID,
    };

    try {
      let result = await fetch(`${BASE_URL}Account/Save?HexKey=${useHexKey}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      result = await result.json();
      if (result.Status === 'SUCCESS') {
        Alert.alert('Success', 'Account created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AppNavDash'),
          },
        ]);
      } else {
        Alert.alert(result.Message || 'Save failed');
      }
    } catch (error) {
      console.log('Save Error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Base text input properties
  const makeInputProps = (fieldName) => ({
    mode: 'outlined',
    style: style.input,
    outlineStyle: style.inputOutline,
    activeOutlineColor: '#8338EC',
    textColor: '#0F172A',
    placeholderTextColor: '#94A3B8',
    onFocus: () => setFocusedField(fieldName),
    onBlur: () => setFocusedField(null),
  });

  return (
    <ImageBackground
      source={require('../images/bg.png')}
      style={style.bgImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Dynamic Glass Top Bar */}
      <View style={{ paddingTop: Math.max(insets.top, 16) }}>
        <View style={style.headerBar}>
          <TouchableOpacity
            style={style.backCircleBtn}
            onPress={() => navigation.navigate('AppNavDash')}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={style.headerBarTitle}>Master Account</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Main Container */}
      <View style={{ flex: 1 }}>
        <KeyboardAwareScrollView
          contentContainerStyle={[
            style.scrollContainer,
            { paddingBottom: Math.max(insets.bottom, 24) + 40 },
          ]}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Glass Card Outer Container */}
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={style.cardContainer}
          >
            <AnimatedField index={0}>
              <InteractiveGlassInput isFocused={focusedField === 'code'}>
                <TextInput
                  {...makeInputProps('code')}
                  label="Account Code"
                  value={useCode}
                  editable={false}
                  left={<TextInput.Icon icon="barcode-scan" color="#8338EC" />}
                  style={[style.input, style.disabledInput]}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={1}>
              <InteractiveGlassInput isFocused={focusedField === 'name'}>
                <TextInput
                  {...makeInputProps('name')}
                  label="Account Name"
                  value={useName}
                  onChangeText={setName}
                  left={<TextInput.Icon icon="account-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={2}>
              <InteractiveGlassInput isFocused={focusedField === 'mobile'}>
                <TextInput
                  {...makeInputProps('mobile')}
                  label="Mobile Number"
                  maxLength={10}
                  value={useMobile}
                  keyboardType="numeric"
                  onChangeText={setMobile}
                  left={<TextInput.Icon icon="phone-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={3}>
              <InteractiveGlassInput isFocused={focusedField === 'email'}>
                <TextInput
                  {...makeInputProps('email')}
                  label="Email Address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={useempEmail}
                  onChangeText={setempEmail}
                  left={<TextInput.Icon icon="email-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={4}>
              <InteractiveGlassInput isFocused={focusedField === 'address'}>
                <TextInput
                  {...makeInputProps('address')}
                  label="Address"
                  value={useAddress}
                  onChangeText={setAddress}
                  left={<TextInput.Icon icon="map-marker-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            {/* Dropdown Field with Glass Styling & Active Border */}
            <AnimatedField index={5}>
              <InteractiveGlassInput isFocused={focusedField === 'state'}>
                <View style={style.dropdownWrapper}>
                  <Dropdown
                    style={[
                      style.dropdown,
                      focusedField === 'state' && style.dropdownFocused,
                    ]}
                    placeholderStyle={style.placeholderStyle}
                    selectedTextStyle={style.selectedTextStyle}
                    inputSearchStyle={style.inputSearchStyle}
                    iconStyle={style.iconStyle}
                    data={useStateData}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select State"
                    searchPlaceholder="Search state..."
                    onFocus={() => setFocusedField('state')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(item) => {
                      setSvalue(item.value);
                      setFocusedField(null);
                    }}
                    renderLeftIcon={() => (
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color="#8338EC"
                        style={style.dropdownIcon}
                      />
                    )}
                  />
                </View>
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={6}>
              <InteractiveGlassInput isFocused={focusedField === 'pcode'}>
                <TextInput
                  {...makeInputProps('pcode')}
                  label="Pin Code"
                  maxLength={6}
                  keyboardType="numeric"
                  value={usePcode}
                  onChangeText={setPcode}
                  left={<TextInput.Icon icon="mailbox-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={7}>
              <InteractiveGlassInput isFocused={focusedField === 'gst'}>
                <TextInput
                  {...makeInputProps('gst')}
                  label="GST No."
                  autoCapitalize="characters"
                  value={useGST}
                  onChangeText={setGST}
                  left={<TextInput.Icon icon="file-document-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={8}>
              <InteractiveGlassInput isFocused={focusedField === 'pan'}>
                <TextInput
                  {...makeInputProps('pan')}
                  label="PAN No."
                  autoCapitalize="characters"
                  value={usePAN}
                  onChangeText={setPAN}
                  left={<TextInput.Icon icon="card-account-details-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            <AnimatedField index={9}>
              <InteractiveGlassInput isFocused={focusedField === 'remarks'}>
                <TextInput
                  {...makeInputProps('remarks')}
                  label="Remarks"
                  value={useRemarks}
                  onChangeText={setRemarks}
                  left={<TextInput.Icon icon="text-box-outline" color="#8338EC" />}
                />
              </InteractiveGlassInput>
            </AnimatedField>

            {/* Submit Button Inside Glass Card */}
            <AnimatedField index={10} style={style.buttonWrapper}>
              <GradientSubmitButton label="Submit Account" onPress={saveData} isSubmitting={saving} />
            </AnimatedField>
          </Animated.View>
        </KeyboardAwareScrollView>
      </View>

      {/* Custom Glass Loaders */}
      <CustomGlassLoader visible={initialLoading} message="Loading master details..." />
      <CustomGlassLoader visible={saving} message="Saving account..." />
    </ImageBackground>
  );
};

export default MasterAccount;

const loaderStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: 170,
    paddingVertical: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#8338EC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    //elevation: 8,
  },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(131, 56, 236, 0.15)',
    borderTopColor: '#8338EC',
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
});

const style = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  headerBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    fontSize: 14,
  },
  disabledInput: {
    backgroundColor: 'rgba(241, 245, 249, 0.6)',
  },
  inputOutline: {
    borderRadius: 16,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1.5,
  },
  dropdownWrapper: {
    marginBottom: 12,
  },
  dropdown: {
    height: 52,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  dropdownFocused: {
    borderColor: '#8338EC',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  dropdownIcon: {
    marginRight: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedTextStyle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 42,
    fontSize: 14,
    borderRadius: 10,
  },
  buttonWrapper: {
    marginTop: 12,
  },
  gradientButtonContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#8338EC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  gradientButton: {
    height: 54,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  gradientButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonIcon: {
    marginLeft: 8,
  },
});