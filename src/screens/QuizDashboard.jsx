import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import React from 'react';
import HomeImg from '../images/home.svg'; // Reuse your SVG
import CRMImg from '../images/CRMNEW.svg';

const quizModules = [
  {label: 'Doctor Survey', value: 'Doctor'},
  {label: 'Employee Survey', value: 'Employee'},
  {label: 'Market Survey', value: 'Market Survey'},
];

const QuizDashboard = ({navigation}) => {
  const handleNavigation = module => {
    if (module.value === 'Doctor') {
      navigation.navigate('Doctor Survey');
    } else if (module.value === 'Employee') {
      navigation.navigate('Employee Survey');
    } else if (module.value === 'Market Survey') {
      navigation.navigate('Market Survey');
    } else {
      Alert.alert('Module not available');
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{height: Dimensions.get('window').height}}>
        <View style={styles.container}>
          <CRMImg height={150} width={200} />
          <FlatList
            data={quizModules}
            numColumns={2}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => handleNavigation(item)}>
                <View style={[styles.menu, {backgroundColor: '#ecf0f1'}]}>
                  <HomeImg height={30} width={30} style={styles.imageDesign} />
                  <Text style={styles.menuItem}>{item.label}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default QuizDashboard;

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
  },
  imageDesign: {
    width: 40,
    height: 40,
    marginTop: 15,
    padding: 5,
    alignSelf: 'center',
  },
});
