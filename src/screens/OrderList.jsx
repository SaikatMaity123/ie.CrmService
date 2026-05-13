import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  SafeAreaView,
  TextInput,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { openDatabase } from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import ProgressDialog from '../components/custom/ProgressDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const OrderList = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [orderListData, setOrderListData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = id => {
    setExpanded(expanded === id ? null : id);
  };

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
      item.ProductCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Amount.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.title}>{item.CustomerName}</Text>
          <Text style={styles.subtitle}>Date: {item.BookingDate}</Text>
        </View>

        <TouchableOpacity onPress={() => toggleExpand(index)}>
          <Ionicons
            name={expanded === index ? 'chevron-up-circle' : 'chevron-down-circle'}
            size={26}
            color="#005696"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.badgeInfo}>
          <MaterialCommunityIcons name="cube-outline" size={16} color="#fff" />
          <Text style={styles.badgeText}>{item.ProductName}</Text>
        </View>
        <Text style={styles.amountText}>₹ {item.Amount}</Text>
      </View>

      {expanded === index && (
        <View style={styles.detailsSection}>
          <Text style={styles.detailText}>Product Code: {item.ProductCode}</Text>
          <Text style={styles.detailText}>Quantity: {item.Qty}</Text>
          {/*  <Text style={styles.detailText}>Booking No: {item.Bookingno}</Text> */}
        </View>
      )}
    </View>
  );


  return (
    // <SafeAreaView style={{flex: 1,backgroundColor: '#ffffff'}}>
    //   <View style={styles.container}>
    //     <TextInput
    //       style={styles.searchBar}
    //       placeholder="Search..."
    //       value={searchQuery}
    //       onChangeText={handleSearch}
    //     />
    //     <View style={styles.container}>
    //       {/* {data.length ? ( */}
    //       {filteredData.length ? (
    //         <View style={styles.areaStyle}>
    //           <FlatList
    //             data={filteredData}
    //             //data={data}
    //             showsVerticalScrollIndicator={false}
    //             renderItem={({item}) => (
    //               <TouchableWithoutFeedback>
    //                 <View
    //                   style={[
    //                     styles.menu,
    //                     {
    //                       backgroundColor: '#ecf0f1',
    //                     },
    //                   ]}>
    //                   {/* <Text
    //                   style={{
    //                     fontSize: 16,
    //                     fontFamily: 'Lato-Bold',
    //                     color: '#000',
    //                     margin: 5,
    //                     padding: 5,
    //                     //width: '50%',
    //                     textAlignVertical: 'center',
    //                     //textAlign: 'center',
    //                     alignItems: 'center',
    //                   }}>
    //                   Booking No : {item.Bookingno}
    //                 </Text> */}
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAlign: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Date : {item.BookingDate}
    //                   </Text>
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAli gn: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Customer Name : {item.CustomerName}
    //                   </Text>
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAli gn: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Product Name : {item.ProductName}
    //                   </Text>
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAli gn: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Product Code : {item.ProductCode}
    //                   </Text>
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAli gn: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Qty : {item.Qty}
    //                   </Text>
    //                   <Text
    //                     style={{
    //                       fontSize: 14,
    //                       fontFamily: 'Lato-Regular',
    //                       margin: 5,
    //                       padding: 5,
    //                       //width: '50%',
    //                       textAlignVertical: 'center',
    //                       //textAli gn: 'center',
    //                       alignItems: 'center',
    //                     }}>
    //                     Amount : {item.Amount}
    //                   </Text>
    //                 </View>
    //               </TouchableWithoutFeedback>
    //             )}
    //           />
    //         </View>
    //       ) : (
    //         <SafeAreaView
    //           style={{
    //             flex: 1,
    //             justifyContent: 'center',
    //             alignItems: 'center',
    //           }}>
    //           <Text
    //             style={{
    //               fontFamily: 'Roboto-BoldItalic',
    //               fontSize: 18,
    //               color: '#FF0000',
    //             }}>
    //             No Order Found
    //           </Text>
    //         </SafeAreaView>
    //       )}
    //     </View>
    //   </View>
    //   <ProgressDialog visible={loading} message="Loading, please wait..." />
    // </SafeAreaView>

    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
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
          {filteredData.length ? (
            <FlatList
              data={filteredData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 15 }}
            />
          ) : (
            <View style={styles.noData}>
              <Text style={styles.noDataText}>No Order Found</Text>
            </View>
          )}
        </View>

        <ProgressDialog visible={loading} message="Loading, please wait..." />
    </SafeAreaView>
  );
};

export default OrderList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ecf0f1' },
  searchBar: {
    flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 15
  },
  card: {
    backgroundColor: '#fefefe',
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#000' },
  subtitle: { fontSize: 13, color: '#555', marginTop: 2 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  badgeInfo: {
    flexDirection: 'row',
    backgroundColor: '#005696',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignItems: 'center',
    gap: 6,
  },
  badgeText: { color: '#fff', fontSize: 13 },
  amountText: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  detailsSection: { marginTop: 8, borderTopWidth: 0.5, borderColor: '#ccc', paddingTop: 8 },
  detailText: { fontSize: 13, color: '#333', marginTop: 3 },
  noData: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 18, color: 'red', fontWeight: '600' },
});