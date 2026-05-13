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

const ViewCustomerVisitList = ({navigation}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteVisits();
  }, []);

  const fetchSiteVisits = async () => {
    const userStr = await AsyncStorage.getItem('UserData');
    const user = JSON.parse(userStr);
    const API_URL =
      BASE_URL +
      'Attendance/Site/Visit/List?HexKey=' +
      user.CompanyHexKey +
      '&IDUser=' +
      user.IDUser;
    try {
      const response = await axios.get(API_URL);

      if (response.data.Status === 'SUCCESS') {
        setData(response.data.Data); // 👈 important
      } else {
        setData([]);
      }
    } catch (error) {
      console.log('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.AccountName}</Text>
      <Text>📞 {item.AccountPhone}</Text>
      <Text>📧 {item.AccuountEmail}</Text>
      <Text style={styles.location}>{item.SiteLocation}</Text>
      <Text style={styles.coords}>
        Lat: {item.SiteLat}, Long: {item.SiteLong}
      </Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 50}} />;
  }
  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={item => item.IDVisit.toString()}
        renderItem={renderItem}
        contentContainerStyle={{padding: 10}}
        ListEmptyComponent={
          <Text style={{textAlign: 'center'}}>No Visits Found</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    marginTop: 6,
    fontSize: 13,
    color: '#555',
  },
  coords: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});

export default ViewCustomerVisitList;
