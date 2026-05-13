// DPCScreen.js
import { View, Text, BackHandler, Alert, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import axios from 'axios';
import CustomButton from '../components/custom/CustomButton';
import Feather from 'react-native-vector-icons/Feather';

const DPCScreen = ({ navigation }) => {
  const route = useRoute();
  const { dpcData, areaList, doctorList: passedDoctorList, retailerList: passedRetailerList } = route.params || {};

  const [useDivision, setDivision] = useState('');
  const [useHQ, setHQ] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpNo, setEmpNo] = useState('');
  const [useEmpname, setEmpname] = useState('');
  const [useDesignation, setDesignation] = useState('');
  const [dpcList, setDpcList] = useState([]);
  const [selectedDpc, setSelectedDpc] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFocus, setIsFocus] = useState(false);
  const [areaData, setAreaData] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [retailerList, setRetailerList] = useState([]);
  const [selectedRetailers, setSelectedRetailers] = useState([]);
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useIDEmployeeS, setIDEmployeeS] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  let jsonArray = [];

  useEffect(() => {
    AsyncStorage.getItem('UserData').then(value => {
      if (value != null) {
        let user = JSON.parse(value);
        setHQ(user.HQ);
        setEmpNo(user.Empno);
        setEmpname(user.Empname);
        setDivision(user.Division);
        setDesignation(user.Designation);
        setBusinessID(user.BusinessID);
        setIDEmployee(`${user.IDEmployee}`);
        setIDEmployeeS(user.IDEmployee);
        setEmpEmail(user.Empemail);

        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            try {
              const dpcUrl = `${BASE_URL}DPC/DPCNO/List?Businessid=${user.BusinessID}`;
              const dpcResponse = await fetch(dpcUrl);
              const dpcJson = await dpcResponse.json();
              if (dpcJson.Status === 'SUCCESS') {
                const formattedDpc = dpcJson.Result.map(item => ({
                  label: item.No,
                  value: item.IDDPCNo.toString(),
                }));
                setDpcList(formattedDpc);
              }
            } catch (error) {
              console.error('Failed to fetch DPC list:', error);
            }

            try {
              const areaResponse = await axios.get(`${BASE_URL}Area/EmployeeWiseAreaList?Businessid=${user.BusinessID}&IDEmployee=${user.IDEmployee}`);
              const formattedArea = areaResponse.data.map(area => ({
                label: area.Name,
                value: area.IDArea.toString(),
              }));
              setAreaData(formattedArea);
            } catch (error) {
              console.error('Failed to fetch area list:', error);
            }

            setLoading(false);
          } else {
            Alert.alert('No Internet Connection', 'Please check your internet connection and try again.');
          }
        });
      }
    });
  }, []);

  useEffect(() => {
    if (dpcData) {
      setSelectedDpc(dpcData.DpcNo?.toString() || dpcData.DPCNO?.toString() || '');
      setDivision(dpcData.Division || '');
      setHQ(dpcData.HQ || '');
      setDesignation(dpcData.Designation || '');
      setEmpname(dpcData.Employee || '');
    }

    if (Array.isArray(areaList) && areaList.length > 0) {
      const selected = areaList.map(a => a.IDArea.toString());
      setSelectedAreas(selected);
      multiSelectArea(selected);
    }

    if (Array.isArray(passedDoctorList) && passedDoctorList.length > 0) {
      const docDropdownData = passedDoctorList.map(doc => ({
        label: doc.Doctor || doc.Name,
        value: doc.IDDoctor.toString(),
      }));
      const selected = docDropdownData.map(d => d.value);
      setDoctorList(docDropdownData);
      setSelectedDoctors(selected);
    }

    if (Array.isArray(passedRetailerList) && passedRetailerList.length > 0) {
      const retDropdownData = passedRetailerList.map(ret => ({
        label: ret.Retailer || ret.Name,
        value: ret.IDRetailer.toString(),
      }));
      const selected = retDropdownData.map(r => r.value);
      setRetailerList(retDropdownData);
      setSelectedRetailers(selected);
    }
  }, [dpcData, areaList, passedDoctorList, passedRetailerList]);

  // useFocusEffect(
  //   useCallback(() => {
  //     const onBackPress = () => {
  //       navigation.navigate('AppNavScreen');
  //       return true;
  //     };
  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //     return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   }, [navigation])
  // );

  const multiSelectArea = async (customSelectedAreas = selectedAreas) => {
    jsonArray = customSelectedAreas.map(item => ({ IDArea: parseInt(item, 10) }));
    const payload = {
      IDBusiness: useBusinessID,
      IDEmployee: useIDEmployee,
      Areas: jsonArray,
    };
    const url = `${BASE_URL}DPC/Areas/Doctor/Retailer/List`;
    try {
      const response = await axios.post(url, payload);
      const { Status, Result } = response.data;
      if (Status === 'SUCCESS') {
        if (Result?.Doctors?.length > 0) {
          const formattedDoctors = Result.Doctors.map(doc => ({
            label: doc.Name,
            value: doc.IDDoctor.toString(),
          }));
          setDoctorList(prev => [...new Map([...prev, ...formattedDoctors].map(item => [item.value, item])).values()]);
        }
        if (Result?.Retailers?.length > 0) {
          const formattedRetailers = Result.Retailers.map(ret => ({
            label: ret.Name,
            value: ret.IDRetailer.toString(),
          }));
          setRetailerList(prev => [...new Map([...prev, ...formattedRetailers].map(item => [item.value, item])).values()]);
        }
      }
    } catch (error) {
      console.log('API Error:', error);
      Alert.alert('Error', 'Failed to load doctors and retailers');
    }
  };

  const save = async () => {
    if (!selectedDpc || selectedAreas.length === 0 || selectedDoctors.length === 0 || selectedRetailers.length === 0) {
      Alert.alert('Error', 'Please complete all fields');
      return;
    }
    const selectedDoctorData = doctorList.filter(doc => selectedDoctors.includes(doc.value)).map(doc => ({ IDDoctor: doc.value, Name: doc.label }));
    const selectedRetailerData = retailerList.filter(ret => selectedRetailers.includes(ret.value)).map(ret => ({ IDRetailer: ret.value, Name: ret.label }));
    const data_api = {
      IDDPC: dpcData?.IDDPC || 0,
      IDEmployee: useIDEmployeeS,
      IDDPCNo: selectedDpc,
      EntryUser: empEmail,
      IDBusiness: useBusinessID,
      Doctors: selectedDoctorData,
      Retailers: selectedRetailerData,
    };
    try {
      const response = await fetch(BASE_URL + 'DPC/MSR/Save', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data_api),
      });
      const result = await response.json();
      if (result.Result === '') {
        Alert.alert('Success', 'Record Successfully Saved', [{ text: 'Ok', onPress: () => navigation.navigate('AppNavScreen') }], { cancelable: false });
      } else {
        Alert.alert('Error', result.Result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save data');
    }
  };

  return (
    <KeyboardAwareLayout>
      <View style={{ padding: 5, margin: 5 }}>
        <TextInput label="Employee" mode="outlined" value={useEmpname} editable={false} style={{ marginBottom: 5 }} />
        <TextInput label="Division" mode="outlined" value={useDivision} editable={false} style={{ marginBottom: 5 }} />
        <TextInput label="Designation" mode="outlined" value={useDesignation} editable={false} style={{ marginBottom: 5 }} />
        <TextInput label="HQ" mode="outlined" value={useHQ} editable={false} style={{ marginBottom: 5 }} />
        <Dropdown
          style={[style.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={style.placeholderStyle}
          selectedTextStyle={style.selectedTextStyle}
          inputSearchStyle={style.inputSearchStyle}
          iconStyle={style.iconStyle}
          data={dpcList}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select DPC NO' : '...'}
          searchPlaceholder="Search..."
          value={selectedDpc}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedDpc(item.value);
            setIsFocus(false);
          }}
          disable={loading}
        />
        <MultiSelect
          style={style.dropdown}
          data={areaData}
          labelField="label"
          valueField="value"
          placeholder="Select Area"
          value={selectedAreas}
          onChange={item => {
            setSelectedAreas(item);
            multiSelectArea(item);
          }}
          search
          searchPlaceholder="Search Area..."
          selectedStyle={style.selectedStyle}
          selectedTextStyle={style.selectedTextStylemultiselect}
          itemTextStyle={style.itemTextStyle}
          renderItem={(item, selected) => (
            <View style={[style.itemContainer, selected && style.itemSelected]}>
              <Feather
                name={selected ? 'check-square' : 'square'}
                size={18}
                color={selected ? '#fff' : '#999'}
                style={style.checkIcon}
              />
              <Text style={[style.itemText, selected && { color: '#fff' }]}>
                {item.label}
              </Text>
            </View>
          )}
        />
        <MultiSelect
          style={style.dropdown}
          data={doctorList}
          labelField="label"
          valueField="value"
          placeholder="Select Doctor"
          value={selectedDoctors}
          onChange={item => setSelectedDoctors(item)}
          selectedStyle={style.selectedStyle}
          selectedTextStyle={style.selectedTextStylemultiselect}
          search
          searchPlaceholder="Search Doctor..."
          renderItem={(item, selected) => (
            <View style={[style.itemContainer, selected && style.itemSelected]}>
              <Feather
                name={selected ? 'check-square' : 'square'}
                size={18}
                color={selected ? '#fff' : '#999'}
                style={style.checkIcon}
              />
              <Text style={[style.itemText, selected && { color: '#fff' }]}>
                {item.label}
              </Text>
            </View>
          )}
        />


        <MultiSelect
          style={style.dropdown}
          data={retailerList}
          labelField="label"
          valueField="value"
          placeholder="Select Retailer"
          value={selectedRetailers}
          onChange={item => setSelectedRetailers(item)}
          selectedStyle={style.selectedStyle}
          selectedTextStyle={style.selectedTextStylemultiselect}
          search
          searchPlaceholder="Search Retailer..."
          renderItem={(item, selected) => (
            <View style={[style.itemContainer, selected && style.itemSelected]}>
              <Feather
                name={selected ? 'check-square' : 'square'}
                size={18}
                color={selected ? '#fff' : '#999'}
                style={style.checkIcon}
              />
              <Text style={[style.itemText, selected && { color: '#fff' }]}>
                {item.label}
              </Text>
            </View>
          )}
        />

        <CustomButton label={'Save'} onPress={save} />
      </View>
    </KeyboardAwareLayout>
  );
};

export default DPCScreen;

const style = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginVertical: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  selectedStyle: {
    borderRadius: 12,
    backgroundColor: '#67BC45',
    padding: 5,
  },
  selectedTextStylemultiselect: {
    color: '#fff',          // ✅ White text inside green badge
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  itemSelected: {
    backgroundColor: '#93C83D',
  },
  itemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 10,
  },
  checkIcon: {
    width: 20,
    textAlign: 'center',
  },
});
