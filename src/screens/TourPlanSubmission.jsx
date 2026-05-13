import {
  View,
  Text,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Alert,
  BackHandler,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CRMImg from '../images/CRMNEW.svg';
import CPMImg from '../images/cpm.svg';
import CCMImg from '../images/ccm.svg';
import CNMImg from '../images/cnm.svg';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BASE_URL } from '@env';
import NetInfo from '@react-native-community/netinfo';
import ProgressDialog from '../components/custom/ProgressDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const TourPlanSubmission = props => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
        }
      });
    } catch (error) {
      console.log(error);
    }
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        getAPIData();
      } else {
        Alert.alert('No Internet');
      }
    }, []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        props.navigation.navigate('AppNavScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [props.navigation]),
  );

  const getAPIData = async () => {
    const url = BASE_URL + 'TourProgram/Months';
    let result = await fetch(url);
    result = await result.json();
    console.log('result', result);
    setData(result);

    // setCMonth(result.CurrentMonth);
    // setPMonth(result.PreviosuMonth);
    // setNMonth(result.NextMonth);
  };

  const submit = async (month, year, monthStatus) => {
    //console.warn(useBusinessID);

    //console.warn(item);
    // props.navigation.navigate('Tour Program', {month, year, monthStatus});
    const url =
      //BASE_URL + 'Configuration/CheckTourProgramDate?Businessid=MEND-PVTL-890';
      BASE_URL +
      'Configuration/CheckTourProgramDate?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      useIDEmployee;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    console.log(url);
    if (result.d === '') {
      props.navigation.navigate('Tour Program', { month, year, monthStatus });
    } else {
      Alert.alert(result.d);
    }
  };

  const edit = (month, year) => {
    //console.warn(item);
    props.navigation.navigate('Tour View', { month, year });
  };

  const approval = (month, year, monthStatus) => {
    //console.warn(item);
    props.navigation.navigate('Request Approval', { month, year, monthStatus });
    //props.navigation.navigate('Approval');
  };
  const renderItem = ({ item }) => {
    if (item.MonthStatus === 'PREVIOUS') {
      return (
        <TouchableWithoutFeedback>
          <View style={[style.menu, { backgroundColor: '#ecf0f1' }]}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <CPMImg style={style.imageDesign} />
              <Text style={style.menuItem}>{item.MonthName}</Text>
              {/* <Feather
                  name="edit-2"
                  size={25}
                  color="#666"
                  style={{marginTop: 10,marginLeft:10}}
                  onPress={() => submit(usePMonth)}
                /> */}
              <Feather
                name="eye"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10, marginLeft: 38, paddingLeft: 38 }}
                onPress={() => edit(item.MonthName, item.Year)}
              />
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10 }}
                onPress={() =>
                  approval(item.MonthName, item.Year, item.MonthStatus)
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (item.MonthStatus === 'CURRENT') {
      return (
        <TouchableWithoutFeedback>
          <View style={[style.menu, { backgroundColor: '#c2dec6' }]}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <CCMImg style={style.imageDesign} />
              <Text style={style.menuItem}>{item.MonthName}</Text>
              <Feather
                name="edit-2"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10, marginLeft: 10 }}
                onPress={() =>
                  submit(item.MonthName, item.Year, item.MonthStatus)
                }
              />
              <Feather
                name="eye"
                size={25}
                //color="#666"
                color="#0048a7"
                style={{ marginTop: 10 }}
                onPress={() => edit(item.MonthName, item.Year)}
              />
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10 }}
                onPress={() =>
                  approval(item.MonthName, item.Year, item.MonthStatus)
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    } else if (item.MonthStatus === 'NEXT') {
      return (
        <TouchableWithoutFeedback>
          <View style={[style.menu, { backgroundColor: '#ecf0f1' }]}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <CNMImg style={style.imageDesign} />
              <Text style={style.menuItem}>{item.MonthName}</Text>
              <Feather
                name="edit-2"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10, marginLeft: 10 }}
                onPress={() =>
                  submit(item.MonthName, item.Year, item.MonthStatus)
                }
              />
              <Feather
                name="eye"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10 }}
                onPress={() => edit(item.MonthName, item.Year)}
              />
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={25}
                color="#0048a7"
                style={{ marginTop: 10 }}
                onPress={() =>
                  approval(item.MonthName, item.Year, item.MonthStatus)
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <ImageBackground
        source={require('../images/bg2.png')}
        style={{ height: Dimensions.get('window').height, 
        width: Dimensions.get('window').width,
        flex: 1,
        marginTop: -10,}}>
        <View style={{ alignItems: 'center' }}>
          <CRMImg
            height={150}
            width={200}
          // style={{transform: [{rotate: '-5deg'}]}}
          />
        </View>
        <View
          style={{
            flex: 1,
            marginTop: 50,
          }}>
          <FlatList data={data} renderItem={renderItem} />
        </View>
      </ImageBackground>
      <ProgressDialog visible={loading} message="Loading, please wait..." />
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  menu: {
    margin: 10,
    padding: 5,
    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 5,
  },
  menuItem: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  imageDesign: {
    width: 20,
    height: 20,
    padding: 20,
    justifyContent: 'center', //Centered vertically
    alignSelf: 'center', // Centered horizontally
  },
});

export default TourPlanSubmission;
