import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  ScrollView,
  LogBox,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { openDatabase } from 'react-native-sqlite-storage';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import { Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

// Open DB
const db = openDatabase(
  { name: 'CRM_db', location: 'default' },
  () => console.log('Database connected!'),
  error => console.log('Database error', error),
);

const ViewMasterData = () => {
  const navigation = useNavigation();
  const [gamesTab, setGamesTab] = useState(1);
  const [useDoctors, setDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // track which product is being edited
  const [productList, setProductList] = useState([]);
  const [stageList, setStageList] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);

    // Step 1: Create tables if not exist
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ViewMasterDocList (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT,
          Code TEXT,
          Area TEXT,
          ApprovalStatus INTEGER
        )`,
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ViewMasterRetList (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Name TEXT,
          Code TEXT,
          Area TEXT,
          ApprovalStatus INTEGER
        )`,
      );
    });

    // Step 2: Load data
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              // Fetch doctor list
              const url = `${BASE_URL}Doctor/Mobile/List?Businessid=${user.BusinessID}&EntryUser=${user.Empemail}&IDEmployee=${user.IDEmployee}`;
              let result = await fetch(url);
              result = await result.json();
              setDoctors(result);

              // Save to local DB
              db.transaction(tx => {
                tx.executeSql('DELETE FROM ViewMasterDocList');
                result.forEach(doc => {
                  tx.executeSql(
                    'INSERT INTO ViewMasterDocList (Name, Code, Area, ApprovalStatus) VALUES (?, ?, ?, ?)',
                    [doc.Name, doc.Code, doc.Area, doc.ApprovalStatus],
                  );
                });
              });

              // Fetch retailer list
              const empurl = `${BASE_URL}Retailer/Mobile/List?Businessid=${user.BusinessID}&EntryUser=${user.Empemail}&IDEmployee=${user.IDEmployee}`;
              let result_empurl = await fetch(empurl);
              result_empurl = await result_empurl.json();
              setRetailers(result_empurl);

              // Save to local DB
              db.transaction(tx => {
                tx.executeSql('DELETE FROM ViewMasterRetList');
                result_empurl.forEach(ret => {
                  tx.executeSql(
                    'INSERT INTO ViewMasterRetList (Name, Code, Area, ApprovalStatus) VALUES (?, ?, ?, ?)',
                    [ret.Name, ret.Code, ret.Area, ret.ApprovalStatus],
                  );
                });
              });
            } else {
              // Offline fallback
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterDocList',
                  [],
                  (_, results) => {
                    let temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      temp.push(results.rows.item(i));
                    }
                    setDoctors(temp);
                  },
                  (tx, error) => {
                    console.log('Error fetching doctor data:', error.message);
                  },
                );
              });

              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterRetList',
                  [],
                  (_, results) => {
                    let temp = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      temp.push(results.rows.item(i));
                    }
                    setRetailers(temp);
                  },
                  (tx, error) => {
                    console.log('Error fetching retailer data:', error.message);
                  },
                );
              });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleEdit = async item => {
    const IDDoctor = item.IDDoctor || item.ID;
    const userData = await AsyncStorage.getItem('UserData');
    const user = JSON.parse(userData);

    setIsLoading(true); // start loader

    try {
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        alert('No internet connection.');
        return;
      }

      // 1. Fetch doctor detail
      const url = `${BASE_URL}Doctor/DoctorDetailByID?Businessid=${user.BusinessID}&IDDoctor=${IDDoctor}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch doctor details');
      const json = await res.json();
      const doctor = json[0];
      setSelectedDoctor(doctor);

      // 2. Fetch products
      const divisionId = doctor?.Division?.IDDivision || 0;
      const productUrl = `https://apitest.mendine.co.in/api/crm/Product/ProductDivisionTypeList?Businessid=${user.BusinessID}&IDDivision=${divisionId}&Type=DOCTORPRODUCT`;
      const productRes = await fetch(productUrl);
      if (!productRes.ok) throw new Error('Failed to fetch products');
      const productJson = await productRes.json();
      setProductList(productJson.map(p => ({ label: p.Name, value: p.IDProduct })));

      // 3. Fetch stages
      const stageUrl = `https://apitest.mendine.co.in/api/crm/Misc/List?Businessid=${user.BusinessID}&Type=TARGET`;
      const stageRes = await fetch(stageUrl);
      if (!stageRes.ok) throw new Error('Failed to fetch stages');
      const stageJson = await stageRes.json();
      setStageList(stageJson.map(s => ({ label: s.Name, value: s.IDMisc })));

      // ✅ Only open modal if all above succeeds
      setIsModalVisible(true);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false); // Always stop loader
    }
  };


  // New saveData method for Modal Submit button
  const saveData = async () => {
    if (!selectedDoctor || !selectedDoctor.Products || selectedDoctor.Products.length === 0) {
      Alert.alert('Select Product & Stage');
      return;
    }

    const userData = await AsyncStorage.getItem('UserData');
    const user = JSON.parse(userData);
    //const deviceId = DeviceInfo.getDeviceId();

    const productsID = selectedDoctor.Products.map(p => ({
      IDProduct: p.Product.IDProduct,
      IDSatge: p.Stage.IDMisc
    }));

    const data = {
      IDDoctor: selectedDoctor.IDDoctor || 0,
      Code: selectedDoctor.Code || '',
      Name: selectedDoctor.Name,
      Practice: '',
      IDQualification: selectedDoctor.Qualification?.IDQualification || 0,
      IDDivision: selectedDoctor.Division?.IDDivision || 0,
      IDSpeciality: selectedDoctor.Speciality?.IDSpeciality || 0,
      IDCategory: selectedDoctor.Category?.IDMisc || 0,
      IDArea: selectedDoctor.Area1?.IDArea || 0,
      IDArea2: 0,
      IDHQ: selectedDoctor.HQ?.IDHQ || 0,
      Mobile: selectedDoctor.Mobile || '',
      Email: selectedDoctor.Email || '',
      Employee: { IDEmployee: user.IDEmployee },
      Latitude1: 0,
      Longitude1: 0,
      Latitude2: 0,
      Longitude2: 0,
      Address1: selectedDoctor.Address1 || '',
      Address2: selectedDoctor.Address2 || '',
      Pincode: selectedDoctor.Pincode || '',
      DOB: selectedDoctor.DOB || '',
      Age: selectedDoctor.Age || 0,
      PatientNo: selectedDoctor.PatientNo || 0,
      CreatedBy: user.Empemail,
      Businessid: user.BusinessID,
      Products: productsID
    };

    console.log('Submitting:', data);

    NetInfo.fetch().then(async state => {
      if (state.isConnected) {
        try {
          const response = await fetch(BASE_URL + 'Doctor/MobileDoctorAddEdit', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();
          console.log('API Result:', result);

          if (result.result === '') {
            Alert.alert('Success', 'Record Successfully Saved', [
              { text: 'Ok', onPress: () => navigation.navigate('AppNavMaster') },
            ]);
          } else {
            Alert.alert('Error', result.result);
          }
        } catch (err) {
          console.log('Error submitting doctor:', err);
          Alert.alert('Error', 'Something went wrong while saving.');
        }
      } else {
        Alert.alert('No internet connection', 'You are offline, try again later.');
      }
    });
  };





  // Search handlers
  const handleSearch = text => setSearchQuery(text);
  const handleSearchRet = text => setSearchQueryRet(text);

  const onSelectSwitch = value => setGamesTab(value);

  const ApprovalStatus = item =>
    item === 0 ? (
      <Text style={styles.approvalRed}>ApprovalStatus : No</Text>
    ) : item === 1 ? (
      <Text style={styles.approvalBlue}>ApprovalStatus : Yes</Text>
    ) : (
      <Text style={styles.approvalText}>ApprovalStatus :</Text>
    );

  const filteredDoctors = useDoctors.filter(item =>
    item.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.Area?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.Code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRetailer = useRetailers.filter(item =>
    item.Name?.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
    item.Area?.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
    item.Code?.toLowerCase().includes(searchQueryRet.toLowerCase()),
  );

  return (
    <>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
            <CustomViewMaster
              selectionMode={1}
              option1="Master Doctors"
              option2="Master Retailers"
              onSelectSwitch={onSelectSwitch}
            />
          </View>

          {gamesTab === 1 ? (
            <View>
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {filteredDoctors.length ? (
                <View style={styles.areaStyle}>
                  <FlatList
                    data={filteredDoctors}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableWithoutFeedback>
                        <View style={styles.menu}>
                          {item.ApprovalStatus === 1 && (
                            <TouchableOpacity onPress={() => handleEdit(item)}>
                              <Text style={styles.editButton}>Edit</Text>
                            </TouchableOpacity>
                          )}

                          <Text style={styles.menuItem}>Name : {item.Name}</Text>
                          <Text style={styles.menuItem}>Code : {item.Code}</Text>
                          <Text style={styles.menuItem}>Area : {item.Area}</Text>
                          {ApprovalStatus(item.ApprovalStatus)}
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  />
                </View>
              ) : (
                <Text style={styles.noData}>No Doctors Found</Text>
              )}
            </View>
          ) : (
            <View>
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQueryRet}
                onChangeText={handleSearchRet}
              />
              {filteredRetailer.length ? (
                <View style={styles.areaStyle}>
                  <FlatList
                    data={filteredRetailer}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <TouchableWithoutFeedback>
                        <View style={styles.menu}>
                          <Text style={styles.menuItem}>Name : {item.Name}</Text>
                          <Text style={styles.menuItem}>Code : {item.Code}</Text>
                          <Text style={styles.menuItem}>Area : {item.Area}</Text>
                          {ApprovalStatus(item.ApprovalStatus)}
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  />
                </View>
              ) : (
                <Text style={styles.noData}>No Retailers Found</Text>
              )}
            </View>
          )}

          {isModalVisible && selectedDoctor && (
            <Modal visible={isModalVisible} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Doctor Details</Text>
                  <ScrollView style={{ maxHeight: 400 }}>
                    <Text>Name: {selectedDoctor?.Name || '-'}</Text>
                    <Text>Code: {selectedDoctor?.Code || '-'}</Text>
                    <Text>Mobile: {selectedDoctor?.Mobile || '-'}</Text>
                    <Text>Qualification: {selectedDoctor?.Qualification?.Name || '-'}</Text>
                    <Text>Speciality: {selectedDoctor?.Speciality?.Name || '-'}</Text>
                    <Text>Category: {selectedDoctor?.Category?.Name || '-'}</Text>
                    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Products:</Text>

                    <FlatList
                      data={selectedDoctor?.Products || []}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item, index }) => (
                        <View style={styles.productItem}>
                          <View style={{
                            flex: 1,
                            fontFamily: 'Roboto-BoldItalic',
                            fontSize: 18,
                            fontWeight: 'bold',
                          }}>
                            <Text>Product: {item.Product.Name}</Text>
                            <Text>Stage: {item.Stage.Name}</Text>
                          </View>
                          <View style={styles.iconGroup}>
                            <TouchableOpacity
                              onPress={() => {
                                const updated = [...selectedDoctor.Products];
                                updated.splice(index, 1);
                                setSelectedDoctor({ ...selectedDoctor, Products: updated });
                              }}
                            >
                              <Image
                                source={require('../images/Delete_icon.png')}
                                style={styles.deleteIconImage}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    />
                  </ScrollView>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.EditButton}
                      onPress={() => setIsAddProductModalVisible(true)}
                    >
                      <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveData}
                    >
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setIsModalVisible(false)}
                    >
                      <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Modal visible={isAddProductModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Add Product & Stage</Text>

                    <Dropdown
                      style={styles.dropdown}
                      data={productList}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Product"
                      value={selectedProduct}
                      onChange={item => setSelectedProduct(item)}
                    />
                    <Dropdown
                      style={styles.dropdown}
                      data={stageList}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Stage"
                      value={selectedStage}
                      onChange={item => setSelectedStage(item)}
                    />

                    <View style={styles.verticalButtonGroup}>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => {
                          if (selectedProduct && selectedStage) {
                            const isDuplicate = selectedDoctor.Products?.some(
                              p => p.Product.IDProduct === selectedProduct.value
                            );
                        
                            if (isDuplicate) {
                              Alert.alert('Duplicate Product', 'This product is already added.');
                              return;
                            }
                        
                            const updated = [...(selectedDoctor.Products || [])];
                            updated.push({
                              Product: {
                                IDProduct: selectedProduct.value,
                                Name: selectedProduct.label
                              },
                              Stage: {
                                IDMisc: selectedStage.value,
                                Name: selectedStage.label
                              }
                            });
                        
                            setSelectedDoctor({ ...selectedDoctor, Products: updated });
                            setIsAddProductModalVisible(false);
                            setSelectedProduct(null);
                            setSelectedStage(null);
                          } else {
                            Alert.alert('Validation', 'Please select both Product and Stage.');
                          }
                        }}
                        
                      >
                        <Text style={styles.buttonText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsAddProductModalVisible(false)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </Modal>
          )}
        </SafeAreaView>
      </ScrollView>
    </>
  );

};

