import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  LogBox,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  FlatList,
  ScrollView,
  TextInput,
  Animated,
  Easing,
} from 'react-native';
import axios from 'axios';
import KeyBoardNewLayout from '../components/custom/KeyBoardNewLayout';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Feather';
import { CheckBox } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

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
        })
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
          <Animated.View style={[loaderStyles.ring, { transform: [{ rotate: spin }] }]} />
          <Animated.Text style={[loaderStyles.text, { opacity: pulseAnim }]}>
            {message}
          </Animated.Text>
        </View>
      </View>
    </Modal>
  );
};

const LeadGenerationView = ({ navigation }) => {
  const [currDate, setcurrDate] = useState('');
  const [currDateNext, setcurrDateNext] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerVisibleNext, setDatePickerVisibilityNext] = useState(false);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDUser, setIDUser] = useState('');
  const [useUserType, setUserType] = useState('');
  const [useIDLead, setIDLead] = useState('');
  const [leadList, setLeadList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('Loading...');
  const [btnLoading, setBtnLoading] = useState(false);
  const [ushowData, setshowData] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [changedItems, setChangedItems] = useState({});
  const [ViewmodalVisible, setViewModalVisible] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Loading States for Individual Item Actions
  const [activeViewId, setActiveViewId] = useState(null);
  const [activeShareId, setActiveShareId] = useState(null);
  const [leadData, setLeadData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      LogBox.ignoreLogs([
        'VirtualizedLists should never be nested',
        'Each child in a list should have a unique "key" prop.',
      ]);
      try {
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
        setUserType(user.UserType);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    loadData();
  }, []);

  const showDatePicker = () => setDatePickerVisibility(true);
  const showDatePickerNext = () => setDatePickerVisibilityNext(true);
  const hideDatePickerNext = () => setDatePickerVisibilityNext(false);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleDateConfirm = (daten) => {
    const formattedDate = moment(daten).format('DD MMM YYYY');
    setcurrDate(formattedDate);
    hideDatePicker();
  };

  const handleDateConfirmNext = (daten) => {
    const formattedDateNext = moment(daten).format('DD MMM YYYY');
    setcurrDateNext(formattedDateNext);
    hideDatePickerNext();
  };

  const showData = async () => {
    if (!currDate || !currDateNext) {
      Alert.alert('Validation Error', 'Please select both Start Date and End Date.');
      return;
    }

    const startDateMoment = moment(currDate, 'DD MMM YYYY');
    const endDateMoment = moment(currDateNext, 'DD MMM YYYY');

    if (endDateMoment.isBefore(startDateMoment)) {
      Alert.alert(
        'Validation Error',
        'End Date must be greater than or equal to Start Date.'
      );
      return;
    }

    setLoaderMessage('Fetching lead records...');
    setBtnLoading(true);
    setLoading(true);
    setSearchQuery('');
    const url =
      BASE_URL +
      'Lead/Generation/ListByDate?HexKey=' +
      useHexKey +
      '&IDUser=' +
      useIDUser +
      '&UserType=' +
      useUserType +
      '&CompanyCode=' +
      useBusinessID +
      '&SDate=' +
      currDate +
      '&EDate=' +
      currDateNext;

    try {
      const response = await axios.get(url);
      setLeadList(response.data.data || []);
      setshowData(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setBtnLoading(false);
    }
  };

  const toggleItemSelection = (itemID) => {
    let updatedSelected = [...selectedItems];
    let updatedChanged = { ...changedItems };

    if (selectedItems.includes(itemID)) {
      updatedSelected = selectedItems.filter((id) => id !== itemID);
      updatedChanged[itemID] = false;
    } else {
      updatedSelected.push(itemID);
      updatedChanged[itemID] = true;
    }

    setSelectedItems(updatedSelected);
    setChangedItems(updatedChanged);
  };

  const openModal = async (IDLead) => {
    setActiveShareId(IDLead);
    setIDLead(IDLead);
    setLoaderMessage('Loading shared team...');
    setLoading(true);

    const url =
      BASE_URL +
      'Lead/Team/Shared/Members?HexKey=' +
      useHexKey +
      '&IDLead=' +
      IDLead +
      '&IDUser=' +
      useIDUser;
    try {
      let result = await fetch(url);
      result = await result.json();
      setData(result.data);
      setmodalVisible(true);
    } catch (error) {
      console.log('Share Modal Fetch Error:', error);
    } finally {
      setActiveShareId(null);
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value, multiline }) => (
    <View style={styles.Vrow}>
      <Text style={styles.Vlabel}>{label}</Text>
      <Text style={[styles.Vvalue, multiline && { lineHeight: 20 }]}>
        {value || '-'}
      </Text>
    </View>
  );

  const filteredData = data.filter((x) => x.Shared === false);

  const filteredLeadList = leadList.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      (item.Account && item.Account.toLowerCase().includes(query)) ||
      (item.Phone && item.Phone.toLowerCase().includes(query)) ||
      (item.LeadNo && item.LeadNo.toLowerCase().includes(query)) ||
      (item.Email && item.Email.toLowerCase().includes(query)) ||
      (item.Product && item.Product.toLowerCase().includes(query))
    );
  });

  const saveModal = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Select An Item');
    } else {
      try {
        setLoaderMessage('Saving shared lead...');
        setLoading(true);

        const shareData = Object.keys(changedItems).map((id) => ({
          IDLead: useIDLead,
          IDUser: useIDUser,
          IDSharedWith: id,
          Shared: changedItems[id],
        }));

        const param = {
          IDLead: useIDLead,
          SharedData: shareData,
        };

        const response = await fetch(
          BASE_URL + 'Lead/Share/Save?HexKey=' + useHexKey,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(param),
          }
        );

        const result = await response.json();
        if (result.data === '') {
          setmodalVisible(false);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const viewModal = async (IDLead) => {
    try {
      setActiveViewId(IDLead);
      setLoaderMessage('Loading lead details...');
      setLoading(true);

      const url = `${BASE_URL}Lead/Generation/Detail?HexKey=${useHexKey}&IDLead=${IDLead}`;
      const response = await fetch(url);
      const json = await response.json();

      if (json?.data?.length > 0) {
        setLeadData(json.data[0]);
        setViewModalVisible(true);
      } else {
        Alert.alert('Notice', 'No Data Found');
      }
    } catch (error) {
      console.log('API ERROR:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
      setActiveViewId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.glassCard}>
      {/* Header Info */}
      <View style={styles.cardHeaderRow}>
        <View style={styles.iconContainer}>
          <Icon name="grid" size={20} color="#3B82F6" />
        </View>
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text style={styles.customer}>{item.Account}</Text>
          <Text style={styles.leadInfo}>
            {item.LeadNo} • {item.LeadDate}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {item.Status ? item.Status : 'New'}
          </Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Icon name="phone" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{item.Phone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="mail" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{item.Email}</Text>
        </View>

        {item.Product ? (
          <View style={styles.productBox}>
            <Text style={styles.productText}>{item.Product}</Text>
          </View>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={{ flex: 0.48 }}
          onPress={() => viewModal(item.IDLead)}
          disabled={activeViewId === item.IDLead}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['#F8FAFC', '#EEF2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionPillBtn}>
            <Icon name="bar-chart-2" size={15} color="#4F46E5" />
            <Text style={styles.actionText}>View</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ flex: 0.48 }}
          onPress={() => openModal(item.IDLead)}
          disabled={activeShareId === item.IDLead}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['#F8FAFC', '#EEF2FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionPillBtn}>
            <Icon name="share-2" size={15} color="#4F46E5" />
            <Text style={styles.actionText}>Share</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCheckItem = ({ item }) => (
    <TouchableWithoutFeedback>
      <View style={styles.modalCheckItem}>
        <CheckBox
          checked={selectedItems.includes(item.IDSharedWith)}
          onPress={() => toggleItemSelection(item.IDSharedWith)}
        />
        <Text style={styles.menuItem}>{item.SharedWithName}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <ImageBackground
      source={require('../images/bg.png')}
      style={{ flex: 1 }}
      resizeMode="cover">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <KeyBoardNewLayout>
        {/* Top Glass Header Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.circleBackBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={22} color="#1E293B" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerTitleText}>Lead Generation View</Text>
            <Text style={styles.headerSubtitleText}>Manage and track your potential leads</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Glass Date Filter Bar */}
        <View style={styles.glassFilterContainer}>
          <TouchableOpacity style={styles.dateBoxContainer} onPress={showDatePicker}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <View style={styles.dateInputRow}>
              <Icon name="calendar" size={13} color="#4F46E5" style={{ marginRight: 3 }} />
              <Text style={styles.dateValueText}>
                {currDate ? currDate : 'Select Date'}
              </Text>
              <Icon name="chevron-down" size={11} color="#6B7280" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity style={styles.dateBoxContainer} onPress={showDatePickerNext}>
            <Text style={styles.dateLabel}>End Date</Text>
            <View style={styles.dateInputRow}>
              <Icon name="calendar" size={13} color="#4F46E5" style={{ marginRight: 3 }} />
              <Text style={styles.dateValueText}>
                {currDateNext ? currDateNext : 'Select Date'}
              </Text>
              <Icon name="chevron-down" size={11} color="#6B7280" style={{ marginLeft: 2 }} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={showData} disabled={btnLoading} activeOpacity={0.8}>
            <LinearGradient
              colors={['#5883F7', '#6A5DF2', '#8347ED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}>
              <Text style={styles.buttonText}>Show Data</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          maximumDate={moment().endOf('day').toDate()}
          presentationStyle="overFullScreen"
        />

        <DateTimePickerModal
          isVisible={isDatePickerVisibleNext}
          mode="date"
          onConfirm={handleDateConfirmNext}
          onCancel={hideDatePickerNext}
          maximumDate={moment().endOf('day').toDate()}
          presentationStyle="overFullScreen"
        />

        {/* Lead List Section */}
        {ushowData ? (
          <View style={{ flex: 1, paddingHorizontal: 2 }}>
            {leadList && leadList.length > 0 ? (
              <View style={styles.glassSearchContainer}>
                <Icon name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search leads by name, phone, lead no..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Icon name="x-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <FlatList
              data={filteredLeadList}
              renderItem={renderItem}
              keyExtractor={(item) => item.IDLead.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 25, paddingTop: 6 }}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Data Found</Text>
                </View>
              )}
            />
          </View>
        ) : null}

        {/* Share Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setmodalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.glassModalContainer}>
              <Text style={styles.modalTitle}>Share Lead</Text>

              <FlatList
                data={filteredData}
                renderItem={renderCheckItem}
                keyExtractor={(item, index) => index.toString()}
                style={{ maxHeight: 300, marginVertical: 10 }}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.modalSubmitBtn} onPress={saveModal}>
                  <LinearGradient
                    colors={['#5883F7', '#6A5DF2', '#8347ED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientSubmitButton}>
                    <Text style={styles.modalBtnText}>Submit</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setmodalVisible(false)}>
                  <Text style={[styles.modalBtnText, { color: '#EF4444' }]}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* View Details Modal */}
        <Modal
          visible={ViewmodalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setViewModalVisible(false)}>
          <View style={styles.Voverlay}>
            <View style={styles.VmodalContainer}>
              <View style={styles.Vheader}>
                <Text style={styles.VheaderTitle}>Lead Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.Vclose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {leadData && (
                  <>
                    <InfoRow label="Lead No" value={leadData.LeadNo} />
                    <InfoRow label="Date" value={leadData.LeadDate} />
                    <InfoRow label="Account" value={leadData.Account} />
                    <InfoRow label="Product" value={leadData.Product} />
                    <InfoRow label="Industry" value={leadData.Industry} />
                    <InfoRow label="Priority" value={leadData.LeadPriority} />
                    <InfoRow label="Class" value={leadData.LeadClass} />
                    <InfoRow label="Source" value={leadData.LeadSource} />
                    <InfoRow label="Phone" value={leadData.Phone} />
                    <InfoRow label="Email" value={leadData.Email} />
                    <InfoRow label="Remarks" value={leadData.Remarks} multiline />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyBoardNewLayout>

      {/* Global Custom Glass Loader */}
      <CustomGlassLoader visible={loading} message={loaderMessage} />
    </ImageBackground>
  );
};

export default LeadGenerationView;

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
  topNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  circleBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  glassSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  glassFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  dateBoxContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  dateLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValueText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E293B',
    letterSpacing: -0.2,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(203, 213, 225, 0.6)',
    marginHorizontal: 4,
  },
  gradientButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6A5DF2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customer: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  leadInfo: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    marginTop: 10,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    marginLeft: 8,
  },
  productBox: {
    marginTop: 10,
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginLeft: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassModalContainer: {
    width: '88%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
    borderRadius: 10,
    paddingRight: 10,
  },
  menuItem: {
    fontSize: 14,
    color: '#1E293B',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  modalSubmitBtn: {
    flex: 0.48,
    height: 42,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientSubmitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    flex: 0.48,
    height: 42,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#EF4444',
  },
  Voverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  VmodalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  Vheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
  },
  VheaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  Vclose: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  Vrow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  Vlabel: {
    width: '35%',
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  Vvalue: {
    width: '65%',
    fontSize: 13,
    color: '#1E293B',
  },
});