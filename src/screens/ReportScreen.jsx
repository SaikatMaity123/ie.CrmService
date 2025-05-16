import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import React, {useEffect,useState} from 'react';
import HomeImg from '../images/home.svg';
import CRMImg from '../images/CRMNEW.svg';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import {openDatabase} from 'react-native-sqlite-storage';
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

const data = [
  {label: 'Item 1', value: 'Doctor'},
  {label: 'Item 2', value: 'Party'},
  {label: 'Item 3', value: 'Unlisted'},
  {label: 'Item 4', value: 'Others'},
  {label: 'Item 5', value: 'Stay'},
  {label: 'Item 6', value: 'RCPA'},
  // {label: 'Item 7', value: 'Expense Booking'},
  {label: 'Item 8', value: 'View DCR'},
];
const ReportScreen = ({navigation}) => {

  useEffect(() => {
    handleCheckPressed();
  }, []);

  const handleCheckPressed = async () => {
    if (Platform.OS === 'android') {
      var checkEnabled = await isLocationEnabled();
      console.log('checkEnabled', checkEnabled);
      if (checkEnabled === false) {
        Alert.alert('GPS Not Active');
        //BackHandler.exitApp();
        handleEnabledPressed();
      } else if (checkEnabled === true) {
        //Alert.alert('GPS Active');
      }
    }
  };

  const handleEnabledPressed = async () => {
    if (Platform.OS === 'android') {
      try {
        var enableResult = await promptForEnableLocationIfNeeded();
        console.log('enableResult', enableResult);
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  };

  const submit = moduleData => {
    if (moduleData.value === 'Doctor') {
      navigation.navigate('Doctor Daily Call Report');
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
        txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
      });
    } 
    else if (moduleData.value === 'Party') {
      navigation.navigate('Retailer Daily Call Report');
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
        txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
      });
    } else if (moduleData.value === 'Unlisted') {
      db.transaction(txn => {
        txn.executeSql('DROP TABLE IF EXISTS CRM_SAMPLEQTY', []);
        txn.executeSql('DROP TABLE IF EXISTS CRM_GIFTQTY', []);
      });
      navigation.navigate('Unlisted Screen');
    } else if (moduleData.value === 'Others') {
      navigation.navigate('Others');
    } else if (moduleData.value === 'Stay') {
      navigation.navigate('Stay');
    } else if (moduleData.value === 'RCPA') {
      navigation.navigate('RCPA');
    } else if (moduleData.value === 'View DCR') {
      navigation.navigate('View DCR');
    } else {
      Alert.alert('Work In Progress');
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      {/* <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}> */}
      <View style={styles.container}>
        <CRMImg
          height={100}
          width={100}
          // style={{transform: [{rotate: '-5deg'}]}}
        />
        <FlatList
          data={data}
          numColumns={2}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => submit(item)}>
              {/* <View style={styles.menu}> */}
              <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                {/* <FontAwesome name="bank" size={28}  style={styles.imageDesign}/> */}
                <HomeImg
                  height={30}
                  width={30}
                  style={styles.imageDesign}
                  // style={{transform: [{rotate: '-5deg'}]}}
                />
                <Text style={styles.menuItem}>{item.value}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    margin: 5,
    padding: 5,
    width: 150,
    height: 130,
    elevation: 5,
    borderRadius: 5,
  },
  menuItem: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  imageDesign: {
    width: 40,
    height: 40,
    marginTop: 15,
    padding: 5,
    justifyContent: 'center', //Centered vertically
    alignSelf: 'center', // Centered horizontally
  },
  card: {
    height: 150,
    width: Dimensions.get('window').width,
    padding: 5,
    backgroundColor: '#fff',
    elevation: 5,
    justifyContent: 'center', //Centered vertically
    alignItems: 'center', // Centered horizontally
  },

  gridView: {
    marginTop: 10,
    flex: 1,
    color: '',
  },
  itemContainer: {
    justifyContent: 'flex-end',
    borderRadius: 5,
    padding: 10,
    height: 150,
  },
  itemName: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
  itemCode: {
    fontWeight: '600',
    fontSize: 12,
    color: '#fff',
  },
});