export default ViewMasterData;

const styles = StyleSheet.create({
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    paddingLeft: 10,
  },
  menu: {
    margin: 5,
    padding: 5,
    backgroundColor: '#ecf0f1',
    elevation: 5,
    borderRadius: 2,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    margin: 5,
    padding: 5,
  },
  editButton: {
    fontSize: 15,
    fontFamily: 'Lato-Bold',
    color: '#007bff',
    textAlign: 'right',
    padding: 5,
    right: 10, // Adjust as needed
  },

  approvalRed: {
    color: 'red',
    fontSize: 14,
    margin: 5,
    padding: 5,
  },
  approvalBlue: {
    color: 'blue',
    fontSize: 14,
    margin: 5,
    padding: 5,
  },
  approvalText: {
    fontSize: 14,
    margin: 5,
    padding: 5,
  },
  noData: {
    fontFamily: 'Roboto-BoldItalic',
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#f24633',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  EditButton: {
    backgroundColor: '#016e22',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginTop: 5,
    marginBottom: 5,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  iconGroup: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editIcon: {
    fontSize: 20,
    color: '#007bff',
    marginRight: 10,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#dc3545',
  },
  deleteIconImage: {
    width: 24,
    height: 24,
    tintColor: '#dc3545', // Optional red tint
  },
  EditIconImage: {
    width: 24,
    height: 24,
    tintColor: '#5865e0', // Optional blue tint
    marginRight: 15,
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: 5,
  },
  verticalButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 10, // for spacing between Add and Cancel buttons
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },

});
