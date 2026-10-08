import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Alert,
  TextInput as RNTextInput,
  Platform,
  Animated,
  Easing,
  Modal,
} from 'react-native';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '@env';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import KeyBoardNewLead from '../components/custom/KeyBoardNewLead';

/* =========================================================
   CUSTOM GLASS LOADER COMPONENT
========================================================= */
const CustomGlassLoader = ({ visible, message = 'Loading...' }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
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
          <Animated.View
            style={[loaderStyles.ring, { transform: [{ rotate: spin }] }]}
          />
          <Animated.Text style={[loaderStyles.text, { opacity: pulseAnim }]}>
            {message}
          </Animated.Text>
        </View>
      </View>
    </Modal>
  );
};

const LeadGeneration = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [useCode, setCode] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currDate, setcurrDate] = useState('');
  const [useempEmail, setempEmail] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useRvalue, setRvalue] = useState('');
  const [usePvalue, setPvalue] = useState('');
  const [useILabel, setILabel] = useState('');
  const [useLCLabel, setLCLabel] = useState('');
  const [useAvalue, setAvalue] = useState('');
  const [usepriorityLabel, setpriorityLabel] = useState('');
  const [useLeadSourceLabel, setLeadSourceLabel] = useState('');
  const [useLSource, setLSource] = useState([]);
  const [usePriority, setPriority] = useState([]);
  const [useAccount, setAccount] = useState([]);
  const [useReferrer, setReferrer] = useState([]);
  const [useIndustry, setIndustry] = useState([]);
  const [useProduct, setProduct] = useState([]);
  const [useLClass, setLClass] = useState([]);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDUser, setIDUser] = useState('');

  // Loader states
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        const HexKey = user.CompanyHexKey;
        setHexKey(HexKey);
        setUName(user.UserName);
        setBusinessID(user.CompanyCode);
        setIDUser(user.IDUser);

        // -------- First API --------
        const response = await fetch(
          BASE_URL + 'Lead/Auto/Code?HexKey=' + HexKey + '&type=LEAD',
        );
        const json = await response.json();
        setCode(json.data.AutoCode);

        // -------- Second API --------
        const responsenew = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=LEADSOURCE',
        );
        const jsonnew = await responsenew.json();

        if (jsonnew?.data?.length > 0) {
          const stateList = jsonnew.data.map(item => ({
            label: item.Name.trim(),
            value: item.Name.trim(),
          }));
          setLSource(stateList);
        }

        // -------- Third API --------
        const responseP = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=PRIORITY',
        );
        const jsonP = await responseP.json();

        if (jsonP?.data?.length > 0) {
          const stateList = jsonP.data.map(item => ({
            label: item.Name.trim(),
            value: item.Name.trim(),
          }));
          setPriority(stateList);
        }

        // -------- Fourth API --------
        const url =
          BASE_URL +
          'Account/Active/List?HexKey=' +
          HexKey +
          '&UserName=' +
          user.UserName +
          '&UserType=ADMIN';
        const responseA = await axios.get(url);
        const list = responseA.data.DataList;

        const dropdownData = list.map(item => ({
          label: item.Name,
          value: item.IDAccount,
        }));
        setAccount(dropdownData);

        // -------- Fifth API --------
        const urlR = BASE_URL + 'Referrer/Active/List?HexKey=' + HexKey;
        const responseR = await axios.get(urlR);
        const listR = responseR.data.data;

        const dropdownDataR = listR.map(item => ({
          label: item.Name,
          value: item.IDReferer,
        }));
        setReferrer(dropdownDataR);

        // -------- Sixth API --------
        const responseI = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=INDUSTRIES',
        );
        const jsonI = await responseI.json();

        if (jsonI?.data?.length > 0) {
          const stateList = jsonI.data.map(item => ({
            label: item.Name.trim(),
            value: item.Name.trim(),
          }));
          setIndustry(stateList);
        }

        // -------- Seventh API --------
        const urlP =
          BASE_URL +
          'Product/List?HexKey=' +
          HexKey +
          '&BusinessID=' +
          user.CompanyCode;
        const responsePt = await axios.get(urlP);
        const listPT = responsePt.data.DataList;

        const dropdownDataPT = listPT.map(item => ({
          label: item.Name,
          value: item.IDProduct,
        }));
        setProduct(dropdownDataPT);

        // -------- Eight API --------
        const responseLC = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=LEADCLASS',
        );
        const jsonLC = await responseLC.json();

        if (jsonLC?.data?.length > 0) {
          const stateList = jsonLC.data.map(item => ({
            label: item.Name.trim(),
            value: item.Name.trim(),
          }));
          setLClass(stateList);
        }
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();
    setcurrDate(formattedDate);
    hideDatePicker();
  };

  const validateForm = () => {
    if (!currDate) return 'Please select Lead Date';
    if (!useempEmail) return 'Please enter Email';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(useempEmail)) return 'Invalid Email format';

    if (!useLeadSourceLabel) return 'Please select Lead Source';
    if (!usepriorityLabel) return 'Please select Lead Priority';
    if (!useAvalue) return 'Please select Account';
    if (!useRvalue) return 'Please select Referrer';
    if (!useILabel) return 'Please select Industry';
    if (!usePvalue) return 'Please select Product';
    if (!useLCLabel) return 'Please select Lead Class';
    if (!useRemarks) return 'Please enter Remarks';

    return null;
  };

  const saveData = async () => {
    const validationError = validateForm();

    if (validationError) {
      Alert.alert(validationError);
      return;
    }

    setSaving(true);

    var params = {
      IDLead: '0',
      LeadNo: useCode,
      LeadDate: currDate,
      LeadEmail: useempEmail,
      LeadSource: useLeadSourceLabel,
      LeadPriority: usepriorityLabel,
      Industry: useILabel,
      IDAccount: useAvalue,
      IDReferer: useRvalue,
      IDProduct: usePvalue,
      LeadClass: useLCLabel,
      IDUser: useIDUser,
      Remarks: useRemarks,
      EntryUser: useUName,
      CompanyCode: useBusinessID,
    };

    const url = BASE_URL + 'Lead/Generation/Save?HexKey=' + useHexKey;

    try {
      let result = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      result = await result.json();

      if (result.Status === 'SUCCESS') {
        navigation.navigate('AppNavDash');
      } else {
        Alert.alert(result.Message);
      }
    } catch (error) {
      Alert.alert('Something went wrong, please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ImageBackground
      source={require('../images/bg.png')}
      resizeMode="cover"
      style={styles.background}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />

      <View style={{ flex: 1 }}>
        {/* CUSTOM HEADER WITH SAFE AREA TOP INSET */}
        <View
          style={[
            styles.customHeader,
            {
              paddingTop: Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBar.currentHeight : 12,
              ),
            },
          ]}>
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AppNavDash')}>
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>

          <Text style={styles.headerTitleText}>Lead Generation</Text>

          <View style={styles.rightHeaderSpace} />
        </View>

        <KeyBoardNewLead
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 16) + 30,
          }}>
          {/* MAIN GLASS CONTAINER */}
          <View style={styles.glassCard}>
            {/* <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="person-outline" size={18} color="#4F46E5" />
              </View>
              <Text style={styles.cardTitle}>Lead Information</Text>
            </View> */}

            {/* CODE + DATE ROW */}
            <View style={styles.row}>
              <View style={[styles.glassField, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>Code *</Text>
                <Text style={styles.fieldValue}>{useCode || 'LDS-2608-000439'}</Text>
              </View>

              <TouchableOpacity
                style={[styles.glassField, { flex: 1, marginLeft: 8 }]}
                onPress={showDatePicker}>
                <Text style={styles.fieldLabel}>Lead Date *</Text>
                <View style={styles.inlineRow}>
                  <Text style={styles.fieldValue}>{currDate}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#64748B" />
                </View>
              </TouchableOpacity>
            </View>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleDateConfirm}
              onCancel={hideDatePicker}
              maximumDate={new Date()}
              presentationStyle="overFullScreen"
            />

            {/* EMAIL */}
            <View style={styles.glassField}>
              <Text style={styles.fieldLabel}>Email *</Text>
              <RNTextInput
                value={useempEmail}
                onChangeText={text => setempEmail(text)}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.rnInput}
              />
            </View>

            {/* LEAD SOURCE */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <Ionicons name="people-outline" size={18} color="#4F46E5" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Lead Source</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 1 }}
                  data={useLSource}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={useLeadSourceLabel}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setLeadSourceLabel(item.value)}
                />
              </View>
            </View>

            {/* PRIORITY */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="arrow-up-outline" size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Priority</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 1 }}
                  data={usePriority}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={usepriorityLabel}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setpriorityLabel(item.value)}
                />
              </View>
            </View>

            {/* ACCOUNT */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={18}
                  color="#4F46E5"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Account</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 2 }}
                  data={useAccount}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={useAvalue}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setAvalue(item.value)}
                />
              </View>
            </View>

            {/* REFERRER */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#FFEDD5' }]}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={18}
                  color="#EA580C"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Referrer</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 2 }}
                  data={useReferrer}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={useRvalue}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setRvalue(item.value)}
                />
              </View>
            </View>

            {/* INDUSTRY */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons
                  name="domain"
                  size={18}
                  color="#4F46E5"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Industry</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 2 }}
                  data={useIndustry}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={useILabel}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setILabel(item.value)}
                />
              </View>
            </View>

            {/* PRODUCT */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#FEF08A' }]}>
                <MaterialCommunityIcons
                  name="cube-outline"
                  size={18}
                  color="#CA8A04"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Product Interested</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 2 }}
                  data={useProduct}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={usePvalue}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setPvalue(item.value)}
                />
              </View>
            </View>

            {/* LEAD CLASS */}
            <View style={styles.glassRowField}>
              <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons
                  name="snowflake"
                  size={18}
                  color="#EF4444"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Lead Class</Text>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  selectedTextProps={{ numberOfLines: 2 }}
                  data={useLClass}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  value={useLCLabel}
                  searchPlaceholder="Search..."
                  flatListProps={{ keyboardShouldPersistTaps: 'always' }}
                  onChange={item => setLCLabel(item.value)}
                />
              </View>
            </View>

            {/* REMARKS */}
            <View style={styles.glassRemarksField}>
              <Text style={styles.fieldLabel}>Remarks</Text>
              <RNTextInput
                placeholderTextColor="#94A3B8"
                value={useRemarks}
                onChangeText={setRemarks}
                multiline
                maxLength={200}
                style={styles.remarksInput}
              />
              <Text style={styles.charCounter}>{`${useRemarks.length}/200`}</Text>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.clearBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Lead Generation View')}>
                <Text style={styles.clearBtnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.submitBtnWrapper}
                disabled={saving}
                onPress={saveData}>
                <LinearGradient
                  colors={['#4F46E5', '#C084FC']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.submitGradientBtn}>
                  <Text style={styles.submitBtnText}>Submit Lead</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyBoardNewLead>
      </View>

      {/* Custom Glass Loaders */}
      <CustomGlassLoader visible={initialLoading} message="Loading lead data..." />
      <CustomGlassLoader visible={saving} message="Saving lead..." />
    </ImageBackground>
  );
};

export default LeadGeneration;

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
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  ring: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(79, 70, 229, 0.15)',
    borderTopColor: '#4F46E5',
    marginBottom: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
});

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  rightHeaderSpace: {
    width: 40,
  },

  /* GLASS CARD */
  glassCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
    shadowColor: '#6366F1',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ROW INPUTS */
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  glassField: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  glassRowField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  inlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  rnInput: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
    marginTop: 2,
  },

  /* DROPDOWNS */
  dropdown: {
    minHeight: 32,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  placeholderStyle: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    lineHeight: 18,
  },

  /* REMARKS */
  glassRemarksField: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    marginBottom: 16,
    minHeight: 100,
  },
  remarksInput: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlignVertical: 'top',
    flex: 1,
    marginTop: 4,
  },
  charCounter: {
    alignSelf: 'flex-end',
    fontSize: 11,
    color: '#94A3B8',
  },

  /* BUTTONS */
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  clearBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  submitBtnWrapper: {
    flex: 1.5,
    marginLeft: 8,
  },
  submitGradientBtn: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});