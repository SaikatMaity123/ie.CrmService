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

const CallDurationReport = () => {
  const [currDate, setcurrDate] = useState('');
  const [currStartDate, setcurrStartDate] = useState('');
  const [currEndDate, setcurrEndDate] = useState('');
  const [currEDate, setcurrEDate] = useState('');
  const [showData, setshowData] = useState(true);
  const [showRData, setshowRData] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerEVisible, setDatePickerEVisibility] = useState(false);

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
    } else if (currEDate === '') {
      Alert.alert('Select End Date');
    } else {
      setshowData(false);
      setshowRData(true);

      try {
        AsyncStorage.getItem('UserData').then(value => {
          if (value != null) {
            let user = JSON.parse(value);
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
            }, 3000);
            NetInfo.fetch().then(async state => {
              if (state.isConnected) {
                const url =
                  BASE_URL +
                  'Mobile/Report/CallDurationReport?Businessid=' +
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
                <Text style={styles.header}>DCR Date</Text>
                <Text style={styles.header}>Employee No</Text>
                <Text style={styles.header}>Employee Name</Text>
                <Text style={styles.header}>Manager No</Text>
                <Text style={styles.header}>Manager Name</Text>
                <Text style={styles.header}>Start Time</Text>
                <Text style={styles.header}>End Time</Text>
                <Text style={styles.header}>Duration</Text>
                <Text style={styles.header}>Division</Text>
                <Text style={styles.header}>Designation</Text>
                <Text style={styles.header}>Head Quarter</Text>
                <Text style={styles.header}>ASM</Text>
                <Text style={styles.header}>RSM</Text>
                <Text style={styles.header}>Total Doctor</Text>
                <Text style={styles.header}>Total Retailer</Text>
                <Text style={styles.header}>Total DCR Day</Text>
              </View>
              {data.map(row => (
                <View style={styles.row}>
                  <Text style={styles.cell}>{row.DCRDate}</Text>
                  <Text style={styles.cell}>{row.Employeeno}</Text>
                  <Text style={styles.cell}>{row.EmployeeName}</Text>
                  <Text style={styles.cell}>{row.ManagerNo}</Text>
                  <Text style={styles.cell}>{row.ManagerName}</Text>
                  <Text style={styles.cell}>{row.StartTime}</Text>
                  <Text style={styles.cell}>{row.EndTime}</Text>
                  <Text style={styles.cell}>{row.Duration}</Text>
                  <Text style={styles.cell}>{row.Division}</Text>
                  <Text style={styles.cell}>{row.Designation}</Text>
                  <Text style={styles.cell}>{row.HQ}</Text>
                  <Text style={styles.cell}>{row.ASM}</Text>
                  <Text style={styles.cell}>{row.RSM}</Text>
                  <Text style={styles.cell}>{row.TotalDoctor}</Text>
                  <Text style={styles.cell}>{row.TotalRetailer}</Text>
                  <Text style={styles.cell}>{row.TotalDCRDay}</Text>
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
export default CallDurationReport;
