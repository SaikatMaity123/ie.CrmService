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
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const OrderList = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [orderListData, setOrderListData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 10000);
  //   fetchOrderListData();
  //   fetchOrderBookingData();
  // }, []);

  // useEffect(() => {
  //   // Combine the data when both queries have been executed
  //   if (
  //     (orderListData.length > 0 && bookingData.length > 0) ||
  //     (orderListData.length > 0 && bookingData.length === 0)
  //   ) {
  //     const combined = [...orderListData, ...bookingData];
  //     setData(combined);
  //     console.log('combined', combined);
  //   }
  // }, [orderListData, bookingData]);

  // const fetchOrderListData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT * FROM CRM_OrderList',
  //       [],
  //       (_, results) => {
  //         if (results.rows.length > 0) {
  //           const temp = [];
  //           for (let i = 0; i < results.rows.length; ++i) {
  //             temp.push(results.rows.item(i));
  //           }
  //           setOrderListData(temp);
  //         }
  //       },
  //       (_, error) => {
  //         console.log('Error fetching data:', error);
  //       },
  //     );
  //   });
  // };

  // const fetchOrderBookingData = () => {
  //   db.transaction(tx => {
  //     tx.executeSql(
  //       'SELECT data FROM OrderBookingDataSave',
  //       [],
  //       (_, result) => {
  //         const rows = result.rows.raw();
  //         const jsonDataArray = rows.map(row => JSON.parse(row.data));
  //         const flattenedArray = jsonDataArray.flat();
  //         setBookingData(flattenedArray);
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
              'OrderBooking/List?Businessid=' +
              user.BusinessID +
              '&IDEmployee=' +
              user.IDEmployee;
            //console.log(url);
            let result = await fetch(url);
            result = await result.json();
            setData(result);
            } else {
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT data FROM OrderBookingDataSave',
                  [],
                  (_, result) => {
                    const rows = result.rows.raw();
                    const jsonDataArray = rows.map(row => JSON.parse(row.data));
                    const flattenedArray = jsonDataArray.flat();
                    setData(flattenedArray);
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
      item.CustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.BookingDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ProductCode.toLowerCase().includes(searchQuery.toLowerCase())||
      item.Amount.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <View style={styles.container}>
          {/* {data.length ? ( */}
          {filteredData.length ? (
            <View style={styles.areaStyle}>
              <FlatList
                data={filteredData}
                //data={data}
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
                      {/* <Text
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
                    </Text> */}
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
                        Date : {item.BookingDate}
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
                        Customer Name : {item.CustomerName}
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
                        Product Name : {item.ProductName}
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
                        Product Code : {item.ProductCode}
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
                        Qty : {item.Qty}
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
                        Amount : {item.Amount}
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
                No Order Found
              </Text>
            </SafeAreaView>
          )}
        </View>
      </View>
      <ProgressDialog visible={loading} message="Loading, please wait..." />
    </SafeAreaView>
  );
};

export default OrderList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    paddingLeft: 10,
  },
});
