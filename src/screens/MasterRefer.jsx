import { View, Text, StatusBar, ImageBackground, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyBoardNewLayout from '../components/custom/KeyBoardNewLayout';
import { TextInput } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/custom/CustomButton';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MasterRefer = ({ navigation }) => {
  const [useCode, setCode] = useState('');
  const [useName, setName] = useState('');
  const [useAddress, setAddress] = useState('');
  const [useMobile, setMobile] = useState('');
  const [useempEmail, setempEmail] = useState('');
  const [useSvalue, setSvalue] = useState('');
  const [useCvalue, setCvalue] = useState('');
  const [useLmark, setLmark] = useState('');
  const [useSID, setSID] = useState('');
  const [useCityvalue, setCityvalue] = useState('');
  const [useCity, setCity] = useState([]);
  const [useCData, setCData] = useState([]);
  const [useActiveData, setActiveData] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [usePcode, setPcode] = useState('');
  const [useGST, setGST] = useState('');
  const [usePAN, setPAN] = useState('');
  const [useBno, setBno] = useState('');
  const [useBname, setBname] = useState('');
  const [useIFSC, setIFSC] = useState('');
  const [useActivevalue, setActivevalue] = useState('');
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useStateData, setStateData] = useState([]);

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
          BASE_URL + 'Referrer/Auto/Code?HexKey=' + HexKey + '&type=REFERRER',
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
            value: item.Code,
          }));

          setStateData(stateList);
        }
        // -------- Third API --------
        const responseC = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=City',
        );

        const jsonC = await responseC.json();
        console.log('Full Response:', jsonC);

        if (jsonC?.data?.length > 0) {
          const stateList = jsonC.data.map(item => ({
            label: item.Name.trim(),
            value: item.Code,
          }));

          setCity(stateList);
        }
        // -------- Fourth API --------
        const responseCountry = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=Country',
        );

        const jsonCountry = await responseCountry.json();
        console.log('Full Response:', jsonCountry);

        if (jsonCountry?.data?.length > 0) {
          const stateList = jsonCountry.data.map(item => ({
            label: item.Name.trim(),
            value: item.Code,
          }));

          setCData(stateList);
        }
        // -------- Fifth API --------
        const responseA = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=Active',
        );

        const jsonA = await responseA.json();
        console.log('Full Response:', jsonA);

        if (jsonA?.data?.length > 0) {
          const stateList = jsonA.data.map(item => ({
            label: item.Name.trim(),
            value: item.Code,
          }));

          setActiveData(stateList);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };

    loadData(); // call async function
  }, []);

  const validateForm = () => {
    if (!currDate) return 'Please select Lead Date';
    if (!useempEmail) return 'Please enter Email';

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(useempEmail)) return 'Invalid Email format';

    if (!useLeadSourceLabel) return 'Please select Lead Source';
    if (!usepriorityLabel) return 'Please select Lead Priority';
    if (!useAvalue) return 'Please select Account';
    if (!useRvalue) return 'Please select Referrer';
    if (!useILabel) return 'Please select Industry';
    if (!usePvalue) return 'Please select Product';
    if (!useLCLabel) return 'Please select Lead Class';
    if (!useRemarks) return 'Please enter Remarks';

    return null;
  };

  const saveData = async () => {

    const validationError = validateForm();

    if (validationError) {
      Alert.alert(validationError);
      return;
    }

    var params = {
      IDReferer: 0,
      Code: useCode,
      Name: useName,
      Phone: useMobile,
      Email: useempEmail,
      Address1: useAddress,
      Address2: '',
      State: useSvalue,
      City: useCityvalue,
      Pincode: usePcode,
      Country: useCvalue,
      Landmark: useLmark,
      SocialID: useSID,
      GSTNo: useGST,
      PANNo: usePAN,
      BankName: useBname,
      BankACNo: useBno,
      BankIDFCNo: useIFSC,
      EntryUser: useUName,
      Active: useActivevalue,
      CompanyCode: useBusinessID,
    };
    console.log(params);
    const url = BASE_URL + 'Referrer/Save?HexKey=' + useHexKey;
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
      Alert.alert(
        'Success',
        'Referrer created successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('AppNavMaster'),
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(result.Message);
    }
  };

  return (
    <ImageBackground
      source={require('../images/bg2.png')}
      style={{ flex: 1 }}
      resizeMode="cover">
      <KeyBoardNewLayout>
        <StatusBar barStyle="light-content" backgroundColor="transparent" />
        <TextInput
          label="Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ marginBottom: 5 }}
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
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
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
        <View
          style={{
            marginTop: 5,
            paddingTop: 5,
          }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useCity}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select City' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              // setSLabel(item.label);
              setCityvalue(item.value);
              setIsFocus(false);
            }}
          />
        </View>
        <View
          style={{
            marginTop: 5,
            paddingTop: 5,
          }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useCData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Country' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              // setSLabel(item.label);
              setCvalue(item.value);
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
          label="Landmark"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useLmark}
          onChangeText={text => setLmark(text)}
        />
        <TextInput
          label="Social ID"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useSID}
          onChangeText={text => setSID(text)}
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
          label="PAN No"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={usePAN}
          onChangeText={text => setPAN(text)}
        />
        <TextInput
          label="Bank Name"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useBname}
          onChangeText={text => setBname(text)}
        />
        <TextInput
          label="Bank AC No"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useBno}
          onChangeText={text => setBno(text)}
        />
        <TextInput
          label="IFSC Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useIFSC}
          onChangeText={text => setIFSC(text)}
        />
        <View
          style={{
            marginTop: 5,
            paddingTop: 5,
          }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useActiveData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Active Status' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              // setSLabel(item.label);
              setActivevalue(item.value);
              setIsFocus(false);
            }}
          />
        </View>
        <View
          style={{
            marginLeft: 5,
            marginRight: 5,
            paddingLeft: 5,
            paddingRight: 5,
          }}>
          <CustomButton label={'Submit'} onPress={() => saveData()} />
        </View>
      </KeyBoardNewLayout>
    </ImageBackground>
  );
};

export default MasterRefer;
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
