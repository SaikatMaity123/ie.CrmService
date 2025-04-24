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
} from 'react-native';
import React, {useState, useEffect} from 'react';
import HomeImg from '../images/home.svg';
import CRMImg from '../images/CRMNEW.svg';
import {openDatabase} from 'react-native-sqlite-storage';
import NetInfo from '@react-native-community/netinfo';

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
  {label: 'Item 1', value: 'Master Doctor'},
  {label: 'Item 2', value: 'Master Retailer'},
  {label: 'Item 3', value: 'Universal Search'},
  {label: 'Item 4', value: 'View Master Data'},
  //{ label: 'Item 5', value: 'Leave Application' },
  //{ label: 'Item6', value: 'Quiz'},
];
const MasterDashBoard = ({navigation}) => {
  const [isConnected, setIsConnected] = useState(true);
  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);
  const submit = moduleData => {
    if (moduleData.value === 'Master Retailer') {
      navigation.navigate('Master Retailer');
      //Alert.alert('Work In Progress');
    } else if (moduleData.value === 'Master Doctor') {
      navigation.navigate('Master Doctor');
      // db.transaction(tx => {
      //   tx.executeSql('DELETE from CRM_MasterDoctor');
      // });
      // db.transaction(tx => {
      //   tx.executeSql('DELETE from CRM_MasterDoctorCode');
      // });
    } else if (moduleData.value === 'Universal Search') {
      navigation.navigate('Universal Search');
    } else if (moduleData.value === 'View Master Data') {
      navigation.navigate('View Master Data');
    }
    // else if (moduleData.value === 'Leave Application') {
    //   if (!isConnected) {
    //     setIsConnected(false);
    //     Alert.alert("No Internet Connection", "Your internet is off. Please turn it on to continue.");
    //   } else {
    //     navigation.navigate('Leave Application');
    //   }

    // }
    // else if(moduleData.value ==='Quiz'){
    //   navigation.navigate('Quiz Dashboard');
    // }
    else {
      Alert.alert('Work In Progress');
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg
            height={150}
            width={200}
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
      </ImageBackground>
    </SafeAreaView>
  );
};

export default MasterDashBoard;

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
