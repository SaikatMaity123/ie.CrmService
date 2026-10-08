import {
  View,
  Text,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import Feather from 'react-native-vector-icons/Feather';
import CustomButton from '../components/custom/CustomButton';
import { BASE_URL } from '@env';

const DPCList = ({ navigation }) => {
  const [empemail, setEmpemail] = useState('');
  const [businessID, setBusinessID] = useState('');
  const [IDEmployee, setIDEmployee] = useState('');
  const [dpcList, setDpcList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('UserData').then(value => {
      if (value != null) {
        const user = JSON.parse(value);
        setEmpemail(user.Empemail);
        setIDEmployee(user.IDEmployee);
        const businessId = user.BusinessID.trim();
        setBusinessID(businessId);
        fetchDpcList(businessId, user.IDEmployee);
      }
    });
  }, []);

  const fetchDpcList = async (businessID, IDEmployee) => {
    setLoading(true);
    try {
      const url = `${BASE_URL}DPC/List?Businessid=${businessID}&IDEmployee=${IDEmployee}`;
      console.log('Fetching DPC List from URL:', url);
      const response = await axios.get(url);
      setDpcList(response.data || []);
      setFilteredList(response.data || []);
    } catch (error) {
      console.error('Error fetching DPC list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = text => {
    setSearchQuery(text);
    const filtered = dpcList.filter(item =>
      `${item.DpcNo} ${item.Employee} ${item.HQ} ${item.Division} ${item.Designation}`
        .toLowerCase()
        .includes(text.toLowerCase())
    );
    setFilteredList(filtered);
  };

  const toggleStatus = async (iddpc) => {
    // Get the item you're toggling
    const selectedItem = filteredList.find(item => item.IDDpc === iddpc);
    if (!selectedItem) return;

    const newStatus = !selectedItem.Status;

    const payload = {
      Businessid: businessID,
      IDDpc: iddpc,
      Status: newStatus
    };
    console.log('Toggling status for DPC ID:', iddpc, 'to', newStatus);

    try {
      const response = await axios.post(
        `${BASE_URL}DPC/ListStatusChange`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Status update response:', response.data);

      if (response.data && response.data.result === "") {
        // Update local list
        setFilteredList(prev =>
          prev.map(item =>
            item.IDDpc === iddpc ? { ...item, Status: newStatus } : item
          )
        );
        // Optional: navigate
        Alert.alert('Success', 'Status updated successfully', [
          { text: 'OK', onPress: () => navigation.navigate('AppNavScreen') }
        ]);

      } else {
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Network or server error');
    }
  };

  const UpdateDpc = async (iddpc) => {
  try {
    const url = `${BASE_URL}DPC/EmployeeWiseDetail?Businessid=${businessID}&IDDPC=${iddpc}`;
    console.log('Fetching DPC detail from:', url);

    const response = await axios.get(url);
    const data = response.data;

    if (data && data.EmployeeDetail && data.EmployeeDetail.length > 0) {
      const detail = data.EmployeeDetail[0];

      navigation.navigate('DPC Entry', {
        dpcData: {
          IDDPC: detail.IDDPC,
          DpcNo: detail.DPCNO,
          DpcName: detail.DPCName,
          Employee: detail.Employee,
          Division: detail.Division,
          HQ: detail.HQ,
          Designation: detail.Designation,
        },
        areaList: data.AreaList || [],
        doctorList: data.DoctorList || [],
        retailerList: data.RetailerList || []
      });
    } else {
      Alert.alert('Error', 'Invalid or incomplete data returned from server.');
    }
  } catch (error) {
    console.error('Error fetching DPC detail:', error);
    Alert.alert('Error', 'Failed to fetch DPC details.');
  }
};


  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavScreen');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  return (
    <KeyboardAwareLayout style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchDpcList(businessID, IDEmployee)} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 10,}}>
          <Text style={styles.headerTitle}>DPC Entry</Text>
          <CustomButton
            label="New"
            onPress={() => navigation.navigate('DPC Entry')}
            style={styles.newButton}
          />
        </View>

        <TextInput
          mode="outlined"
          placeholder="Search DPC..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={{ marginBottom: 10 }}
        />

        {filteredList.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            {loading ? 'Loading...' : 'No DPC found'}
          </Text>
        ) : (
          filteredList.map(item => (
            <View key={item.IDDpc} style={styles.card}>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>DPC NO: {item.DpcNo}</Text>
                  <Text style={styles.text}>Employee: {item.Employee}</Text>
                  <Text style={styles.text}>HQ: {item.HQ}</Text>
                  <Text style={styles.text}>Division: {item.Division}</Text>
                  <Text style={styles.text}>Designation: {item.Designation}</Text>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'flex-end', }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={styles.text}>Status: </Text>
                    <TouchableOpacity
                      onPress={() => toggleStatus(item.IDDpc)}
                      style={styles.iconBox}
                    >
                      <Feather
                        name={item.Status ? 'check' : ''}
                        size={22}
                        color={item.Status ? '#0E7777' : '#ccc'}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => UpdateDpc(item.IDDpc)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>
          ))

        )}
      </ScrollView>
    </KeyboardAwareLayout>
  );
};

export default DPCList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5e4b4bff',
  },
  newButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#005696',
    borderRadius: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#7c8383ff',
    justifyContent: 'center',
    alignItems: 'center',

  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#005696',
    borderRadius: 6,
    marginTop: 10,
  },

  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  editIcon: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
  },

});
