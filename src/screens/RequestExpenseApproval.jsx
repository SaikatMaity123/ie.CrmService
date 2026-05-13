import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/custom/CustomButton';
import {CheckBox} from 'react-native-elements';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import {Dropdown} from 'react-native-element-dropdown';
import {openDatabase} from 'react-native-sqlite-storage';
import moment from 'moment';

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
const RequestExpenseApproval = ({navigation}) => {
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [mLabel, setMLabel] = useState('');
  const [mValue, setMValue] = useState('');
  const [yLabel, setYLabel] = useState('');
  const [yValue, setYValue] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [showData, setshowData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState([]);
  const [useMobileAccess, setuseMobileAccess] = useState('');

  useEffect(() => {
    // const monthOptions = getCurrentAndPreviousMonth();
    // setMonths(monthOptions);

  const months = getCurrentAndPreviousMonth();
  setMonths(months);
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setIDEmployee(user.IDEmployee);
          setuseMobileAccess(user.MobileAccess);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const getApiData = month => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_ExpenseRequestList where MonthName=?',
        [month],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i)
              temp.push(results.rows.item(i));
            setData(temp);
            setshowData(true);
            console.log(temp);
          } else {
            Alert.alert('No Data Found');
            setshowData(false);
            //setSelectedMAreaData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
  };

  const renderItem = ({item}) => {
    console.log('Requested', item.Requested);
    if (item.Requested === 0) {
      return (
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: '#ffffff',
                //justifyContent: 'space-around',
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}>
            <CheckBox
              checked={selectedItems.includes(item.IDBooking)}
              onPress={() => toggleItemSelection(item.IDBooking)}
            />
            <View>
              <Text style={styles.menuItem}>Booking No : {item.Bookingno}</Text>
              <Text style={styles.menuItem}>
                Booking Date : {item.BookingDate}
              </Text>
              <Text style={styles.menuItem}>
                Booking Amount : {item.BookingAmount}.00
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  };

  const toggleItemSelection = itemID => {
    if (selectedItems.includes(itemID)) {
      setSelectedItems(selectedItems.filter(item => item !== itemID));
    } else {
      // Item is not selected, so add it to the selectedItems array
      //setSelectedItems([...selectedItems, itemId]);
      setSelectedItems([...selectedItems, itemID]);
    }
  };

  const submit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Please Select An Item');
    } else {
      //console.warn(selectedItems);
      let Tprgrm = [];
      selectedItems.map(function (value) {
        Tprgrm.push({
          Businessid: useBusinessID,
          IDBooking: value,
          Requested: true,
        });
      });
      console.log(Tprgrm);

      if (useMobileAccess === 'ONLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            let result = await fetch(
              BASE_URL + 'ExpenseBooking/Mobile/Requested/Save',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(Tprgrm),
              },
            );

            result = await result.json();
            console.log(result);
            if (result.result === '') {
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    onPress: () => navigation.navigate('DashBoard'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(result.result);
            }
          } else {
            Alert.alert('You are Offline Contact With Administrator!');
          }
        }, []);
      } else if (useMobileAccess === 'ONLINE & OFFLINE') {
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            let result = await fetch(
              BASE_URL + 'ExpenseBooking/Mobile/Requested/Save',
              {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(Tprgrm),
              },
            );

            result = await result.json();
            console.log(result);
            if (result.result === '') {
              Alert.alert(
                'Success',
                'Record Successfully Saved',
                [
                  {
                    text: 'Ok',
                    onPress: () => navigation.navigate('DashBoard'),
                  },
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(result.result);
            }
          } else {
            db.transaction(tx => {
              tx.executeSql(
                'CREATE TABLE IF NOT EXISTS CRM_ExpenseRequestSave (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT);',
                [],
                (_, result) => {
                  console.log('Table created successfully:', result);
                },
                (_, error) => {
                  Alert.alert('Error creating table:', error);
                },
              );
            });
            db.transaction(tx => {
              tx.executeSql(
                'INSERT INTO CRM_ExpenseRequestSave (data) VALUES (?);',
                [JSON.stringify(Tprgrm)],
                (_, result) => {
                  console.log('Data inserted successfully:', result);
                  navigation.navigate('DashBoard');
                },
                (_, error) => {
                  console.log('Error inserting data:', error);
                },
              );
            });
          }
        }, []);
      } else {
        Alert.alert('Contact With Administrator!');
        //Alert.alert(useMobileAccess);
      }
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{marginLeft: 40, marginRight: 40, marginTop: 10}}>
        <Dropdown
          style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={months}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          //dropdownPosition="top"
          placeholder={!isFocus ? 'Select Month' : '...'}
          searchPlaceholder="Search..."
          value={mValue}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setMLabel(item.label);
            setMValue(item.value);
            setIsFocus(false);
            getApiData(item.label);
          }}
        />
      </View>
      {showData ? (
        <View style={styles.container}>
          {data.length ? (
            <FlatList data={data} renderItem={renderItem} />
          ) : (
            <SafeAreaView
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 5,
              }}>
              <Text
                style={{
                  fontFamily: 'Roboto-BoldItalic',
                  fontSize: 18,
                  color: '#FF0000',
                }}>
                No Data Found
              </Text>
            </SafeAreaView>
          )}
          <CustomButton label={'Submit'} onPress={() => submit()} />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default RequestExpenseApproval;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
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
  areaStyle: {
    padding: 10,
    borderColor: 'black',
    borderWidth: 1,
    margin: 5,
    //elevation: 5,
    borderRadius: 5,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    //marginTop: 5,
  },
  dropdownStage: {
    height: 50,
    width: '40%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    //marginBottom: 10,
    margin: 5,
  },
  cStage: {
    height: 45,
    width: '35%',
    borderColor: 'gray',
    // borderWidth: 0.5,
    borderRadius: 8,
    //paddingHorizontal: 5,
    backgroundColor: '#fff',
    marginBottom: 5,
    // margin: 5,
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
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

const getCurrentAndPreviousMonth = () => {
  const currentMonth = moment();
  const previousMonth = moment().subtract(1, 'month');
  
  return [
    { label: currentMonth.format('MMMM'), value: currentMonth.format('YYYY-MM') },
    { label: previousMonth.format('MMMM'), value: previousMonth.format('YYYY-MM') }
  ];
};

// const getCurrentAndPreviousMonth = () => {
//   const currentDate = new Date();
//   const currentMonth = currentDate.toLocaleString('default', {month: 'long'});

//   const previousDate = new Date(
//     currentDate.setMonth(currentDate.getMonth() - 1),
//   );
//   const previousMonth = previousDate.toLocaleString('default', {month: 'long'});

//   return [
//     {label: currentMonth, value: currentMonth},
//     {label: previousMonth, value: previousMonth},
//   ];
// };
