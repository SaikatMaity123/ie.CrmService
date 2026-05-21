import { View, Text, ImageBackground, StatusBar, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Checkbox, TextInput } from 'react-native-paper';
import KeyBoardNewLayout from '../components/custom/KeyBoardNewLayout';
import { Dropdown } from 'react-native-element-dropdown';
import CustomButton from '../components/custom/CustomButton';
import { BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MasterProduct = ({ navigation }) => {
  const [useCode, setCode] = useState('');
  const [useName, setName] = useState('');
  const [useHcode, setHcode] = useState('');
  const [useMcode, setMcode] = useState('');
  const [usePcode, setPcode] = useState('');
  const [useMstock, setMstock] = useState('');
  const [useMxstock, setMxstock] = useState('');
  const [usePrate, setPrate] = useState('');
  const [useSrate, setSrate] = useState('');
  const [useRlevel, setRlevel] = useState('');
  const [useBno, setBno] = useState('');
  const [usePno, setPno] = useState('');
  const [description, setDescription] = useState('');
  const [isFocus, setIsFocus] = useState(false);
  const [useGvalue, setGvalue] = useState('');
  const [useCvalue, setCvalue] = useState('');
  const [useGData, setGData] = useState([]);
  const [useCData, setCData] = useState([]);
  const [useUName, setUName] = useState('');
  const [useHexKey, setHexKey] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [checkedValue, setCheckedValue] = useState(false);
  // null = not selected

  //   const handleCheckbox = () => {
  //     setCheckedValue(prev => !prev);
  //     console.log(checkedValue);
  //   };

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

        console.log('Using Company HexKey:', HexKey);

        // -------- First API --------
        const response = await fetch(
          BASE_URL + 'Account/Auto/Code?HexKey=' + HexKey + '&type=PRODUCT',
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
          BASE_URL +
          'ProductGroup/List?HexKey=' +
          HexKey +
          '&BusinessID=' +
          user.CompanyCode,
        );
        console.log(
          BASE_URL +
          'ProductGroup/List?HexKey=' +
          HexKey +
          '&BusinessID=' +
          user.CompanyCode,
        );

        const jsonnew = await responsenew.json();

        if (jsonnew.Status === 'SUCCESS') {
          const formattedData = jsonnew.DataList.map(item => ({
            label: item.Name, // what user sees
            value: item.IDGroup, // actual value
          }));

          setGData(formattedData);
        }
        // -------- Third API --------
        const responseCategory = await fetch(
          BASE_URL +
          'ProductCategory/List?HexKey=' +
          HexKey +
          '&BusinessID=' +
          user.CompanyCode,
        );

        const jsonC = await responseCategory.json();

        if (jsonC.Status === 'SUCCESS') {
          const formattedData = jsonC.DataList.map(item => ({
            label: item.Name, // what user sees
            value: item.IDCategory, // actual value
          }));

          setCData(formattedData);
        }
      } catch (error) {
        console.log('Error:', error);
      }
    };
    loadData(); // call async function
  }, []);

  const saveData = async () => {
    var params = {
      IDProduct: 0,
      Code: useCode,
      Name: useName,
      IDGroup: useGvalue,
      IDCategory: useCvalue,
      HSNCode: useHcode,
      Maker: useMcode,
      BinNo: useBno,
      PartNo: usePno,
      PartCode: usePcode,
      Reorder: useRlevel,
      MinStock: useMstock,
      MaxStock: useMxstock,
      PurchaseRate: usePrate,
      SaleRate: useSrate,
      Description: description,
      EntryUser: useUName,
      BusinessID: useBusinessID,
      MaintainInventory: checkedValue,
    };
    console.log(params);
    const url = BASE_URL + 'Product/Save?HexKey=' + useHexKey;
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
        'Product created successfully',
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
          label="Description"
          value={description}
          onChangeText={setDescription}
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
            marginTop: 5,
            paddingTop: 5,
          }}>
          <Dropdown
            style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
            placeholderStyle={style.placeholderStyle}
            selectedTextStyle={style.selectedTextStyle}
            inputSearchStyle={style.inputSearchStyle}
            iconStyle={style.iconStyle}
            data={useGData}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Group' : '...'}
            searchPlaceholder="Search"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              console.log(item.label);
              console.log(item.value);
              // setSLabel(item.label);
              setGvalue(item.value);
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
            placeholder={!isFocus ? 'Select Category' : '...'}
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
          label="HSN Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useHcode}
          onChangeText={text => setHcode(text)}
        />
        <TextInput
          label="Maker"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useMcode}
          onChangeText={text => setMcode(text)}
        />
        <TextInput
          label="Bin No"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={useBno}
          onChangeText={text => setBno(text)}
        />
        <TextInput
          label="Part No"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={usePno}
          onChangeText={text => setPno(text)}
        />
        <TextInput
          label="Part Code"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          value={usePcode}
          onChangeText={text => setPcode(text)}
        />
        <TextInput
          label="Reorder Level"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          value={useRlevel}
          onChangeText={text => setRlevel(text)}
        />
        <TextInput
          label="Min Stock"
          mode="outlined"
          autoCapitalize="none"
          keyboardType="numeric"
          autoCorrect={false}
          value={useMstock}
          onChangeText={text => setMstock(text)}
        />
        <TextInput
          label="Max Stock"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          value={useMxstock}
          onChangeText={text => setMxstock(text)}
        />
        <TextInput
          label="Purchase Rate"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          value={usePrate}
          onChangeText={text => setPrate(text)}
        />
        <TextInput
          label="Sale Rate"
          mode="outlined"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          value={useSrate}
          onChangeText={text => setSrate(text)}
        />
        <Checkbox
          status={checkedValue ? 'checked' : 'unchecked'}
          onPress={() => setCheckedValue(prev => (prev ? false : true))}
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
      </KeyBoardNewLayout>
    </ImageBackground>
  );
};

export default MasterProduct;
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
