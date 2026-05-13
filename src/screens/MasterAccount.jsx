import {
  View,
  Text,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import CRMImg from '../images/CRMNEW.svg';
import CustomButton from '../components/custom/CustomButton';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MasterAccount = ({navigation}) => {
  const [useCode, setCode] = useState('');
  const [useName, setName] = useState('');
  const [useAddress, setAddress] = useState('');
  const [useMobile, setMobile] = useState('');
  const [useempEmail, setempEmail] = useState('');
  const [usePcode, setPcode] = useState('');
  const [useSvalue, setSvalue] = useState('');
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useGST, setGST] = useState('');
  const [usePAN, setPAN] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useStateData, setStateData] = useState([]);
  const [useRemarks, setRemarks] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDataStr = await AsyncStorage.getItem('UserData');
        console.log(userDataStr);

        if (!userDataStr) {
          Alert.alert('User data not found. Please login again.');
          return;
        }

        const user = JSON.parse(userDataStr);
        const HexKey = user.CompanyHexKey;
        setHexKey(HexKey);
        setUName(user.UserName);
        setBusinessID(user.CompanyCode);

        console.log('Using Company HexKey:', HexKey);

        // -------- First API --------
        const response = await fetch(
          BASE_URL + 'Account/Auto/Code?HexKey=' + HexKey + '&type=ACCOUNT',
        );

        const json = await response.json();
        console.log('Full Response:', json);

        if (json.Status === 'SUCCESS' && json.DataList?.length > 0) {
          const code = json.DataList[0].AutoCode;
          setCode(code);
          console.log('AutoCode:', code);
        }

        // -------- Second API --------
        const responsenew = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=STATE',
        );

        const jsonnew = await responsenew.json();
        console.log('Full Response:', jsonnew);

        if (jsonnew?.data?.length > 0) {
          const stateList = jsonnew.data.map(item => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));

          setStateData(stateList);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };

    loadData(); // call async function
  }, []);

  const saveData = async () => {
    var params = {
      IDAccount: 0,
      Code: useCode,
      Name: useName,
      Phone: useMobile,
      Email: useempEmail,
      Address1: useAddress,
      Address2: '',
      State: String(useSvalue),
      Pincode: usePcode,
      GSTNo: useGST,
      PANNo: usePAN,
      Remarks: useRemarks,
      EntryUser: useUName,
      BusinessID: useBusinessID,
    };
    console.log(params);
    const url = BASE_URL + 'Account/Save?HexKey=' + useHexKey;
    console.log(url);

    let result = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    result = await result.json();
    console.log(result);
    if (result.Status === 'SUCCESS') {
      navigation.navigate('AppNavMaster');
    } else {
      Alert.alert(result.Message);
    }
  };
  return (
    <ImageBackground
      source={require('../images/bg2.png')}
      style={{flex: 1}}
      resizeMode="cover">
      <SafeAreaView style={{flex: 1}}>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            //flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
          }}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled">
          <TextInput
            label="Code"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={{marginBottom: 5}}
            value={useCode}
            editable={false}
            // onChangeText={text => setDocCode(text)}
          />
          <TextInput
            label="Name"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useName}
            onChangeText={text => setName(text)}
          />
          <TextInput
            label="Mobile"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={10}
            value={useMobile}
            keyboardType="numeric"
            onChangeText={text => setMobile(text)}
          />
          <TextInput
            label="Email"
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            value={useempEmail}
            onChangeText={text => setempEmail(text)}
          />
          <TextInput
            label="Address"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useAddress}
            onChangeText={text => setAddress(text)}
          />
          <View
            style={{
              marginTop: 5,
              paddingTop: 5,
            }}>
            <Dropdown
              style={[style.dropdown, isFocus && {borderColor: 'blue'}]}
              placeholderStyle={style.placeholderStyle}
              selectedTextStyle={style.selectedTextStyle}
              inputSearchStyle={style.inputSearchStyle}
              iconStyle={style.iconStyle}
              data={useStateData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Select State' : '...'}
              searchPlaceholder="Search"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={item => {
                console.log(item.label);
                console.log(item.value);
                // setSLabel(item.label);
                setSvalue(item.value);
                setIsFocus(false);
              }}
            />
          </View>
          <TextInput
            label="Pin Code"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
            keyboardType="numeric"
            value={usePcode}
            onChangeText={text => setPcode(text)}
          />
          <TextInput
            label="GST No."
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useGST}
            onChangeText={text => setGST(text)}
          />
          <TextInput
            label="PAN"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={usePAN}
            onChangeText={text => setPAN(text)}
          />
          <TextInput
            label="Remarks"
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            value={useRemarks}
            onChangeText={text => setRemarks(text)}
          />
          <View
            style={{
              marginLeft: 5,
              marginRight: 5,
              paddingLeft: 5,
              paddingRight: 5,
            }}>
            <CustomButton label={'Submit'} onPress={() => saveData()} />
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default MasterAccount;
const style = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
