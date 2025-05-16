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
import React, {useEffect} from 'react';
import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';
import {useFocusEffect} from '@react-navigation/native';
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from 'react-native-android-location-enabler';
import AsyncStorage from '@react-native-async-storage/async-storage';

const data = [
  {label: 'Item 1', value: 'Customer Visit'},
  {label: 'Item 2', value: 'View'},
];

const ClientDashBoard = ({navigation}) => {
  useEffect(() => {
    handleCheckPressed();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Hold on!', 'Are you sure you want to Logout?', [
          {
            text: 'Cancel',
            onPress: () => BackHandler.exitApp(),
            style: 'cancel',
          },
          //{text: 'YES', onPress: () => BackHandler.exitApp()},
          {text: 'YES', onPress: () => logOut()},
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );

      return () => backHandler.remove();
    }, []),
  );

  const logOut = async () => {
    await AsyncStorage.clear();
    navigation.navigate('LogIn');
  };
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

  const submit = modulename => {
    if (modulename.value === 'Customer Visit') {
      navigation.navigate('Customer Visit');
    } else {
    }
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg height={200} width={200} />
          <FlatList
            data={data}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => submit(item)}>
                <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                  <HomeImg height={40} width={40} style={styles.imageDesign} />
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

export default ClientDashBoard;

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
    marginBottom: 5,
    padding: 5,
    textAlign: 'center',
    alignItems: 'center',
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
