import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import axios from 'axios';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';

const ViewCustomerVisitList = ({navigation}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteVisits();
  }, []);

  const fetchSiteVisits = async () => {
    try {
      setLoading(true);

      const userStr = await AsyncStorage.getItem('UserData');

      if (!userStr) {
        setData([]);
        return;
      }

      const user = JSON.parse(userStr);

      const API_URL =
        BASE_URL +
        'Attendance/Site/Visit/List?HexKey=' +
        user.CompanyHexKey +
        '&IDUser=' +
        user.IDUser;

      console.log('Site Visit API:', API_URL);

      const response = await axios.get(API_URL);

      console.log('Site Visit Response:', response.data);

      if (
        response.data?.Status === 'SUCCESS' &&
        Array.isArray(response.data?.Data)
      ) {
        setData(response.data.Data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log(
        'Site Visit API Error:',
        error?.response?.data || error.message,
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Feather
            name="briefcase"
            size={19}
            color="#005696"
          />
        </View>

        <View style={{flex: 1}}>
          <Text style={styles.title}>
            {item?.AccountName || 'Customer'}
          </Text>

          <Text style={styles.subTitle}>
            Customer Visit
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Feather
          name="phone"
          size={15}
          color="#005696"
        />

        <Text style={styles.rowText}>
          {item?.AccountPhone || 'Not Available'}
        </Text>
      </View>

      <View style={styles.row}>
        <Feather
          name="mail"
          size={15}
          color="#005696"
        />

        <Text style={styles.rowText}>
          {item?.AccuountEmail || 'Not Available'}
        </Text>
      </View>

      <View style={styles.locationBox}>
        <View style={styles.locationHeader}>
          <Feather
            name="map-pin"
            size={15}
            color="#005696"
          />

          <Text style={styles.locationTitle}>
            Site Location
          </Text>
        </View>

        <Text style={styles.location}>
          {item?.SiteLocation || 'Location not available'}
        </Text>

        <View style={styles.coordRow}>
          <Text style={styles.coords}>
            Lat: {item?.SiteLat || '--'}
          </Text>

          <Text style={styles.coords}>
            Long: {item?.SiteLong || '--'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#005696"
        />

        <Text style={styles.loadingText}>
          Loading Visits...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Feather
            name="map-pin"
            size={20}
            color="#005696"
          />
        </View>

        <View>
          <Text style={styles.summaryLabel}>
            Total Customer Visits
          </Text>

          <Text style={styles.summaryCount}>
            {data.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          item?.IDVisit
            ? item.IDVisit.toString()
            : index.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather
              name="map-pin"
              size={35}
              color="#9AA7B2"
            />

            <Text style={styles.emptyTitle}>
              No Visits Found
            </Text>

            <Text style={styles.emptyText}>
              No customer visit records are available.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
  },

  summary: {
    backgroundColor: '#FFFFFF',
    margin: 14,
    marginBottom: 5,
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF4FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  summaryLabel: {
    fontSize: 12,
    color: '#71808C',
  },

  summaryCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D3443',
    marginTop: 1,
  },

  list: {
    padding: 14,
    paddingBottom: 25,
    flexGrow: 1,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E6ECF1',
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EAF4FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F3443',
  },

  subTitle: {
    fontSize: 11,
    color: '#8996A0',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#EDF1F4',
    marginVertical: 12,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  rowText: {
    fontSize: 13,
    color: '#405563',
    marginLeft: 9,
    flex: 1,
  },

  locationBox: {
    backgroundColor: '#F6F9FB',
    borderRadius: 10,
    padding: 11,
    marginTop: 2,
  },

  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  locationTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005696',
    marginLeft: 6,
  },

  location: {
    fontSize: 13,
    color: '#405563',
    lineHeight: 19,
  },

  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  coords: {
    fontSize: 11,
    color: '#7C8993',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F7FA',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#596B78',
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#344956',
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    color: '#8996A0',
    marginTop: 4,
  },
});

export default ViewCustomerVisitList;