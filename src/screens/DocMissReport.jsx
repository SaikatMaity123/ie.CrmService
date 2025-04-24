import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {TextInput} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';
import ProgressDialog from '../components/custom/ProgressDialog';

const DocMissReport = () => {
  const [currDate, setcurrDate] = useState('');
  const [currStartDate, setcurrStartDate] = useState('');
  const [currEndDate, setcurrEndDate] = useState('');
  const [showData, setshowData] = useState(true);
  const [showRData, setshowRData] = useState(false);
  const [currEDate, setcurrEDate] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerEVisible, setDatePickerEVisibility] = useState(false);

  const [currTime, setcurrTime] = useState('');
  const [currShowDate, setcurrShowDate] = useState('');

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const showDateEPicker = () => {
    setDatePickerEVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();
    const formattedSDate = moment(daten).format('YYYY-MM-DD');

    console.log(formattedSDate);
    setcurrDate(formattedDate);
    setcurrStartDate(formattedSDate);
    hideDatePicker();
  };

  const hideDateEPicker = () => {
    setDatePickerEVisibility(false);
  };

  const handleDateEConfirm = daten => {
    const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();
    const formattedEDate = moment(daten).format('YYYY-MM-DD');

    console.log(formattedEDate);

    console.log(formattedDate);
    setcurrEDate(formattedDate);
    setcurrEndDate(formattedEDate);
    hideDateEPicker();
  };

  const show = () => {
    if (currDate === '') {
      Alert.alert('Select Start Date');
      Alert.alert('Select Start Date');
    } else if (currEDate === '') {
      Alert.alert('Select End Date');
    } else {
      setshowData(false);
      setshowRData(true);

      try {
        AsyncStorage.getItem('UserData').then(value => {
          if (value != null) {
            let user = JSON.parse(value);
            // setBusinessID(user.BusinessID);
            // setIDEmployee(user.IDEmployee);
            // setuseManagerAccess(user.ManagerAccess);
            // setuseMobileAccess(user.MobileAccess);
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000);
            NetInfo.fetch().then(async state => {
              if (state.isConnected) {
                const url =
                  BASE_URL +
                  'Mobile/Report/MissedCallReport?Businessid=' +
                  user.BusinessID +
                  '&IDDivision=' +
                  user.IDDivision +
                  '&IDEmployee=' +
                  user.IDEmployee +
                  '&SDate=' +
                  currStartDate +
                  '&EDate=' +
                  currEndDate;
                let result = await fetch(url);
                result = await result.json();
                //console.log(result.result);
                console.log(url);
                setData(result);
              } else {
                Alert.alert('No Internet');
              }
            }, []);
            // }
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  };
  const backData = () => {
    setshowData(true);
    setshowRData(false);
  };

  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year

    setcurrShowDate(date + '/' + month + '/' + year);
    setInterval(() => {
      setcurrTime(new Date().toLocaleTimeString());
      //setcurrTime(new Date().getHours()+':'+new Date().getMinutes()+':'+new Date().getSeconds());
    }, 1000);
  }, []);
  return (
    <ScrollView>
      {showData ? (
        <View
          style={{
            backgroundColor: '#ecf0f1',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 0.1,
            margin: 10,
            elevation: 2,
            borderRadius: 1,
          }}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{padding: 5}}>Date : {currShowDate}</Text>
            <Text style={{padding: 5}}>Time : {currTime}</Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#33767C',
              width: '30%',
              padding: 5,
              marginLeft: 'auto', // Aligns the button to the right
              borderRadius: 5,
              flexDirection: 'row',
            }}
            onPress={() => show()}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
                margin: 5,
                padding: 5,
                fontFamily: 'Lato-Regular',
                color: '#fff',
              }}>
              Show
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {showRData ? (
        <View
          style={{
            backgroundColor: '#ecf0f1',
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderWidth: 0.1,
            margin: 10,
            elevation: 2,
            borderRadius: 1,
          }}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{padding: 5}}>Date : {currShowDate}</Text>
            <Text style={{padding: 5}}>Time : {currTime}</Text>
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#33767C',
              width: '30%',
              padding: 5,
              marginLeft: 'auto', // Aligns the button to the right
              borderRadius: 5,
              flexDirection: 'row',
            }}
            onPress={() => backData()}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 18,
                margin: 5,
                padding: 5,
                fontFamily: 'Lato-Regular',
                color: '#fff',
              }}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Rest of your code remains the same */}
      {showData ? (
        <View>
          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              marginTop: 5,
            }}
            onPress={showDatePicker}>
            <View style={{marginLeft: 10, marginRight: 10, marginTop: 15}}>
              <TextInput
                label="Start Date"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={{marginBottom: 5}}
                value={currDate}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />

          <TouchableOpacity
            style={{
              width: '100%',
              height: 50,
              alignSelf: 'center',
              justifyContent: 'center',
              marginBottom: 10,
              marginTop: 5,
            }}
            onPress={showDateEPicker}>
            <View style={{marginLeft: 10, marginRight: 10, marginTop: 15}}>
              <TextInput
                label="End Date"
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={{marginBottom: 5}}
                value={currEDate}
                editable={false}
              />
            </View>
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerEVisible}
            mode="date"
            onConfirm={handleDateEConfirm}
            onCancel={hideDateEPicker}
            maximumDate={new Date()}
          />
        </View>
      ) : null}
      {showRData ? (
        <View>
          <ScrollView horizontal style={{margin: 5, padding: 5}}>
            <View style={styles.table}>
              <View style={styles.row}>
                <Text style={styles.header}>Head Quarter</Text>
                <Text style={styles.header}>Doctor Code</Text>
                <Text style={styles.header}>Doctor</Text>
                <Text style={styles.header}>Address</Text>
                <Text style={styles.header}>Area</Text>
                <Text style={styles.header}>Category</Text>
                <Text style={styles.header}>Speciality</Text>
                <Text style={styles.header}>Addition Date</Text>
                <Text style={styles.header}>Last Visit</Text>
              </View>
              {data.map(row => (
                <View style={styles.row}>
                  <Text style={styles.cell}>{row.HQ}</Text>
                  <Text style={styles.cell}>{row.DoctorCode}</Text>
                  <Text style={styles.cell}>{row.Doctor}</Text>
                  <Text style={styles.cell}>{row.Address}</Text>
                  <Text style={styles.cell}>{row.Area}</Text>
                  <Text style={styles.cell}>{row.Category}</Text>
                  <Text style={styles.cell}>{row.Speciality}</Text>
                  <Text style={styles.cell}>{row.AdditionDate}</Text>
                  <Text style={styles.cell}>{row.LastVisit}</Text>
                </View>
              ))}
              <View
                style={{
                  marginLeft: 150,
                  padding: 10,
                  width: 250,
                  justifyContent: 'center',
                }}>
                {/* <Button title="Generate PDF" onPress={generatePDF} /> */}
              </View>
            </View>
          </ScrollView>
        </View>
      ) : null}
      <ProgressDialog visible={loading} message="Loading, please wait..." />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  header: {
    padding: 10,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
    width: 120,
  },
  cell: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: 120,
  },
});

export default DocMissReport;
