import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  LogBox,
  BackHandler,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { openDatabase } from 'react-native-sqlite-storage';
import CustomViewHeader from '../components/custom/CustomViewHeader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);
const ViewDCRScreen = ({ navigation }) => {
  const [gamesTab, setGamesTab] = useState(1);
  const [searchMDQuery, setSearchMDQuery] = useState('');
  const [searchQueryMRet, setSearchQueryMRet] = useState('');
  const [searchQueryMUnlisted, setSearchQueryMUnlisted] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');
  const [searchQueryUnlisted, setSearchQueryUnlisted] = useState('');
  const [useDoctors, setDoctors] = useState([]);
  const [useMDoctors, setMDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);
  const [useUnlisted, setUnlisted] = useState([]);
  const [useMRetailers, setMRetailers] = useState([]);
  const [useMUnlisted, setMUnlisted] = useState([]);
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedRetailerIndex, setExpandedRetailerIndex] = useState(null);
  const [expandedUnlistedIndex, setExpandedUnlistedIndex] = useState(null);
  const [expandedMDoctorIndex, setExpandedMDoctorIndex] = useState(null);
const [expandedMRetailerIndex, setExpandedMRetailerIndex] = useState(null);
const [expandedMUnlistedIndex, setExpandedMUnlistedIndex] = useState(null);

