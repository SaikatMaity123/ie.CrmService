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
import DPCScreen from './DPCScreen';

const data = [
  {label: 'Item 1', value: 'DPC Entry'},
  {label: 'Item 2', value: 'DPC View'},
];

const DPCDashBoard = ({navigation}) => {
  const submit = modulename => {
    if (modulename.value === 'DPC Entry') {
      navigation.navigate('DPC Entry');
    } else if (modulename.value === 'DPC View') {
      navigation.navigate('DPC View');
    } else {
      navigation.navigate('Working On');
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

export default DPCDashBoard;

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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
