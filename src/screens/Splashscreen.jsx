import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CRMImg from '../images/CRMNEW.svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const Splashscreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  //ActivityIndicator display
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);
  //ActivityIndicator hide

  return (
    <SafeAreaView
      style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
     {/* <View style={{marginTop: 20}}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: 'bold',
            color: '#20315f',
            fontFamily: 'Inter-Bold',
          }}>
          CRM
        </Text>
      </View>  */}
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <CRMImg
        //source={require('../images/CRMNEW.jpeg')}
          width={300}
          height={300}
          //style={{transform: [{rotate: '-15deg'}]}}
        />
        <ActivityIndicator size="large" color="#45747B" animating={loading} />
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('LogIn')}
        //onPress={hideLoader}
        style={{
          padding: 20,
          width: '90%',
          borderRadius: 5,
          flexDirection: 'row',
          backgroundColor: '#33767C',
          justifyContent: 'space-between',
          marginBottom: 50,
        }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 18,
            color: '#fff',
            fontFamily: 'Roboto-MediumItalic',
          }}>
          Let's Begin
        </Text>
        <MaterialIcons name="arrow-forward-ios" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Splashscreen;
