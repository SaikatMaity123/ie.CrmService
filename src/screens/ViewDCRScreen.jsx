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
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import CustomViewHeader from '../components/custom/CustomViewHeader';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import axios from 'axios';

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
const ViewDCRScreen = () => {
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
  const [unlistedMDocData, setUnlistedMDocData] = useState([]);
  const [unlistedMRetData, setUnlistedMRetData] = useState([]);
  const [unlistedDocData, setUnlistedDocData] = useState([]);
  const [unlistedRetData, setUnlistedRetData] = useState([]);
  const [useManagerAccess, setuseManagerAccess] = useState('');
  const [useExpBookingList, setExpBookingList] = useState([]);

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
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        {useManagerAccess ? (
          <View>
            <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
              <CustomViewHeader
                selectionMode={1}
                option1="Doctors"
                option2="Retailers"
                option3="Unlisted"
                onSelectSwitch={onSelectSwitch}
              />
            </View>
            {gamesTab == 1 && (
              <View>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search..."
                  value={searchMDQuery}
                  onChangeText={handleMDSearch}
                />
                {filteredMDoctors.length ? (
                  <View style={styles.areaStyle}>
                    <FlatList
                      //data={useDoctors}
                      data={filteredMDoctors}
                      showsVerticalScrollIndicator={false}
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
            )}
            {gamesTab == 2 && (
              <View>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search..."
                  value={searchQueryMRet}
                  onChangeText={handleSearchMRet}
                />
                {filteredMRetailer.length ? (
                  <View style={styles.areaStyle}>
                    <FlatList
                      data={filteredMRetailer}
                      showsVerticalScrollIndicator={false}
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
                      No Retailers Found
                    </Text>
                  </SafeAreaView>
                )}
              </View>
            )}
            {gamesTab == 3 && (
              <View>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search..."
                  value={searchQueryMUnlisted}
                  onChangeText={handleSearchMUnlisted}
                />
                {filteredMUnlisted.length ? (
                  <View style={styles.areaStyle}>
                    <FlatList
                      data={filteredMUnlisted}
                      showsVerticalScrollIndicator={false}
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
                      No Unlisted Data Found
                    </Text>
                  </SafeAreaView>
                )}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
              <CustomViewHeader
                selectionMode={1}
                option1="Doctors"
                option2="Retailers"
                option3="Unlisted"
                onSelectSwitch={onSelectSwitch}
              />
            </View>
            {gamesTab == 1 && (
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
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
            )}
            {gamesTab == 2 && (
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
                      showsVerticalScrollIndicator={false}
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
                      No Retailers Found
                    </Text>
                  </SafeAreaView>
                )}
              </View>
            )}
            {gamesTab == 3 && (
              <View>
                <TextInput
                  style={styles.searchBar}
                  placeholder="Search..."
                  value={searchQueryUnlisted}
                  onChangeText={handleSearchUnlisted}
                />
                {filteredUnlisted.length ? (
                  <View style={styles.areaStyle}>
                    <FlatList
                      data={filteredUnlisted}
                      showsVerticalScrollIndicator={false}
                      renderItem={({item}) => (
                        <TouchableWithoutFeedback>
                          <View
                            style={[
                              styles.menu,
                              {
                                backgroundColor: '#ecf0f1',
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
                              DCRDate : {item.DCRDate}
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
    borderRadius: 2,
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
