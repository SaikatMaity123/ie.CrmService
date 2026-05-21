import {
  View,
  Text,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import KeyBoardNewLayout from '../components/custom/KeyBoardNewLayout';
import { TextInput } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/custom/CustomButton';
import axios from 'axios';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const LeadGeneration = ({ navigation }) => {
  const [useCode, setCode] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [currDate, setcurrDate] = useState('');
  const [useempEmail, setempEmail] = useState('');
  const [useRemarks, setRemarks] = useState('');
  const [useRvalue, setRvalue] = useState('');
  const [usePvalue, setPvalue] = useState('');
  const [useILabel, setILabel] = useState('');
  const [useLCLabel, setLCLabel] = useState('');
  const [useAvalue, setAvalue] = useState('');
  const [usepriorityLabel, setpriorityLabel] = useState('');
  const [useLeadSourceLabel, setLeadSourceLabel] = useState('');
  const [useLSource, setLSource] = useState([]);
  const [usePriority, setPriority] = useState([]);
  const [useAccount, setAccount] = useState([]);
  const [useReferrer, setReferrer] = useState([]);
  const [useIndustry, setIndustry] = useState([]);
  const [useProduct, setProduct] = useState([]);
  const [useLClass, setLClass] = useState([]);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useIDUser, setIDUser] = useState('');

  useEffect(() => {
    const loadData = async () => {
      //console.log("Checkbox value changed:", checkedValue);
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
        setIDUser(user.IDUser);

        console.log('Using Company HexKey:', HexKey);

        // -------- First API --------
        const response = await fetch(
          BASE_URL + 'Lead/Auto/Code?HexKey=' + HexKey + '&type=LEAD',
        );

        const json = await response.json();

        console.log('Full Response:', json);

        setCode(json.data.AutoCode);

        // -------- Second API --------
        const responsenew = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=LEADSOURCE',
        );

        const jsonnew = await responsenew.json();
        console.log('Full Response:', jsonnew);

        if (jsonnew?.data?.length > 0) {
          const stateList = jsonnew.data.map(item => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));

          setLSource(stateList);
        }

        // -------- Third API --------
        const responseP = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=PRIORITY',
        );

        const jsonP = await responseP.json();
        console.log('Full Response:', jsonP);

        if (jsonP?.data?.length > 0) {
          const stateList = jsonP.data.map(item => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));

          setPriority(stateList);
        }
        // -------- Fourth API --------
        const url =
          BASE_URL +
          'Account/Active/List?HexKey=' +
          HexKey +
          '&UserName=' +
          user.UserName +
          '&UserType=ADMIN';
        console.log(url);

        const responseA = await axios.get(url);

        const list = responseA.data.DataList;

        // convert API data for dropdown
        const dropdownData = list.map(item => ({
          label: item.Name, // show Name
          value: item.IDAccount, // store IDAccount
        }));

        setAccount(dropdownData);

        // -------- Fifth API --------
        const urlR = BASE_URL + 'Referrer/Active/List?HexKey=' + HexKey;
        console.log(urlR);

        const responseR = await axios.get(urlR);

        const listR = responseR.data.data;

        // convert API data for dropdown
        const dropdownDataR = listR.map(item => ({
          label: item.Name, // show Name
          value: item.IDReferer, // store IDAccount
        }));

        setReferrer(dropdownDataR);

        // -------- Sixth API --------
        const responseI = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=INDUSTRIES',
        );

        const jsonI = await responseI.json();
        console.log('Full Response:', jsonI);

        if (jsonI?.data?.length > 0) {
          const stateList = jsonI.data.map(item => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));

          setIndustry(stateList);
        }

        // -------- Seventh API --------
        const urlP =
          BASE_URL +
          'Product/List?HexKey=' +
          HexKey +
          '&BusinessID=' +
          user.CompanyCode;
        console.log(urlP);

        const responsePt = await axios.get(urlP);

        const listPT = responsePt.data.DataList;

        // convert API data for dropdown
        const dropdownDataPT = listPT.map(item => ({
          label: item.Name, // show Name
          value: item.IDProduct, // store IDAccount
        }));

        setProduct(dropdownDataPT);

        // -------- Eight API --------
        const responseLC = await fetch(
          BASE_URL + 'Misc/MiscList?HexKey=' + HexKey + '&type=LEADCLASS',
        );

        const jsonLC = await responseLC.json();
        console.log('Full Response:', jsonLC);

        if (jsonLC?.data?.length > 0) {
          const stateList = jsonLC.data.map(item => ({
            label: item.Name.trim(),
            value: item.IDMisc,
          }));

          setLClass(stateList);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };
    loadData(); // call async function
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = daten => {
    const formattedDate = moment(daten).format('DD/MMM/YYYY').toUpperCase();
    setcurrDate(formattedDate);
    console.log(formattedDate);

    hideDatePicker();
  };

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
      IDLead: '0',
      LeadNo: useCode,
      LeadDate: currDate,
      LeadEmail: useempEmail,
      LeadSource: useLeadSourceLabel,
      LeadPriority: usepriorityLabel,
      Industry: useILabel,
      IDAccount: useAvalue,
      IDReferer: useRvalue,
      IDProduct: usePvalue,
      LeadClass: useLCLabel,
      IDUser: useIDUser,
      Remarks: useRemarks,
      EntryUser: useUName,
      CompanyCode: useBusinessID,
    };
    console.log(params);
    
    const url = BASE_URL + 'Lead/Generation/Save?HexKey=' + useHexKey;
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
      navigation.navigate('AppNavDash');
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
        <StatusBar barStyle="light-content" backgroundColor="#000" />
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
        <TouchableOpacity
          style={{
            width: '100%',
            height: 50,
            //borderWidth: 0.4,
            alignSelf: 'center',
            justifyContent: 'center',
            marginBottom: 10,
            marginTop: 5,
          }}
          onPress={showDatePicker}>
          <View pointerEvents="none">
            <TextInput
              label="Lead Date"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ marginBottom: 5 }}
              value={currDate}
              editable={false}
            />
          </View>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          maximumDate={new Date()}
          presentationStyle="overFullScreen" // REQUIRED FOR iOS
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
            data={useLSource}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Lead Source' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              setLeadSourceLabel(item.label);
              //setGvalue(item.value);
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
            data={usePriority}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Priority' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              setpriorityLabel(item.label);
              //setGvalue(item.value);
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
            data={useAccount}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Account' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              //setSLabel(item.label);
              setAvalue(item.value);
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
            data={useReferrer}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Referrer' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              //setSLabel(item.label);
              setRvalue(item.value);
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
            data={useIndustry}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Industries' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              setILabel(item.label);
              //setGvalue(item.value);
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
            data={useProduct}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Product' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              //setSLabel(item.label);
              setPvalue(item.value);
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
            data={useLClass}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Lead Class' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              setLCLabel(item.label);
              //setGvalue(item.value);
              setIsFocus(false);
            }}
          />
        </View>
        <TextInput
          label="Remarks"
          value={useRemarks}
          onChangeText={setRemarks}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={{ backgroundColor: '#fff' }}
          outlineColor="#d6d6d6"
          activeOutlineColor="#4a90e2"
          contentStyle={{ textAlignVertical: 'top' }} // Important for Android
        />
        <View
          style={{
            marginLeft: 5,
            marginRight: 5,
            paddingLeft: 5,
            paddingRight: 5,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <CustomButton label={'Submit'} onPress={() => saveData()} />
          </View>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Lead Generation View');
            }}
            style={{
              flex: 1,
              backgroundColor: '#00967d',
              padding: 20,
              borderRadius: 10,
              marginLeft: 5,
              marginBottom: 30,
            }}>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '700',
                fontSize: 16,
                color: '#ffffff',
              }}>
              View
            </Text>
          </TouchableOpacity>
        </View>
      </KeyBoardNewLayout>
    </ImageBackground>
  );
};

export default LeadGeneration;

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
