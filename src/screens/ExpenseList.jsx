import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import ProgressDialog from '../components/custom/ProgressDialog';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

const ExpenseList = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [onlineData, setOnlineData] = useState([]);
  const [offlineData, setOfflineData] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ExpenseList',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setData(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });
  // }, []);

  // useEffect(() => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 10000);
  //   fetchOnlineData();
  //   fetchOfflineData();
  // }, []);

  // useEffect(() => {
  //   // Combine the data when both queries have been executed
  //   if (
  //     (onlineData.length > 0 && offlineData.length > 0) ||
  //     (onlineData.length > 0 && offlineData.length === 0)
  //   ) {
  //     const combined = [...onlineData, ...offlineData];
  //     setData(combined);
  //     console.log('combined', combined);
  //   }
  // }, [onlineData, offlineData]);

  // const fetchOnlineData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ExpenseList',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setOnlineData(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });
  // };

  // const fetchOfflineData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_ExpenseDataShow',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           //console.warn('Table has data');
  //           var temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setOfflineData(temp);
  //           //console.log(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });
  // };

  useEffect(() => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const url =
                BASE_URL +
                'ExpenseBooking/Mobile/List?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee;
              //console.log(url);
              let result = await fetch(url);
              result = await result.json();
              //console.log('result',result);
              setData(result);
            } else {
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM CRM_ExpenseDataShow',
                  [],
                  (_, results) => {
                    if (results.rows.length > 0) {
                      //console.warn('Table has data');
                      var temp = [];
                      for (let i = 0; i < results.rows.length; ++i) {
                        temp.push(results.rows.item(i));
                      }
                      //setOfflineData(temp);
                      setData(temp);
                      //console.log(temp);
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
      });
    } catch (error) {
      Alert.alert(error);
    }
  }, []);
  const handleSearch = text => {
    setSearchQuery(text);
  };
  const filteredData = data.filter(item => {
    return (
      item.Bookingno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.BookingDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.BookingAmount.toString()
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  });

  const retApproval = item => {
    if (item === 'NO') {
      return (
        <Text
          style={{
            backgroundColor: '#f24633',
            color: '#fff',
            fontSize: 16,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
            overflow: 'hidden',
            alignSelf: 'center',
          }}>
          ApprovalStatus : NO
        </Text>
      );
    } else if (item === 'YES') {
      return (
        <Text
          style={{
            backgroundColor: '#3cb371',
            color: '#fff',
            fontSize: 16,
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 20,
            overflow: 'hidden',
            alignSelf: 'center',
          }}>
          ApprovalStatus : YES
        </Text>
      );
    } else {
      return (
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
          ApprovalStatus :
        </Text>
      );
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
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
            style={styles.searchBar}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        <View style={styles.container}>
          {filteredData.length ? (
            <View style={styles.areaStyle}>
              <FlatList
                data={filteredData}
                showsVerticalScrollIndicator={false}
                renderItem={({item}) => (
                  <TouchableWithoutFeedback>
                    <View
                      style={[
                        styles.menu,
                        {
                          backgroundColor: '#ffffff',
                          borderColor: '#000',
                          borderWidth: 0.6,
                          borderRadius: 10,
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
                        Booking No : {item.Bookingno}
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
                        Booking Date : {item.BookingDate}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
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
                          Booking Amount : {item.BookingAmount}.00
                        </Text>
                        {retApproval(item.Approved)}
                      </View>
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
                No Expense Found
              </Text>
            </SafeAreaView>
          )}
        </View>
      </View>
      {/* <ProgressDialog visible={loading} message="Loading, please wait..." /> */}
    </SafeAreaView>
  );
};

export default ExpenseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginLeft: 10,
    // marginRight: 10,
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
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    borderColor: 'black',
    //borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    //elevation: 5,
    borderRadius: 5,
  },
  searchBar: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    fontSize: 15,
  },
});
