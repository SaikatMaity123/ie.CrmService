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
//import PushNotification from 'react-native-push-notification';
import {showLocalNotification} from '../services/notifications';

const RequestApprovalScreen = props => {
  var cYear = moment().year();
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [useBusinessID, setBusinessID] = useState('');
  const [username, setUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [useManagerToken, setuseManagerToken] = useState('');
  const [empEmail, setuseEmailID] = useState('');
  const [empPassword, setusePassword] = useState('');
  const date = moment().format('DD-MM-YYYY HH:mm:ss');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
    getAccessToken();
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setBusinessID(user.BusinessID);
          setUsername(user.Empname);
          setuseManagerToken(user.ManagerToken);
          setuseEmailID(user.Empemail);
          setusePassword(user.Password);
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

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (!hasPermission) {
            const result = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
              {
                title: 'Notification Permission',
                message: 'This app wants to send you notifications',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            if (result === PermissionsAndroid.RESULTS.GRANTED) {
              console.log('Permission granted');
            } else {
              Alert.alert('Notification permission denied');
            }
          }
        } catch (err) {
          console.warn('Permission request error:', err);
        }
      }
    }
  };
  const getAccessToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}Authentication/Generatetoken`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Token request failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data && data.Token) {
        console.log('Access Token:', data.Token);

        // Optionally store in AsyncStorage or state
        // await AsyncStorage.setItem('AccessToken', data.Token);
        setAccessToken(data.Token);

        return data.Token;
      } else {
        console.warn('No token returned from API');
        return null;
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
      return null;
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

  // const renderItem = ({ item }) => {
  //   //console.log(item.Requested);

  //   if (item.Requested === false) {
  //     return (
  //       <TouchableWithoutFeedback>
  //         <View
  //           style={[
  //             styles.menu,
  //             {
  //               backgroundColor: '#ecf0f1',
  //               //justifyContent: 'space-around',
  //               flexDirection: 'row',
  //               alignItems: 'center',
  //             },
  //           ]}>
  //           <CheckBox
  //             checked={selectedItems.includes(item.IDTourProgram)}
  //             onPress={() => toggleItemSelection(item.IDTourProgram)}
  //           />
  //           <View>
  //             <Text style={styles.menuItem}>TourDate : {item.TourDate}</Text>
  //             <Text style={styles.menuItem}>
  //               Morning Worktype : {item.MorningWorktype.Name}
  //             </Text>
  //             <Text style={styles.menuItem}>
  //               Evening Worktype : {item.EveningWorktype.Name}
  //             </Text>
  //           </View>
  //         </View>
  //       </TouchableWithoutFeedback>
  //     );
  //   }
  // };

  const renderItem = ({item}) => {
    return (
      <TouchableWithoutFeedback>
        <View
          style={[
            styles.menu,
            {
              backgroundColor: '#ecf0f1',
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
              Morning Worktype : {item.MorningWorktype?.Name}
            </Text>
            <Text style={styles.menuItem}>
              Evening Worktype : {item.EveningWorktype?.Name}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  // const toggleItemSelection = itemID => {
  //   if (selectedItems.includes(itemID)) {
  //     setSelectedItems(selectedItems.filter(item => item !== itemID));
  //   } else {
  //     // Item is not selected, so add it to the selectedItems array
  //     //setSelectedItems([...selectedItems, itemId]);
  //     setSelectedItems([...selectedItems, itemID]);
  //   }
  // };

  const toggleItemSelection = itemID => {
    let updated;

    if (selectedItems.includes(itemID)) {
      updated = selectedItems.filter(id => id !== itemID);
    } else {
      updated = [...selectedItems, itemID];
    }

    setSelectedItems(updated);

    // Update Select All toggle based on changes
    if (updated.length === filteredData.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      // Unselect everything
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      // Select all IDs from filteredData
      const allIds = filteredData.map(item => item.IDTourProgram);
      setSelectedItems(allIds);
      setSelectAll(true);
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
        showLocalNotification(
          `Hi ${username}`,
          `You Successfully submit your Tourplan !.`,
        );
        const token = await getAccessToken(); // get Bearer token
        const messageTitle = 'New Tour Program Submitted';
        const messageBody = `Employee ${username} submitted the Tour Program successfully at ${date} \n Please review and approve.`;
        await sendNotificationToManager(
          useManagerToken,
          messageTitle,
          messageBody,
          token,
        );
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

  const sendNotificationToManager = async (
    managerToken,
    title,
    body,
    accessToken,
  ) => {
    if (!managerToken || managerToken.trim() === '') {
      console.warn(
        '⚠️ No manager FCM token available — skipping notification.',
      );
      return;
    }
    try {
      const url =
        'https://fcm.googleapis.com/v1/projects/iecrmnotificationapp-5ed0c/messages:send';

      const message = {
        message: {
          token: managerToken,
          notification: {title, body},
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('✅ Notification sent successfully');
        return;
      }

      // Parse FCM error response
      let err;
      try {
        err = await response.json();
      } catch {
        console.warn('⚠️ FCM error not JSON');
        return;
      }

      console.warn('❌ Notification failed:', JSON.stringify(err, null, 2));

      const isUnregistered = err?.error?.details?.some(
        d => d.errorCode === 'UNREGISTERED',
      );

      if (isUnregistered) {
        console.log('⚠️ Manager token invalid — attempting refresh.');
        await regenerateManagerTokenLocal(managerToken);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const regenerateManagerTokenLocal = async oldToken => {
    try {
      const loginBody = {
        businessid: useBusinessID,
        email: empEmail,
        password: empPassword,
      };

      const response = await fetch(`${BASE_URL}/login/validlogin`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(loginBody),
      });

      const data = await response.json();

      if (data?.Success && data?.Token) {
        const newToken = data.Token.trim();
        const oldTrimmed = oldToken?.trim();

        if (newToken === oldTrimmed) {
          console.log('ℹ️ New FCM token same as previous — skipping update.');
        } else {
          console.log('✅ New FCM token detected:', newToken);
          // Update locally only
          useManagerToken = newToken; // or setManagerToken(newToken);
        }
      } else {
        console.warn('⚠️ Failed to regenerate FCM token.');
      }
    } catch (error) {
      console.error('Error regenerating FCM token:', error);
    }
  };

  const filteredData = data.filter(x => x.Requested === false);

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
          <>
            <CheckBox
              title="Select All"
              checked={selectAll}
              onPress={toggleSelectAll}
              containerStyle={{backgroundColor: 'transparent', borderWidth: 0}}
            />
            <FlatList data={filteredData} renderItem={renderItem} />
          </>
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
    // iOS SHADOW
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.20,
    shadowRadius: 3.84,
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
