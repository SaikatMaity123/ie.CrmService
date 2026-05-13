import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  Alert,
  FlatList,
  TouchableWithoutFeedback,
  ActivityIndicator,
  LogBox,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { openDatabase } from 'react-native-sqlite-storage';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import CustomButton from '../components/custom/CustomButton';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';

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

const UniversalSearch = ({ navigation }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [useData, setData] = useState([]);
  const [locationStatus, setLocationStatus] = useState('');
  const [currentLongitude, setCurrentLongitude] = useState('0.00');
  const [currentLatitude, setCurrentLatitude] = useState('0.00');
  const [useMobileAccess, setuseMobileAccess] = useState('');
  const [custTLabel, setcustTLabel] = useState('');
  const [custTValue, setcustTValue] = useState('');
  const [useSearch, showSearch] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    //Disabling VirtualizedLists warning error start
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);
    //Disabling VirtualizedLists warning error end
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setuseMobileAccess(user.MobileAccess);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }

    getOneTimeLocation();
    handleEnabledPressed();
    handleCheckPressed();

    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        fetchOfflineTableData();
      } else {
        Alert.alert('No Internet');
      }
    }, []);

    const interval = setInterval(() => {
      handleCheckPressed();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavMaster'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      //console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        BackHandler.exitApp();
        //navigation.navigate('AppNavScreen');
      } else if (checkEnabled === true) {
        //Alert.alert('GPS Active');
        //getOneTimeLocation();
        getMultipleTimeLocation();
      }
    }
  };

  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        //console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          Alert.alert(error.message);
        }
      }
    }
  };

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 1000 },
    );
  };

  const getMultipleTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      //Will give you the current location
      position => {
        setLocationStatus('You are Here');
        const currentLongitude = JSON.stringify(position.coords.longitude);
        //getting the Longitude from the location json
        const currentLatitude = JSON.stringify(position.coords.latitude);
        //getting the Latitude from the location json
        setCurrentLongitude(currentLongitude);
        //Setting state Longitude to re re-render the Longitude Text
        setCurrentLatitude(currentLatitude);
        //Setting state Latitude to re re-render the Longitude Text
        //console.log('checkEnabled', currentLatitude + ' ' + currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      //{enableHighAccuracy: false, timeout: 30000, maximumAge: 1000},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 1000 },
      //{ timeout: 15000 } // 15 seconds timeout
    );
  };

  const fetchOfflineTableData = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM CRM_Unlisted_Type',
        [],
        (tx, results) => {
          if (results.rows.length > 0) {
            var temp = [];
            for (let i = 0; i < results.rows.length; ++i) {
              temp.push({
                value: results.rows.item(i).IDMisc,
                label: results.rows.item(i).Name,
              });
            }
            //temp.shift();
            setData(temp);
            //console.log('Data is inserted:', temp);
          } else {
            console.log('No data found');
            //setWTData('No data found');
          }
        },
        (tx, error) => {
          console.error('Error checking data', error);
        },
      );
    });
  };

  const handleInputChange = text => {
    setInputValue(text);
    // Call the API function when the input changes
    fetchData(text);
  };

  const fetchData = async searchTerm => {
    try {
      if (custTLabel === 'DOCTOR') {
        const url =
          //'http://111.93.160.6:2001/api/crm/user/Mobile/Modulelist?Businessid=' +
          BASE_URL +
          'Doctor/Search?Businessid=' +
          useBusinessID +
          '&Type=' +
          custTLabel +
          '&SerachString=' +
          searchTerm;
        let result = await fetch(url);
        result = await result.json();
        let cType = result.d;
        //console.log(cType);
        //console.log(url);
        setApiData(cType);
      } else {
        const url =
          //'http://111.93.160.6:2001/api/crm/user/Mobile/Modulelist?Businessid=' +
          BASE_URL +
          'Retailer/Search?Businessid=' +
          useBusinessID +
          '&Type=' +
          custTLabel +
          '&SerachString=' +
          searchTerm;
        let result = await fetch(url);
        result = await result.json();
        let cType = result.d;
        //console.log(cType);
        //console.log(url);
        setApiData(cType);
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert('Error fetching data:', error);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: false }}
      showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <View>
        <View style={{ padding: 5, margin: 5 }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Customer Type' : '...'}
            searchPlaceholder="Search Customer Type"
            //value={wtdataLabel}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              setcustTLabel(item.label);
              setcustTValue(item.value);
              setIsFocus(false);
              showSearch(true);
            }}
          />
        </View>
        <View>
          {useSearch ? (
            <View>
              <TextInput
                //label={custTLabel}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ marginLeft: 10, marginRight: 10, marginBottom: 5 }}
                value={inputValue}
                placeholder="Type something..."
                onChangeText={handleInputChange}
              // onChangeText={text => setRemarks(text)}
              />
            </View>
          ) : null}
        </View>
        {/* <ActivityIndicator size="large" color="#45747B" animating={loading} /> */}
        <FlatList
          data={apiData}
          renderItem={({ item }) => (
            <TouchableWithoutFeedback>
              <View
                style={[
                  style.menu,
                  {
                    backgroundColor: '#ffffff',
                    borderColor: '#b5afe9ff',
                    borderWidth: .5, 
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 2,
                    elevation: 5,
                    borderRadius: 8,
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
                  Name : {item.PartyName}
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
                  Code : {item.PartyCode}
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
                  Area : {item.PartyArea}
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
                  HQ : {item.PartyHQ}
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
                  Division : {item.PartyDivision}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
    </ScrollView>
  );
};

export default UniversalSearch;
const style = StyleSheet.create({
  boldText: {
    fontSize: 24,
    color: 'red',
    marginVertical: 10,
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
    marginLeft: 10,
    marginRight: 10,
    //marginTop: 5,
    padding: 5,
    //width: 140,
    //height: 135,2
    elevation: 5,
    borderRadius: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
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
  container: {
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  btnTab: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 5,
    marginBottom: 5,
  },
  btnTabE: {
    width: Dimensions.get('window').width / 1.5,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#EBEBEB',
    padding: 10,
    //justifyContent: 'center',
    backgroundColor: '#E6838D',
    marginTop: 10,
    marginBottom: 5,
  },
  textTab: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Lato-Bold',
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  menuItemPS: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 2,
    marginBottom: 4,
    //padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    marginTop: 2,
    paddingTop: 2,
  },

  searchSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 0,
    backgroundColor: '#fff',
    color: '#424242',
  },
});
