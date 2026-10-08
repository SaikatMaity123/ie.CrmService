import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Alert,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Animated as RNAnimated,
  Easing,
  Modal,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Dropdown } from 'react-native-element-dropdown';
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

const AnimatedField = ({ children, index = 0, style }) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40)
        .duration(350)
        .springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

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
    arrowTranslateX.value = withSpring(5, { damping: 12, stiffness: 200 });
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

const MasterProduct = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Preserved State
  const [useCode, setCode] = useState('');
  const [useName, setName] = useState('');
  const [useHcode, setHcode] = useState('');
  const [useMcode, setMcode] = useState('');
  const [usePcode, setPcode] = useState('');
  const [useMstock, setMstock] = useState('');
  const [useMxstock, setMxstock] = useState('');
  const [usePrate, setPrate] = useState('');
  const [useSrate, setSrate] = useState('');
  const [useRlevel, setRlevel] = useState('');
  const [useBno, setBno] = useState('');
  const [usePno, setPno] = useState('');
  const [description, setDescription] = useState('');
  const [useGvalue, setGvalue] = useState('');
  const [useCvalue, setCvalue] = useState('');
  const [useGData, setGData] = useState([]);
  const [useCData, setCData] = useState([]);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [checkedValue, setCheckedValue] = useState(false);

  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const userDataStr = await AsyncStorage.getItem('UserData');
        if (!userDataStr) {
          Alert.alert('Session Expired', 'User data not found. Please login again.');
          if (isMounted) setLoading(false);
          return;
        }

        const user = JSON.parse(userDataStr);
        const HexKey = user?.CompanyHexKey || '';
        
        if (isMounted) {
          setHexKey(HexKey);
          setUName(user?.UserName || '');
          setBusinessID(user?.CompanyCode || '');
        }

        const baseUrl = BASE_URL || '';

        // Auto Code
        try {
          const response = await fetch(`${baseUrl}Account/Auto/Code?HexKey=${HexKey}&type=PRODUCT`);
          const json = await response.json();
          if (json?.Status === 'SUCCESS' && Array.isArray(json?.DataList) && json.DataList.length > 0) {
            if (isMounted) setCode(json.DataList[0]?.AutoCode || '');
          }
        } catch (e) {
          console.log('Auto Code Fetch Error:', e);
        }

        // Product Group List
        try {
          const responseGroup = await fetch(`${baseUrl}ProductGroup/List?HexKey=${HexKey}&BusinessID=${user?.CompanyCode}`);
          const jsonGroup = await responseGroup.json();
          if (jsonGroup?.Status === 'SUCCESS' && Array.isArray(jsonGroup?.DataList)) {
            const formattedData = jsonGroup.DataList.map(item => ({
              label: item?.Name || '',
              value: item?.IDGroup,
            }));
            if (isMounted) setGData(formattedData);
          }
        } catch (e) {
          console.log('Group Fetch Error:', e);
        }

        // Product Category List
        try {
          const responseCategory = await fetch(`${baseUrl}ProductCategory/List?HexKey=${HexKey}&BusinessID=${user?.CompanyCode}`);
          const jsonCat = await responseCategory.json();
          if (jsonCat?.Status === 'SUCCESS' && Array.isArray(jsonCat?.DataList)) {
            const formattedData = jsonCat.DataList.map(item => ({
              label: item?.Name || '',
              value: item?.IDCategory,
            }));
            if (isMounted) setCData(formattedData);
          }
        } catch (e) {
          console.log('Category Fetch Error:', e);
        }

      } catch (error) {
        console.log('Error in loadData:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveData = async () => {
    setSubmitting(true);
    const params = {
      IDProduct: 0,
      Code: useCode,
      Name: useName,
      IDGroup: useGvalue,
      IDCategory: useCvalue,
      HSNCode: useHcode,
      Maker: useMcode,
      BinNo: useBno,
      PartNo: usePno,
      PartCode: usePcode,
      Reorder: useRlevel,
      MinStock: useMstock,
      MaxStock: useMxstock,
      PurchaseRate: usePrate,
      SaleRate: useSrate,
      Description: description,
      EntryUser: useUName,
      BusinessID: useBusinessID,
      MaintainInventory: checkedValue,
    };

    try {
      const baseUrl = BASE_URL || '';
      let result = await fetch(`${baseUrl}Product/Save?HexKey=${useHexKey}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      result = await result.json();
      if (result?.Status === 'SUCCESS') {
        Alert.alert('Success', 'Product created successfully', [
          { text: 'OK', onPress: () => navigation.navigate('AppNavDash') },
        ]);
      } else {
        Alert.alert('Save Failed', result?.Message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Save Error:', error);
      Alert.alert('Network Error', 'Unable to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

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
      style={style.fullScreen}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={{ paddingTop: Math.max(insets.top, 20) }}>
        <View style={style.headerBar}>
          <TouchableOpacity
            style={style.backCircleBtn}
            onPress={() => navigation.navigate('AppNavDash')}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </TouchableOpacity>
          <Text style={style.headerBarTitle}>Master Product</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(500).springify()}
          style={style.cardContainer}
        >
          <AnimatedField index={0}>
            <InteractiveGlassInput isFocused={focusedField === 'code'}>
              <TextInput
                {...makeInputProps('code')}
                label="Code"
                value={useCode}
                editable={false}
                left={<TextInput.Icon icon="barcode" color="#8338EC" />}
                style={[style.input, style.disabledInput]}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={1}>
            <InteractiveGlassInput isFocused={focusedField === 'name'}>
              <TextInput
                {...makeInputProps('name')}
                label="Name"
                value={useName}
                onChangeText={setName}
                left={<TextInput.Icon icon="package-variant" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={2}>
            <InteractiveGlassInput isFocused={focusedField === 'desc'}>
              <TextInput
                {...makeInputProps('desc')}
                label="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={[style.input, { backgroundColor: 'rgba(255, 255, 255, 0.75)' }]}
                contentStyle={{ textAlignVertical: 'top' }}
                left={<TextInput.Icon icon="text-box-outline" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={3}>
            <InteractiveGlassInput isFocused={focusedField === 'group'}>
              <View style={style.dropdownWrapper}>
                <Dropdown
                  style={[
                    style.dropdown,
                    focusedField === 'group' && style.dropdownFocused,
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useGData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Group"
                  searchPlaceholder="Search Group..."
                  onFocus={() => setFocusedField('group')}
                  onBlur={() => setFocusedField(null)}
                  onChange={item => {
                    setGvalue(item.value);
                    setFocusedField(null);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons
                      name="folder-open-outline"
                      size={20}
                      color="#8338EC"
                      style={style.dropdownIcon}
                    />
                  )}
                />
              </View>
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={4}>
            <InteractiveGlassInput isFocused={focusedField === 'category'}>
              <View style={style.dropdownWrapper}>
                <Dropdown
                  style={[
                    style.dropdown,
                    focusedField === 'category' && style.dropdownFocused,
                  ]}
                  placeholderStyle={style.placeholderStyle}
                  selectedTextStyle={style.selectedTextStyle}
                  inputSearchStyle={style.inputSearchStyle}
                  iconStyle={style.iconStyle}
                  data={useCData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Category"
                  searchPlaceholder="Search Category..."
                  onFocus={() => setFocusedField('category')}
                  onBlur={() => setFocusedField(null)}
                  onChange={item => {
                    setCvalue(item.value);
                    setFocusedField(null);
                  }}
                  renderLeftIcon={() => (
                    <Ionicons
                      name="pricetags-outline"
                      size={20}
                      color="#8338EC"
                      style={style.dropdownIcon}
                    />
                  )}
                />
              </View>
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={5}>
            <InteractiveGlassInput isFocused={focusedField === 'hsn'}>
              <TextInput
                {...makeInputProps('hsn')}
                label="HSN Code"
                value={useHcode}
                onChangeText={setHcode}
                left={<TextInput.Icon icon="tag-text-outline" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={6}>
            <InteractiveGlassInput isFocused={focusedField === 'maker'}>
              <TextInput
                {...makeInputProps('maker')}
                label="Maker"
                value={useMcode}
                onChangeText={setMcode}
                left={<TextInput.Icon icon="factory" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={7}>
            <InteractiveGlassInput isFocused={focusedField === 'bin'}>
              <TextInput
                {...makeInputProps('bin')}
                label="Bin No"
                value={useBno}
                onChangeText={setBno}
                left={<TextInput.Icon icon="archive-outline" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={8}>
            <InteractiveGlassInput isFocused={focusedField === 'partno'}>
              <TextInput
                {...makeInputProps('partno')}
                label="Part No"
                value={usePno}
                onChangeText={setPno}
                left={<TextInput.Icon icon="cog-outline" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={9}>
            <InteractiveGlassInput isFocused={focusedField === 'partcode'}>
              <TextInput
                {...makeInputProps('partcode')}
                label="Part Code"
                value={usePcode}
                onChangeText={setPcode}
                left={<TextInput.Icon icon="qrcode" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={10}>
            <InteractiveGlassInput isFocused={focusedField === 'reorder'}>
              <TextInput
                {...makeInputProps('reorder')}
                label="Reorder Level"
                keyboardType="numeric"
                value={useRlevel}
                onChangeText={setRlevel}
                left={<TextInput.Icon icon="tray-alert" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={11}>
            <InteractiveGlassInput isFocused={focusedField === 'minstock'}>
              <TextInput
                {...makeInputProps('minstock')}
                label="Min Stock"
                keyboardType="numeric"
                value={useMstock}
                onChangeText={setMstock}
                left={<TextInput.Icon icon="tray-arrow-down" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={12}>
            <InteractiveGlassInput isFocused={focusedField === 'maxstock'}>
              <TextInput
                {...makeInputProps('maxstock')}
                label="Max Stock"
                keyboardType="numeric"
                value={useMxstock}
                onChangeText={setMxstock}
                left={<TextInput.Icon icon="tray-arrow-up" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={13}>
            <InteractiveGlassInput isFocused={focusedField === 'prate'}>
              <TextInput
                {...makeInputProps('prate')}
                label="Purchase Rate"
                keyboardType="numeric"
                value={usePrate}
                onChangeText={setPrate}
                left={<TextInput.Icon icon="currency-usd" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={14}>
            <InteractiveGlassInput isFocused={focusedField === 'srate'}>
              <TextInput
                {...makeInputProps('srate')}
                label="Sale Rate"
                keyboardType="numeric"
                value={useSrate}
                onChangeText={setSrate}
                left={<TextInput.Icon icon="cash-register" color="#8338EC" />}
              />
            </InteractiveGlassInput>
          </AnimatedField>

          <AnimatedField index={15}>
            <Pressable
              style={[
                style.checkboxContainer,
                checkedValue && style.checkboxContainerActive,
              ]}
              onPress={() => setCheckedValue(prev => !prev)}
            >
              <Ionicons
                name={checkedValue ? 'checkbox' : 'square-outline'}
                size={22}
                color={checkedValue ? '#8338EC' : '#94A3B8'}
              />
              <Text style={style.checkboxText}>Maintain Inventory</Text>
            </Pressable>
          </AnimatedField>

          <AnimatedField index={16} style={style.buttonWrapper}>
            <GradientSubmitButton
              label="Submit Product"
              onPress={saveData}
              isSubmitting={submitting}
            />
          </AnimatedField>
        </Animated.View>
      </ScrollView>

      {/* Custom Glass Loaders */}
      <CustomGlassLoader visible={loading} message="Loading products..." />
      <CustomGlassLoader visible={submitting} message="Saving product..." />
    </ImageBackground>
  );
};

export default MasterProduct;

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
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 28,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  checkboxContainerActive: {
    borderColor: '#8338EC',
    backgroundColor: 'rgba(131, 56, 236, 0.08)',
  },
  checkboxText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: 12,
  },
  buttonWrapper: {
    marginTop: 16,
  },
  gradientButtonContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    width: '100%',
    shadowColor: '#8338EC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  gradientButton: {
    height: 54,
    width: '100%',
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