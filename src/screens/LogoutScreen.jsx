import {View, Text, SafeAreaView, StyleSheet, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import CRMImg from '../images/CRMNEW.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutScreen = ({navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const onCancel = () => {
    navigation.navigate('DashBoard');
    setModalVisible(false);
  };

  const onLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('LogIn');
      setModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setModalVisible(true);
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
        //flexDirection: 'row',
      }}>
      {/* <View style={{margin:5}}>
    <CustomButton label={'LogOut'}/>
    </View>
    <View style={{margin:5}}>
    <CustomButton label={'Cancel'}/>
    </View> */}

      {modalVisible ? (
        <View style={[styles.modal, {backgroundColor: '#ecf0f1'}]}>
          <View style={styles.body}>
            {/* <Image
            style={{ width: 100,
                height: 100,margin:5,}} 
            source={require('./src/assets/happiness.png')}
          /> */}
            <CRMImg
              height={100}
              width={100}
              // style={{transform: [{rotate: '-5deg'}]}}
            />
            <Text>Do You Want To Logout?</Text>
            {/* <Button title="Close" onPress={() => setModalVisible(false)} /> */}
            <View style={{flexDirection: 'row'}}>
              <View style={{margin: 5}}>
                <Button title="Logout" onPress={() => onLogout()} />
              </View>
              <View style={{margin: 5}}>
                <Button title="Close" onPress={() => onCancel()} />
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(50,50,50,.5)',
    justifyContent: 'center',
  },
  body: {
    backgroundColor: '#fff',
    height: 300,
    width: 300,
    padding: 20,
    justifyContent: 'flex-end',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default LogoutScreen;
