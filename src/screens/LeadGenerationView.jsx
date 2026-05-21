import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  LogBox,
  Modal,
  Button,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KeyBoardNewLayout from '../components/custom/KeyBoardNewLayout';
import { TextInput } from 'react-native-paper';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { CheckBox } from 'react-native-elements';

const LeadGenerationView = ({ navigation }) => {
  const [currDate, setcurrDate] = useState('');
  const [currDateNext, setcurrDateNext] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerVisibleNext, setDatePickerVisibilityNext] =
    useState(false);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDUser, setIDUser] = useState('');
  const [useUserType, setUserType] = useState('');
  const [useIDLead, setIDLead] = useState('');
  const [leadList, setLeadList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ushowData, setshowData] = useState(false);
  const [imodalVisible, setModalVisible] = useState(false);
  const [modalVisible, setmodalVisible] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [data, setData] = useState([]);
  const [changedItems, setChangedItems] = useState({});
  const [ViewmodalVisible, setViewModalVisible] = useState(false);
  const [leadData, setLeadData] = useState(null);


  useEffect(() => {
    const loadData = async () => {
      LogBox.ignoreLogs([
        'VirtualizedLists should never be nested',
        'Each child in a list should have a unique "key" prop.',
      ]);
      try {
        const userDataStr = await AsyncStorage.getItem('UserData');
        console.log(userDataStr);

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

        console.log('Using Company HexKey:', HexKey);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    loadData(); // call async function
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const showDatePickerNext = () => {
    setDatePickerVisibilityNext(true);
  };

  const hideDatePickerNext = () => {
    setDatePickerVisibilityNext(false);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('DD/MMM/YYYY');
    setcurrDate(formattedDate);
    console.log(formattedDate);

    hideDatePicker();
  };
  const handleDateConfirmNext = daten => {
    //const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();
    const formattedDateNext = moment(daten).format('DD/MMM/YYYY');
    setcurrDateNext(formattedDateNext);
    console.log(formattedDateNext);

    hideDatePickerNext();
  };

  const showData = async () => {
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

      console.log('API Response:', response.data);

      setLeadList(response.data.data); // important
      setLoading(false);
      setshowData(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // Unselect everything
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      // Select all IDs from filteredData
      const allIds = filteredData.map(item => item.IDSharedWith);
      setSelectedItems(allIds);
      setSelectAll(true);
    }
  };

  const toggleItemSelection = itemID => {
    // let updated;

    // if (selectedItems.includes(itemID)) {
    //   updated = selectedItems.filter(id => id !== itemID);
    // } else {
    //   updated = [...selectedItems, itemID];
    // }

    // setSelectedItems(updated);

    // // Update Select All toggle based on changes
    // if (updated.length === filteredData.length) {
    //   setSelectAll(true);
    // } else {
    //   setSelectAll(false);
    // }

    let updatedSelected = [...selectedItems];
    let updatedChanged = { ...changedItems };

    if (selectedItems.includes(itemID)) {
      // ❌ Unchecked
      updatedSelected = selectedItems.filter(id => id !== itemID);
      updatedChanged[itemID] = false; // 👈 mark as false
    } else {
      // ✅ Checked
      updatedSelected.push(itemID);
      updatedChanged[itemID] = true; // 👈 mark as true
    }

    setSelectedItems(updatedSelected);
    setChangedItems(updatedChanged);
  };

  const openModal = async IDLead => {
    setIDLead(IDLead);
    setModalVisible(true);
    const url =
      BASE_URL +
      'Lead/Team/Shared/Members?HexKey=' +
      useHexKey +
      '&IDLead=' +
      IDLead +
      '&IDUser=' +
      useIDUser;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    console.log('result', result.data);
    setData(result.data);
  };

  const filteredData = data.filter(x => x.Shared === false);

  const saveModal = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Select An Item');
    } else {
      //let shareData = [];
      // selectedItems.map(function (value) {
      //   shareData.push({
      //     IDLead: useIDLead,
      //     IDUser: useIDUser,
      //     IDSharedWith: value,
      //     //Shared: true,
      //     Shared: selectedItems.includes(item.IDSharedWith),
      //   });
      // });

      try {
        const shareData = Object.keys(changedItems).map(id => ({
          IDLead: useIDLead,
          IDUser: useIDUser,
          IDSharedWith: id,
          Shared: changedItems[id], // true or false
        }));

        const param = {
          IDLead: useIDLead,
          SharedData: shareData,
        };
        console.log(param);
        console.log(shareData);

        const response = await fetch(
          BASE_URL + 'Lead/Share/Save?HexKey=' + useHexKey,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(param),
          },
        );

        const result = await response.json();
        console.log('API Response:', result);

        // ✅ Check condition
        if (result.data === '') {
          //navigation.navigate('NextScreen'); // change to your screen name
          setModalVisible(false);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Customer Name */}
      <Text style={styles.customer}>{item.Account}</Text>

      {/* Lead Info */}
      <Text style={styles.leadInfo}>
        {item.LeadNo} • {item.LeadDate}
      </Text>

      {/* Phone */}
      <View style={styles.row}>
        <Icon name="phone" size={16} color="#666" />
        <Text style={styles.text}>{item.Phone}</Text>
      </View>

      {/* Email */}
      <View style={styles.row}>
        <Icon name="mail" size={16} color="#666" />
        <Text style={styles.text}>{item.Email}</Text>
      </View>

      {/* Product */}
      <View style={styles.productBox}>
        <Text style={styles.productText}>{item.Product}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => viewModal(item.IDLead)}>
          <Icon name="bar-chart-2" size={18} color="#005696" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          //onPress={() => setModalVisible(true)}
          onPress={() => openModal(item.IDLead)}>
          <Icon name="share-2" size={18} color="#005696" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCheckItem = ({ item }) => {
    return (
      <TouchableWithoutFeedback>
        <View
          style={[
            styles.menu,
            {
              backgroundColor: '#ecf0f1',
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}>
          <CheckBox
            checked={selectedItems.includes(item.IDSharedWith)}
            onPress={() => toggleItemSelection(item.IDSharedWith)}
          />
          <View>
            <Text style={styles.menuItem}>{item.SharedWithName}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };


  const viewModal = async (IDLead) => {
    try {
      setLoading(true);
      //console.log('View Modal for Lead ID:', IDLead);

      const url = `${BASE_URL}Lead/Generation/Detail?HexKey=${useHexKey}&IDLead=${IDLead}`;
      console.log('API URL:', url);

      const response = await fetch(url);
      const json = await response.json();

      if (json?.data?.length > 0) {
        setLeadData(json.data[0]);
        setViewModalVisible(true);
      } else {
        Alert('No Data Found');
      }
    } catch (error) {
      console.log('API ERROR:', error);
      Alert('Something went wrong');
    } finally {
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

  return (
    <ImageBackground
      source={require('../images/bg2.png')}
      style={{ flex: 1 }}
      resizeMode="cover">
      <KeyBoardNewLayout>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
          }}>
          {/* Start Date */}
          <TouchableOpacity
            style={{
              flex: 0.35,
              marginRight: 5,
            }}
            onPress={showDatePicker}>
            <View pointerEvents="none">
              <TextInput
                label="Start Date"
                mode="outlined"
                value={currDate}
                editable={false}
                style={{ height: 55 }}
              />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            maximumDate={moment().endOf('day').toDate()}
            presentationStyle="overFullScreen" // REQUIRED FOR iOS
          />
          {/* End Date */}
          <TouchableOpacity
            style={{
              flex: 0.35,
              marginRight: 5,
            }}
            onPress={showDatePickerNext}>
            <View pointerEvents="none">
              <TextInput
                label="End Date"
                mode="outlined"
                value={currDateNext}
                editable={false}
                style={{ height: 55 }}
              />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisibleNext}
            mode="date"
            onConfirm={handleDateConfirmNext}
            onCancel={hideDatePickerNext}
            maximumDate={moment().endOf('day').toDate()}
            presentationStyle="overFullScreen" // REQUIRED FOR iOS
          />
          {/* Button */}
          <View style={{ flex: 0.3 }}>
            <TouchableOpacity
              onPress={showData}
              style={{
                backgroundColor: '#005696',
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                marginTop: 5,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: '700',
                  fontSize: 16,
                  color: '#ffffff',
                }}>
                {'Show Data'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {ushowData ? (
          <View style={{ margin: 10 }}>
            {loading && (
              <ActivityIndicator size="large" style={{ marginTop: 50 }} />
            )}

            <FlatList
              data={leadList}
              renderItem={renderItem}
              keyExtractor={item => item.IDLead.toString()}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                  <Text style={{ fontSize: 16, color: 'red' }}>
                    No Data Found
                  </Text>
                </View>
              )}
            />
          </View>
        ) : null}
        <Modal
          animationType="slide"
          transparent={true}
          visible={imodalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              {/* <CheckBox
                title="Select All"
                checked={selectAll}
                onPress={toggleSelectAll}
                containerStyle={{
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                }}
              /> */}

              <FlatList
                data={filteredData}
                renderItem={renderCheckItem}
                keyExtractor={(item, index) => index.toString()}
                style={{ maxHeight: 400 }} // 🔥 important
              />

              <View style={styles.buttonRow}>
                <Button title="Submit" onPress={saveModal} />
                <Button
                  title="Close"
                  onPress={() => setModalVisible(false)}
                  color="red"
                />
              </View>
            </View>
          </View>
        </Modal>


        <Modal
          visible={ViewmodalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.Voverlay}>
            <View style={styles.VmodalContainer}>

              {/* Header */}
              <View style={styles.Vheader}>
                <Text style={styles.VheaderTitle}>Lead Details</Text>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.Vclose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              {loading ? (
                <ActivityIndicator size="large" color="#0E7777" />
              ) : (
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
              )}
            </View>
          </View>
        </Modal>

      </KeyBoardNewLayout>
    </ImageBackground>
  );
};

export default LeadGenerationView;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 6,
    padding: 14,
    borderRadius: 12,
    elevation: 3,
  },

  customer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  menu: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    padding: 5,
    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 5,
    // iOS SHADOW
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    borderRadius: 5,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 2,
    padding: 2,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  leadInfo: {
    color: '#666',
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  text: {
    marginLeft: 6,
    color: '#444',
  },

  productBox: {
    marginTop: 10,
    backgroundColor: '#eaf4ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  productText: {
    color: '#005696',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // dim background
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 5,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionText: {
    color: '#005696',
    fontWeight: '600',
  },
  container1: { flex: 1, padding: 10, backgroundColor: 'white' },

  Voverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 15,
  },
  VmodalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    maxHeight: '85%',
  },
  Vheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  VheaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0E7777',
  },
  Vclose: {
    fontSize: 20,
    color: '#999',
  },
  Vrow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  Vlabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  Vvalue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
