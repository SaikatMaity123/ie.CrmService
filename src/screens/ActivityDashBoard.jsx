import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import React from 'react';
import HomeImg from '../images/home.svg';
import CRMImg from '../images/CRMNEW.svg';

const data = [
  {label: 'Item 1', value: 'Doctor Visit'},
  {label: 'Item 2', value: 'Party Visit'},
  {label: 'Item 2', value: 'View Activity'},
];
const ActivityDashBoard = ({navigation}) => {
  const submit = moduleData => {
    if (moduleData.value === 'Doctor Visit') {
      navigation.navigate('Doctor Activities');
    } else if (moduleData.value === 'Party Visit') {
      navigation.navigate('Party Visit');
    } else if (moduleData.value === 'View Activity') {
      navigation.navigate('View Activity');
    } else {
      Alert.alert('Work In Progress');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg height={100} width={100} />
          <FlatList
            data={data}
            numColumns={2}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => submit(item)}>
                <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                  <HomeImg height={30} width={30} style={styles.imageDesign} />
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

export default ActivityDashBoard;

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
