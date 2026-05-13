import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import CRMImg from '../images/CRMNEW.svg';
import CRMImgWelcome from '../images/crm-welcome 1.svg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { width, height } = Dimensions.get('window');

const Splashscreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const getStartedScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current; // start invisible


  // useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 0,       // fade out completely
  //     duration: 1000,   // 1 second
  //     useNativeDriver: true,
  //   }).start();
  // }, []);


  const onGetStartedPressIn = () => {
    Animated.spring(getStartedScale, {
      toValue: 1.15,
      useNativeDriver: true,
    }).start();
  };

  const onGetStartedPressOut = () => {
    Animated.spring(getStartedScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };



  //ActivityIndicator display
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);

    Animated.timing(fadeAnim, {
      toValue: 1,       // fade in completely
      duration: 800,   // 800 milliseconds
      useNativeDriver: true,
    }).start();
  }, []);
  //ActivityIndicator hide

  return (
    // <ImageBackground
    //   source={require('../images/bg2.png')}
    //   style={{height: Dimensions.get('window').height}}>
    //   <SafeAreaView
    //     style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    //     {/* <View style={{marginTop: 20}}>
    //     <Text
    //       style={{
    //         fontSize: 30,
    //         fontWeight: 'bold',
    //         color: '#20315f',
    //         fontFamily: 'Inter-Bold',
    //       }}>
    //       CRM
    //     </Text>
    //   </View>  */}
    //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    //       <CRMImg
    //         //source={require('../images/CRMNEW.jpeg')}
    //         width={300}
    //         height={300}
    //         //style={{transform: [{rotate: '-15deg'}]}}
    //       />
    //       <ActivityIndicator size="large" color="#45747B" animating={loading} />
    //     </View>

    //     <TouchableOpacity
    //       onPress={() => navigation.navigate('LogIn')}
    //       //onPress={hideLoader}
    //       style={{
    //         padding: 20,
    //         width: '90%',
    //         borderRadius: 5,
    //         flexDirection: 'row',
    //         backgroundColor: '#005696',
    //         justifyContent: 'space-between',
    //         marginBottom: 50,
    //       }}>
    //       <Text
    //         style={{
    //           fontWeight: 'bold',
    //           fontSize: 18,
    //           color: '#fff',
    //           fontFamily: 'Roboto-MediumItalic',
    //         }}>
    //         Let's Begin
    //       </Text>
    //       <MaterialIcons name="arrow-forward-ios" size={30} color="#fff" />
    //     </TouchableOpacity>
    //   </SafeAreaView>
    // </ImageBackground>

    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', }}>
      <StatusBar barStyle="light-content" backgroundColor="#005696" />
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
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
        {/* <CRMImg
          //source={require('../images/CRMNEW.jpeg')}
          width={183}
          height={154}
        //style={{transform: [{rotate: '-15deg'}]}}
        />
  */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <CRMImg width={183} height={154} />
        </Animated.View>


        {/* <Image
          source={require('../images/ieCRMLogo1.png')}
          style={styles.logo}
          resizeMode="contain"
        /> */}

      </View>
      <Text style={{ fontSize: 30, textAlign: 'center', color: '#005696', padding: 10, fontWeight: 'bold', }}>
        Welcome To ie.CRM Service </Text>
      <Text style={{ marginTop: 5, fontSize: 14, textAlign: 'center', color: '#005696', padding: 5 }}>Your Customer Relationships made Simple</Text>
      <View style={styles.container}>

        {/* <Image
          source={require('../images/crm-welcome.png')}
          style={styles.logo1}
          resizeMode="contain"
        /> */}

        {/* <CRMImgWelcome
          //source={require('../images/CRMNEW.jpeg')}
          width={282}
          height={222}
        //style={{transform: [{rotate: '-15deg'}]}}
        /> */}

        <Animated.View style={{ opacity: fadeAnim }}>
          <CRMImgWelcome width={282} height={222} />
        </Animated.View>

        <TouchableWithoutFeedback
          onPressIn={onGetStartedPressIn}
          onPressOut={onGetStartedPressOut}
          onPress={() => navigation.navigate('LogIn')}
        >
          <Animated.View
            style={{
              padding: 10,
              width: '80%',
              borderRadius: 8,
              flexDirection: 'row',
              backgroundColor: '#ffffff',
              justifyContent: 'space-between',
              marginTop: 20,
              marginBottom: 20,
              borderColor: '#005696',
              borderWidth: 2,
              transform: [{ scale: getStartedScale }],
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 18,
                color: '#005696',
                fontFamily: 'Roboto-MediumItalic',
                alignContent: 'center',
              }}
            >
              Get Started
            </Text>
            {/* <MaterialIcons name="arrow-forward-ios" size={30} color="#005696" /> */}
          </Animated.View>
        </TouchableWithoutFeedback>

      </View>
      <ActivityIndicator size="large" color="#ffffff" animating={loading} />
    </SafeAreaView>
  );
};

export default Splashscreen;
const styles = StyleSheet.create({
  logo: {
    width: width * 0.58,
    height: height * 0.25,
    paddingTop: 10,
  },
  logo1: {
    width: width * 0.75,
    height: height * 0.35,
    paddingTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    padding: width * 0.04,
    marginHorizontal: width * 0.05,
    marginTop: height * 0.005,
    marginBottom: height * 0.16,
    paddingBottom: 10,
    borderRadius: 20,
    // Soft shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Elevation for Android
    elevation: 6,

    // Optional border for subtle boundary
    borderColor: '#E0F2F1',
    borderWidth: 1,
  },
}); 