const NoData = ({ text }) => (
  <SafeAreaView
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text
      style={{
        fontFamily: 'Roboto-BoldItalic',
        fontSize: 18,
        color: '#FF0000',
      }}>
      {text}
    </Text>
  </SafeAreaView>
);


  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setuseManagerAccess(user.ManagerAccess);
          if (user.ManagerAccess === true) {
            NetInfo.fetch().then(async state => {
              if (state.isConnected) {
                const wturl =
                  BASE_URL +
                  'DCR/Mobile/Manager/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Doctor';
                console.log(wturl);
                var config = {
                  method: 'get',
                  url: wturl,
                };
                axios(config)
                  .then(function (response) {
                    setMDoctors(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });

                const rturl =
                  BASE_URL +
                  'DCR/Mobile/Manager/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Retailer';
                console.log(rturl);
                var config = {
                  method: 'get',
                  url: rturl,
                };
                axios(config)
                  .then(function (response) {
                    setMRetailers(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });

                const uturl =
                  BASE_URL +
                  'DCR/Mobile/Manager/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Unlisted';
                console.log(uturl);
                var config = {
                  method: 'get',
                  url: uturl,
                };
                axios(config)
                  .then(function (response) {
                    setMUnlisted(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              } else {
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_ManagerOfflineViewDocDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setMDoctors(temp);
                        //console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_ManagerOfflineViewRetDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setMRetailers(temp);
                        console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_OfflineMangerViewUnlistedDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setMUnlisted(temp);
                        console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
              }
            }, []);
          } else {
            NetInfo.fetch().then(async state => {
              if (state.isConnected) {
                const wturl =
                  BASE_URL +
                  'DCR/Mobile/Msr/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Doctor';
                console.log(wturl);
                var config = {
                  method: 'get',
                  url: wturl,
                };
                axios(config)
                  .then(function (response) {
                    setDoctors(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });

                const rturl =
                  BASE_URL +
                  'DCR/Mobile/Msr/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Retailer';
                console.log(rturl);
                var config = {
                  method: 'get',
                  url: rturl,
                };
                axios(config)
                  .then(function (response) {
                    setRetailers(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });

                const uturl =
                  BASE_URL +
                  'DCR/Mobile/Msr/DCRList?Businessid=' +
                  user.BusinessID +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&Type=Unlisted';
                console.log(uturl);
                var config = {
                  method: 'get',
                  url: uturl,
                };
                axios(config)
                  .then(function (response) {
                    setUnlisted(response.data.d);
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              } else {
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_OfflineViewDocDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setDoctors(temp);
                        //console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_OfflineViewRetDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setRetailers(temp);
                        console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
                db.transaction(tx => {
                  tx.executeSql(
                    'SELECT * FROM CRM_OfflineViewUnlistedDCR',
                    [],
                    (_, results) => {
                      if (results.rows.length > 0) {
                        //console.warn('Table has data');
                        var temp = [];
                        for (let i = 0; i < results.rows.length; ++i) {
                          temp.push(results.rows.item(i));
                        }
                        setUnlisted(temp);
                        console.warn(temp);
                      }
                    },
                    (_, error) => {
                      console.log('Error fetching data:', error);
                    },
                  );
                });
              }
            }, []);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }

    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_DoctorDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       console.log('JSON data from the database:', jsonDataArray);
    //       setDoctors(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_DoctorDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       console.log('JSON data from the database:', jsonDataArray);
    //       //setDoctors(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });

    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_ManagerDoctorDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('JSON data from the database:', jsonDataArray);
    //       setMDoctors(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_RetailerDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('User JSON data from the database:', jsonDataArray);
    //       setRetailers(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_MangerRetailerDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('User JSON data from the database:', jsonDataArray);
    //       setMRetailers(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_ManagerDoctorUnlistedDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('JSON data from the database:', jsonDataArray);
    //       setUnlistedMDocData(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_DoctorUnlistedDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('JSON data from the database:', jsonDataArray);
    //       setUnlistedDocData(jsonDataArray);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_ManagerRetailerUnlistedDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('JSON data from the database:', jsonDataArray);
    //       setUnlistedMRetData(jsonDataArray);
    //       //console.log(temp);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM CRM_RetailerUnlistedDataSave',
    //     [],
    //     (_, result) => {
    //       const rows = result.rows.raw();
    //       const jsonDataArray = rows.map(row => JSON.parse(row.data));
    //       //const jsonDataArray = rows.map(row => row.data);
    //       //console.log('JSON data from the database:', jsonDataArray);
    //       setUnlistedRetData(jsonDataArray);
    //       //console.log(temp);
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
    // db.transaction(tx => {
    //   tx.executeSql(
    //     'SELECT * FROM ViewExpenseBookingList',
    //     [],
    //     (_, results) => {
    //       if (results.rows.length > 0) {
    //         //console.warn('Table has data');
    //         var temp = [];
    //         for (let i = 0; i < results.rows.length; ++i) {
    //           temp.push(results.rows.item(i));
    //         }
    //         setExpBookingList(temp);
    //         console.log(temp);
    //       }
    //     },
    //     (_, error) => {
    //       console.log('Error fetching data:', error);
    //     },
    //   );
    // });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavDCRScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );


  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  const onSelectSwitch = value => {
    setGamesTab(value);
  };
  const handleMDSearch = text => {
    setSearchMDQuery(text);
  };
  const handleSearch = text => {
    setSearchQuery(text);
  };

  const filteredMDoctors = useMDoctors.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchMDQuery.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchMDQuery.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchMDQuery.toLowerCase())
    );
  });

  const filteredDoctors = useDoctors.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleSearchMRet = text => {
    setSearchQueryMRet(text);
  };

  const filteredMRetailer = useMRetailers.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQueryMRet.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQueryMRet.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryMRet.toLowerCase())
    );
  });

  const handleSearchRet = text => {
    setSearchQueryRet(text);
  };

  const filteredRetailer = useRetailers.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryRet.toLowerCase())
    );
  });

  const handleSearchMUnlisted = text => {
    setSearchQueryMUnlisted(text);
  };

  const filteredMUnlisted = useMUnlisted.filter(item => {
    return (
      item.Customer.toLowerCase().includes(
        searchQueryMUnlisted.toLowerCase(),
      ) ||
      item.DCRDate.toLowerCase().includes(searchQueryMUnlisted.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryMUnlisted.toLowerCase())
    );
  });
  const handleSearchUnlisted = text => {
    setSearchQueryUnlisted(text);
  };

  const filteredUnlisted = useUnlisted.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQueryUnlisted.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQueryUnlisted.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryUnlisted.toLowerCase())
    );
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <ScrollView
        style={{ flex: 1, backgroundColor: false }}
        showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          {useManagerAccess ? (
            <View>
              <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                <CustomViewHeader
                  selectionMode={1}
                  option1="Doctors"
                  option2="Retailers"
                  option3="Unlisted"
                  onSelectSwitch={onSelectSwitch}
                />
              </View>
              {gamesTab == 1 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Search Doctor..."
                      value={searchMDQuery}
                      onChangeText={handleMDSearch}
                    />
                  </View>

                  {/* 🧾 Doctor List */}
                  {filteredMDoctors.length ? (
                    <FlatList
                      data={filteredMDoctors}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedMDoctorIndex === index;
                        const datePart = item.DCRDate?.split('(')[0] || '';
                        const timePart = item.DCRDate?.includes('(')
                          ? item.DCRDate.split('(')[1].replace(')', '')
                          : '';

                        return (
                          <View
                            style={{
                              backgroundColor: '#ffffff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            {/* 👤 Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MaterialCommunityIcons
                                name="doctor"
                                size={45}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Lato-Bold', color: '#000' }}>
                                  Dr. {item.Customer}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#777',
                                    fontFamily: 'Lato-Regular',
                                  }}>
                                  Area: {item.Area}
                                </Text>
                              </View>
                            </View>

                            {/* 📅 Date + Time */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              <Ionicons name="calendar-outline" size={18} color="#005696" />
                              <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                {datePart.trim()}
                              </Text>
                              {timePart ? (
                                <>
                                  <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#005696"
                                    style={{ marginLeft: 20 }}
                                  />
                                  <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                    {timePart.trim()}
                                  </Text>
                                </>
                              ) : null}
                            </View>

                            {/* 🔘 Details */}
                            <TouchableOpacity
                              onPress={() => setExpandedMDoctorIndex(isExpanded ? null : index)}
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Lato-Bold' }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                {/* <Text style={styles.detailText}>Area: {item.Area}</Text> */}
                                <Text style={styles.detailText}>Customer Type: {item.CustomerType}</Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <NoData text="No Doctors Found" />
                  )}
                </View>
              )}

              {/* 🏪 Retailer Tab */}
              {gamesTab == 2 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Search Retailer..."
                      value={searchQueryMRet}
                      onChangeText={handleSearchMRet}
                    />
                  </View>

                  {/* 🧾 Retailer List */}
                  {filteredMRetailer.length ? (
                    <FlatList
                      data={filteredMRetailer}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedMRetailerIndex === index;
                        const datePart = item.DCRDate?.split('(')[0] || '';
                        const timePart = item.DCRDate?.includes('(')
                          ? item.DCRDate.split('(')[1].replace(')', '')
                          : '';

                        return (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MaterialCommunityIcons
                                name="store"
                                size={45}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Lato-Bold', color: '#000' }}>
                                  {item.Customer}
                                </Text>
                                <Text style={{ fontSize: 14, color: '#777', fontFamily: 'Lato-Regular' }}>
                                  {item.CustomerType}
                                </Text>
                              </View>
                            </View>

                            {/* 📅 Date + Time */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              <Ionicons name="calendar-outline" size={18} color="#005696" />
                              <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                {datePart.trim()}
                              </Text>
                              {timePart ? (
                                <>
                                  <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#005696"
                                    style={{ marginLeft: 20 }}
                                  />
                                  <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                    {timePart.trim()}
                                  </Text>
                                </>
                              ) : null}
                            </View>

                            <TouchableOpacity
                              onPress={() => setExpandedMRetailerIndex(isExpanded ? null : index)}
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Lato-Bold' }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                <Text style={styles.detailText}>Area: {item.Area}</Text>
                                <Text style={styles.detailText}>Customer Type: {item.CustomerType}</Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <NoData text="No Retailers Found" />
                  )}
                </View>
              )}

              {/* ⚠️ Unlisted Tab */}
              {gamesTab == 3 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Search Unlisted..."
                      value={searchQueryMUnlisted}
                      onChangeText={handleSearchMUnlisted}
                    />
                  </View>

                  {filteredMUnlisted.length ? (
                    <FlatList
                      data={filteredMUnlisted}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedMUnlistedIndex === index;
                        const datePart = item.DCRDate?.split('(')[0] || '';
                        const timePart = item.DCRDate?.includes('(')
                          ? item.DCRDate.split('(')[1].replace(')', '')
                          : '';

                        return (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MaterialCommunityIcons
                                name="account-alert-outline"
                                size={45}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontFamily: 'Lato-Bold', color: '#000' }}>
                                  {item.Customer}
                                </Text>
                                <Text style={{ fontSize: 14, color: '#777', fontFamily: 'Lato-Regular' }}>
                                  {item.CustomerType}
                                </Text>
                              </View>
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              <Ionicons name="calendar-outline" size={18} color="#005696" />
                              <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                {datePart.trim()}
                              </Text>
                              {timePart ? (
                                <>
                                  <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#005696"
                                    style={{ marginLeft: 20 }}
                                  />
                                  <Text style={{ fontSize: 13, marginLeft: 6, color: '#555' }}>
                                    {timePart.trim()}
                                  </Text>
                                </>
                              ) : null}
                            </View>

                            <TouchableOpacity
                              onPress={() => setExpandedMUnlistedIndex(isExpanded ? null : index)}
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text style={{ color: '#fff', fontSize: 14, fontFamily: 'Lato-Bold' }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                <Text style={styles.detailText}>Customer Type: {item.CustomerType}</Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <NoData text="No Unlisted Data Found" />
                  )}
                </View>
              )}

            </View>
          ) : (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
              <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
                <CustomViewHeader
                  selectionMode={1}
                  option1="Doctors"
                  option2="Retailers"
                  option3="Unlisted"
                  onSelectSwitch={onSelectSwitch}
                />
              </View>
              {/* {gamesTab == 1 && (
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
                        //data={useDoctors}
                        data={filteredDoctors}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                          <TouchableWithoutFeedback>
                            <View
                              style={[
                                styles.menu,
                                {
                                  backgroundColor: '#ffffff',
                                },
                              ]}>
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontFamily: 'Lato-Bold',
                                  color: '#000',
                                  margin: 5,
                                  padding: 5,
                                  //width: '50%',
                                  textAlignVertical: 'center',
                                  //textAlign: 'center',
                                  alignItems: 'center',
                                }}>
                                Name : {item.Customer}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  margin: 5,
                                  padding: 5,
                                  //width: '50%',
                                  textAlignVertical: 'center',
                                  //textAlign: 'center',
                                  alignItems: 'center',
                                }}>
                                Code : {item.Code}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  margin: 5,
                                  padding: 5,
                                  //width: '50%',
                                  textAlignVertical: 'center',
                                  //textAli gn: 'center',
                                  alignItems: 'center',
                                }}>
                                Area : {item.Area}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  margin: 5,
                                  padding: 5,
                                  //width: '50%',
                                  textAlignVertical: 'center',
                                  //textAli gn: 'center',
                                  alignItems: 'center',
                                }}>
                                DCR Date : {item.DCRDate}
                              </Text>
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontFamily: 'Lato-Regular',
                                  margin: 5,
                                  padding: 5,
                                  //width: '50%',
                                  textAlignVertical: 'center',
                                  //textAli gn: 'center',
                                  alignItems: 'center',
                                }}>
                                Customer Type : {item.CustomerType}
                              </Text>
                            </View>
                          </TouchableWithoutFeedback>
                        )}
                      />
                    </View>
                  ) : (
                    <SafeAreaView
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Roboto-BoldItalic',
                          fontSize: 18,
                          color: '#FF0000',
                        }}>
                        No Doctors Found
                      </Text>
                    </SafeAreaView>
                  )}
                </View>
              )} */}
              {gamesTab == 1 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Type to search anything"
                      value={searchQuery}
                      onChangeText={handleSearch}
                    />
                  </View>

                  {/* 🧾 Doctor List */}
                  {filteredDoctors.length ? (
                    <FlatList
                      data={filteredDoctors}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedIndex === index;
                        return (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            {/* 👤 Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {/* <Ionicons
                                name="person-circle-outline"
                                size={55}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              /> */}
                              <MaterialCommunityIcons name="doctor"
                                style={{ marginRight: 10 }}
                                size={45} color="#005696" />

                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'Lato-Bold',
                                    color: '#000',
                                  }}>
                                  Dr. {item.Customer}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#777',
                                    fontFamily: 'Lato-Regular',
                                  }}>
                                  Area: {item.Area}
                                </Text>
                              </View>
                              {/* <TouchableOpacity>
                                <Text
                                  style={{
                                    color: '#005696',
                                    fontSize: 14,
                                    fontFamily: 'Lato-Bold',
                                  }}>
                                  Edit
                                </Text>
                              </TouchableOpacity> */}
                            </View>


                            {/* 📅 Date + Time Row */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              {/* Split date and time */}
                              {(() => {
                                const datePart = item.DCRDate?.split('(')[0] || '';
                                const timePart = item.DCRDate?.includes('(')
                                  ? item.DCRDate.split('(')[1].replace(')', '')
                                  : '';
                                return (
                                  <>
                                    <Ionicons name="calendar-outline" size={18} color="#005696" />
                                    <Text
                                      style={{
                                        fontSize: 13,
                                        marginLeft: 6,
                                        color: '#555',
                                        fontFamily: 'Lato-Regular',
                                      }}>
                                      {datePart.trim()}
                                    </Text>

                                    {timePart ? (
                                      <>
                                        <Ionicons
                                          name="time-outline"
                                          size={18}
                                          color="#005696"
                                          style={{ marginLeft: 20 }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            marginLeft: 6,
                                            color: '#555',
                                            fontFamily: 'Lato-Regular',
                                          }}>
                                          {timePart.trim()}
                                        </Text>
                                      </>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </View>

                            {/* 🔘 Details Button */}
                            <TouchableOpacity
                              onPress={() => toggleExpand(index)}
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {/* 📋 Expanded Section */}
                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                {/* <Text style={styles.detailText}>Area: {item.Area}</Text> */}
                                <Text style={styles.detailText}>
                                  Customer Type: {item.CustomerType}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <SafeAreaView
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Roboto-BoldItalic',
                          fontSize: 18,
                          color: '#FF0000',
                        }}>
                        No Doctors Found
                      </Text>
                    </SafeAreaView>
                  )}
                </View>
              )}
              {gamesTab == 2 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Type to search retailers"
                      value={searchQueryRet}
                      onChangeText={handleSearchRet}
                    />
                  </View>

                  {/* 🧾 Retailer List */}
                  {filteredRetailer.length ? (
                    <FlatList
                      data={filteredRetailer}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedRetailerIndex === index;
                        return (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            {/* 🏪 Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MaterialCommunityIcons
                                name="store-outline"
                                size={45}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              />

                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'Lato-Bold',
                                    color: '#000',
                                  }}>
                                  {item.Customer}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#777',
                                    fontFamily: 'Lato-Regular',
                                  }}>
                                  Area: {item.Area}
                                </Text>
                              </View>
                            </View>

                            {/* 📅 Date + Time */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              {(() => {
                                const datePart = item.DCRDate?.split('(')[0] || '';
                                const timePart = item.DCRDate?.includes('(')
                                  ? item.DCRDate.split('(')[1].replace(')', '')
                                  : '';
                                return (
                                  <>
                                    <Ionicons name="calendar-outline" size={18} color="#005696" />
                                    <Text
                                      style={{
                                        fontSize: 13,
                                        marginLeft: 6,
                                        color: '#555',
                                        fontFamily: 'Lato-Regular',
                                      }}>
                                      {datePart.trim()}
                                    </Text>

                                    {timePart ? (
                                      <>
                                        <Ionicons
                                          name="time-outline"
                                          size={18}
                                          color="#005696"
                                          style={{ marginLeft: 20 }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            marginLeft: 6,
                                            color: '#555',
                                            fontFamily: 'Lato-Regular',
                                          }}>
                                          {timePart.trim()}
                                        </Text>
                                      </>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </View>

                            {/* 🔘 Details Button */}
                            <TouchableOpacity
                              onPress={() =>
                                setExpandedRetailerIndex(isExpanded ? null : index)
                              }
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {/* 📋 Expanded Section */}
                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                {/* <Text style={styles.detailText}>Area: {item.Area}</Text> */}
                                <Text style={styles.detailText}>
                                  Customer Type: {item.CustomerType}
                                </Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <SafeAreaView
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Roboto-BoldItalic',
                          fontSize: 18,
                          color: '#FF0000',
                        }}>
                        No Retailers Found
                      </Text>
                    </SafeAreaView>
                  )}
                </View>
              )}

              {gamesTab == 3 && (
                <View style={{ flex: 1 }}>
                  {/* 🔍 Search Bar */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      margin: 10,
                      paddingHorizontal: 10,
                      elevation: 2,
                    }}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15 }}
                      placeholder="Type to search unlisted data"
                      value={searchQueryUnlisted}
                      onChangeText={handleSearchUnlisted}
                    />
                  </View>

                  {/* 🧾 Unlisted List */}
                  {filteredUnlisted.length ? (
                    <FlatList
                      data={filteredUnlisted}
                      keyExtractor={(item, index) => index.toString()}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 20 }}
                      renderItem={({ item, index }) => {
                        const isExpanded = expandedUnlistedIndex === index;
                        return (
                          <View
                            style={{
                              backgroundColor: '#fff',
                              borderRadius: 12,
                              marginHorizontal: 10,
                              marginVertical: 6,
                              padding: 12,
                              elevation: 3,
                              shadowColor: '#000',
                              shadowOpacity: 0.1,
                              shadowOffset: { width: 0, height: 2 },
                            }}>
                            {/* 👤 Header */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <MaterialCommunityIcons
                                name="account-alert-outline"
                                size={45}
                                color="#005696"
                                style={{ marginRight: 10 }}
                              />

                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontFamily: 'Lato-Bold',
                                    color: '#000',
                                  }}>
                                  {item.Customer}
                                </Text>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#777',
                                    fontFamily: 'Lato-Regular',
                                  }}>
                                  {item.CustomerType}
                                </Text>
                              </View>
                            </View>

                            {/* 📅 Date + Time */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 10,
                                marginBottom: 5,
                                marginLeft: 10,
                              }}>
                              {(() => {
                                const datePart = item.DCRDate?.split('(')[0] || '';
                                const timePart = item.DCRDate?.includes('(')
                                  ? item.DCRDate.split('(')[1].replace(')', '')
                                  : '';
                                return (
                                  <>
                                    <Ionicons name="calendar-outline" size={18} color="#005696" />
                                    <Text
                                      style={{
                                        fontSize: 13,
                                        marginLeft: 6,
                                        color: '#555',
                                        fontFamily: 'Lato-Regular',
                                      }}>
                                      {datePart.trim()}
                                    </Text>

                                    {timePart ? (
                                      <>
                                        <Ionicons
                                          name="time-outline"
                                          size={18}
                                          color="#005696"
                                          style={{ marginLeft: 20 }}
                                        />
                                        <Text
                                          style={{
                                            fontSize: 13,
                                            marginLeft: 6,
                                            color: '#555',
                                            fontFamily: 'Lato-Regular',
                                          }}>
                                          {timePart.trim()}
                                        </Text>
                                      </>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </View>

                            {/* 🔘 Details Button */}
                            <TouchableOpacity
                              onPress={() =>
                                setExpandedUnlistedIndex(isExpanded ? null : index)
                              }
                              style={{
                                backgroundColor: '#005696',
                                marginTop: 12,
                                borderRadius: 8,
                                paddingVertical: 8,
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: '#fff',
                                  fontSize: 14,
                                  fontFamily: 'Lato-Bold',
                                }}>
                                {isExpanded ? 'Hide Details' : 'Details'}
                              </Text>
                            </TouchableOpacity>

                            {/* 📋 Expanded Section */}
                            {isExpanded && (
                              <View
                                style={{
                                  marginTop: 10,
                                  backgroundColor: '#f4f6f8',
                                  borderRadius: 8,
                                  padding: 10,
                                }}>
                                <Text style={styles.detailText}>Code: {item.Code}</Text>
                                <Text style={styles.detailText}>Customer Type: {item.CustomerType}</Text>
                              </View>
                            )}
                          </View>
                        );
                      }}
                    />
                  ) : (
                    <SafeAreaView
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Roboto-BoldItalic',
                          fontSize: 18,
                          color: '#FF0000',
                        }}>
                        No Unlisted Data Found
                      </Text>
                    </SafeAreaView>
                  )}
                </View>
              )}

            </View>
          )}
        </SafeAreaView>
      </ScrollView>
    </>
  );
};

export default ViewDCRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
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
    borderRadius: 8,
    borderColor: '#f8f9faff',
    borderWidth: 1,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#000',
    margin: 5,
    padding: 5,
    width: '80%',
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    //paddingTop: 5,
    borderColor: 'black',
    //borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
    //marginTop: 5,
    //elevation: 5,
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
});
