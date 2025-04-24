import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import CustomButton from '../components/custom/CustomButton';
import {CheckBox} from 'react-native-elements';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';

const RequestApprovalScreen = props => {
  var cYear = moment().year();
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [useBusinessID, setBusinessID] = useState('');

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          NetInfo.fetch().then(state => {
            if (state.isConnected) {
              getApiData(
                user.BusinessID,
                props.route.params.month,
                props.route.params.year,
                user.IDEmployee,
              );
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getApiData = async (businessID, month, year, idEmp) => {
    const shortMonth = month.slice(0, 3);
    console.log(shortMonth); // Output: "Jan"
    const url =
      BASE_URL +
      'TourProgram/RequestList?Businessid=' +
      businessID +
      '&Month=' +
      shortMonth +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    //console.log(result);
    setData(result);
  };

  const renderItem = ({item}) => {
    //console.log(item.Requested);

    if (item.Requested === false) {
      return (
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: '#ecf0f1',
                //justifyContent: 'space-around',
                flexDirection: 'row',
                alignItems: 'center',
              },
            ]}>
            <CheckBox
              checked={selectedItems.includes(item.IDTourProgram)}
              onPress={() => toggleItemSelection(item.IDTourProgram)}
            />
            <View>
              <Text style={styles.menuItem}>TourDate : {item.TourDate}</Text>
              <Text style={styles.menuItem}>
                Morning Worktype : {item.MorningWorktype.Name}
              </Text>
              <Text style={styles.menuItem}>
                Evening Worktype : {item.EveningWorktype.Name}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  };

  const toggleItemSelection = itemID => {
    if (selectedItems.includes(itemID)) {
      setSelectedItems(selectedItems.filter(item => item !== itemID));
    } else {
      // Item is not selected, so add it to the selectedItems array
      //setSelectedItems([...selectedItems, itemId]);
      setSelectedItems([...selectedItems, itemID]);
    }
  };

  const submit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Please Select An Item');
    } else {
      //console.warn(selectedItems);
      let Tprgrm = [];
      selectedItems.map(function (value) {
        Tprgrm.push({
          IDTourProgram: value,
          Requested: true,
          Businessid: useBusinessID,
        });
      });
      console.log(Tprgrm);
      let result = await fetch(BASE_URL + 'TourProgram/RequestSave', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Tprgrm),
      });

      result = await result.json();
      console.log(result);
      if (result.result === '') {
        Alert.alert(
          'Success',
          'Record Successfully Saved',
          [
            {
              text: 'Ok',
              onPress: () => props.navigation.navigate('Tour Plan Submission'),
            },
          ],
          {cancelable: false},
        );
      } else {
        Alert.alert(result);
      }
    }
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        {data.length ? (
          // <FlatList
          //   data={data}
          //   renderItem={({item}) => (
          //     <TouchableWithoutFeedback>
          //       <View
          //         style={[
          //           styles.menu,
          //           {
          //             backgroundColor: '#ecf0f1',
          //             //justifyContent: 'space-around',
          //             flexDirection: 'row',
          //             alignItems: 'center',
          //           },
          //         ]}>
          //         <CheckBox
          //           checked={selectedItems.includes(item.IDTourProgram)}
          //           onPress={() => toggleItemSelection(item.IDTourProgram)}
          //         />
          //         <View>
          //           <Text style={styles.menuItem}>
          //             TourDate : {item.TourDate}
          //           </Text>
          //           <Text style={styles.menuItem}>
          //             Morning Worktype : {item.MorningWorktype.Name}
          //           </Text>
          //           <Text style={styles.menuItem}>
          //             Evening Worktype : {item.EveningWorktype.Name}
          //           </Text>
          //         </View>
          //       </View>
          //     </TouchableWithoutFeedback>
          //   )}
          // />
          <FlatList data={data} renderItem={renderItem} />
        ) : (
          <SafeAreaView
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <Text
              style={{
                fontFamily: 'Roboto-BoldItalic',
                fontSize: 18,
                color: '#FF0000',
              }}>
              No Data Found
            </Text>
          </SafeAreaView>
        )}
        <CustomButton label={'Submit'} onPress={() => submit()} />
      </View>
    </SafeAreaView>
  );
};

export default RequestApprovalScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
  menu: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 5,
    padding: 5,
    //width: 140,
    //height: 135,
    elevation: 5,
    borderRadius: 5,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 2,
    padding: 2,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    padding: 10,
    borderColor: 'black',
    borderWidth: 1,
    margin: 5,
    //elevation: 5,
    borderRadius: 5,
  },
});
