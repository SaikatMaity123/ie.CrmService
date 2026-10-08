import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
  StatusBar,
  Platform,
  Linking,
  Modal,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_API_KEY, BASE_URL } from '@env';

// Local Background Image Asset
const BACKGROUND_IMAGE = require('../images/bg.png');

// Client image base URL
const CLIENT_IMAGE_BASE_URL = 'https://iecrmserviceapi.iecsl.in/';

const ClientAvatar = ({ filePath }) => {
  const [imageError, setImageError] = useState(false);

  const cleanPath = typeof filePath === 'string'
    ? filePath.trim().replace(/^\/+/, '')
    : '';

  const imageUrl = cleanPath
    ? `${CLIENT_IMAGE_BASE_URL}${cleanPath}`
    : '';

  if (!imageUrl || imageError) {
    return (
      <View style={styles.avatar}>
        <Ionicons name="image-outline" size={22} color="#94A3B8" />
        <Text style={styles.noImageText}>No Image</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.avatar}
      resizeMode="cover"
      onError={() => setImageError(true)}
    />
  );
};

const ViewCustomerVisitList = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [visitList, setVisitList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchCustomerVisits(true);
  }, []);

  const fetchCustomerVisits = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }

      const userDataString = await AsyncStorage.getItem('UserData');

      if (!userDataString) {
        console.log('UserData not found in AsyncStorage');
        setVisitList([]);
        return;
      }

      const user = JSON.parse(userDataString);

      const hexKey = user?.CompanyHexKey;
      const idUser = user?.IDUser;

      if (!hexKey || !idUser) {
        console.log('HexKey or IDUser not found:', { hexKey, idUser });
        setVisitList([]);
        return;
      }

      const apiUrl =
        `${BASE_URL}Attendance/Site/Visit/List` +
        `?HexKey=${encodeURIComponent(hexKey)}` +
        `&IDUser=${encodeURIComponent(idUser)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (result?.Status === 'SUCCESS' && Array.isArray(result?.Data)) {
        setVisitList(result.Data);
      } else {
        setVisitList([]);
      }
    } catch (error) {
      console.error('Customer Visit API Error:', error);
      setVisitList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCustomerVisits(false);
  }, []);

  const handlePlusIconPress = async () => {
    try {
      const attendanceStatus = await AsyncStorage.getItem('AttendanceCheck');

      if (attendanceStatus === 'Day already started') {
        navigation.navigate('Client Visits');
      } else {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error reading AttendanceCheck from AsyncStorage:', error);
      setShowAlert(true);
    }
  };

  // Filter Out Duplicates & Process Search Query
  const filteredData = useMemo(() => {
    const uniqueMap = new Map();
    visitList.forEach((item) => {
      const key = `${item.AccountName?.trim()}_${item.AccountPhone?.trim()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });
    let result = Array.from(uniqueMap.values());

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.AccountName?.toLowerCase().includes(q) ||
          item.SiteLocation?.toLowerCase().includes(q) ||
          item.AccountPhone?.includes(q)
      );
    }

    return result;
  }, [visitList, searchQuery]);

  const handlePhoneCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error('Call launch error:', err)
      );
    }
  };

  return (
    <ImageBackground
      source={BACKGROUND_IMAGE}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.innerContainer}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Client Visit List</Text>

            {/* Top Right Plus Action Button */}
            <TouchableOpacity
              onPress={handlePlusIconPress}
              style={styles.iconBtn}
            >
              <Ionicons name="add" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Customer or Location..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 12 }}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>

          {/* Unique Customer List */}
          {loading ? (
            <View style={styles.loaderArea}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item.IDVisit.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2563EB']} // Android spinner color
                  tintColor="#2563EB"  // iOS spinner color
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="documents-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyText}>No Customer Visits Found</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  {/* Left Client Image */}
                  <ClientAvatar filePath={item.FilePath} />

                  {/* Middle Info Details */}
                  <View style={styles.infoBox}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {item.AccountName?.trim() || 'Client Account'}
                    </Text>
                    <Text style={styles.subtitle}>{item.AccuountEmail?.trim()}</Text>

                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-sharp"
                        size={14}
                        color="#3B82F6"
                        style={styles.locationIcon}
                      />
                      <Text style={styles.locationText}>
                        {item.SiteLocation?.trim() || 'Address not available'}
                      </Text>
                    </View>
                  </View>

                  {/* Right Call Action */}
                  <View style={styles.actionBox}>
                    <TouchableOpacity
                      style={styles.callCircle}
                      onPress={() => handlePhoneCall(item.AccountPhone)}>
                      <Ionicons name="call-sharp" size={16} color="#2563EB" />
                    </TouchableOpacity>

                    {/* <Ionicons name="chevron-forward" size={16} color="#94A3B8" /> */}
                  </View>
                </View>
              )}
            />
          )}

          {/* Custom Alert Modal */}
          <Modal visible={showAlert} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.alertCard}>
                <Ionicons name="warning-outline" size={42} color="#EF4444" />
                <Text style={styles.alertTitle}>Day is not started</Text>
                <Text style={styles.alertSubtitle}>Please start your day before adding a client visit.</Text>
                <TouchableOpacity
                  style={styles.alertBtn}
                  onPress={() => setShowAlert(false)}
                >
                  <Text style={styles.alertBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ViewCustomerVisitList;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    position: 'relative',
  },
  loaderArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
   // elevation: 2,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 16,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    minHeight: 96,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  noImageText: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  infoBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6,
    minWidth: 0,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
    width: '100%',
  },

  locationIcon: {
    marginTop: 2,
    marginRight: 4,
  },

  locationText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    flexShrink: 1,
  },
  actionBox: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: 64,
    marginLeft: 4,
  },
  callCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    //elevation: 8,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  alertSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  alertBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  alertBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});