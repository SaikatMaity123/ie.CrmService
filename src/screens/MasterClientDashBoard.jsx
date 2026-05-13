import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';
import React from 'react';
import CRMImg from '../images/CRMNEW.svg';
import HomeImg from '../images/home.svg';

const data = [
  {label: 'Item 1', value: 'Master Account'},
  {label: 'Item 2', value: 'Master Product'},
  {label: 'Item 3', value: 'Master Referr'},
  {label: 'Item 4', value: 'View Master'},
];
const MasterClientDashBoard = ({navigation}) => {

  const submit = async item => {
    if (item.value === 'Master Account') {
      navigation.navigate('Master Account');
    } 
    else if (item.value === 'Master Product') {
      navigation.navigate('Master Product');
    } 
    else if (item.value === 'Master Referr') {
      navigation.navigate('Master Referr');
    } 
    else if (item.value === 'View Master') {
      navigation.navigate('View Master');
    } 
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
          <CRMImg height={200} width={200} />

          <FlatList
            data={data}
            numColumns={2}
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

export default MasterClientDashBoard;
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
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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
  openBtn: {
    backgroundColor: 'blue',
    padding: 15,
    borderRadius: 8,
  },

  btnText: {color: 'white', fontWeight: 'bold'},

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    alignItems: 'center',
  },

  map: {
    width: '100%',
    height: '55%',
  },

  latLongText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },

  startBtn: {
    marginTop: 20,
    backgroundColor: 'green',
    padding: 15,
    width: '90%',
    borderRadius: 10,
    alignItems: 'center',
  },

  startText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  closeBtn: {
    marginTop: 15,
  },

  closeText: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
  },
  infoCard: {
    width: '92%',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 14,

    // 3D / Elevation
    elevation: 8, // Android
    shadowColor: '#000', // iOS
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  empName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A2540',
  },

  empCode: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  iconTextRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔑 KEY FIX
    marginTop: 6,
  },

  latLongText: {
    marginLeft: 6, // spacing from icon
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1, // allows wrapping
    lineHeight: 18,
  },

  dateTimeRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#005696',
  },
  placeText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
});
