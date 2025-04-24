import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  LogBox,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {openDatabase} from 'react-native-sqlite-storage';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';

//database connection
const db = openDatabase(
  {
    name: 'CRM_db',
    location: 'default',
  },
  () => {
    console.log('Database connected!');
  }, //on success
  error => console.log('Database error', error), //on error
);

const ViewMasterData = () => {
  const [gamesTab, setGamesTab] = useState(1);
  const [useDoctors, setDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');

  useEffect(() => {
    LogBox.ignoreLogs([
      'VirtualizedLists should never be nested',
      'Each child in a list should have a unique "key" prop.',
    ]);

    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const url =
                BASE_URL +
                'Doctor/Mobile/List?Businessid=' +
                user.BusinessID +
                '&EntryUser=' +
                user.Empemail +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log(url);
              let result = await fetch(url);
              result = await result.json();
              setDoctors(result);

              const empurl =
                BASE_URL +
                'Retailer/Mobile/List?Businessid=' +
                user.BusinessID +
                '&EntryUser=' +
                user.Empemail +
                '&IDEmployee=' +
                user.IDEmployee;
              console.log(empurl);
              let result_empurl = await fetch(empurl);
              result_empurl = await result_empurl.json();
              setRetailers(result_empurl);
            } else {
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterDocList',
                  [],
                  (_, results) => {
                    if (results.rows.length > 0) {
                      //console.warn('Table has data');
                      var temp = [];
                      for (let i = 0; i < results.rows.length; ++i) {
                        temp.push(results.rows.item(i));
                      }
                      setDoctors(temp);
                      //console.log(temp);
                    }
                  },
                  (_, error) => {
                    console.log('Error fetching data:', error);
                  },
                );
              });
              db.transaction(tx => {
                tx.executeSql(
                  'SELECT * FROM ViewMasterRetList',
                  [],
                  (_, results) => {
                    if (results.rows.length > 0) {
                      //console.warn('Table has data');
                      var temp = [];
                      for (let i = 0; i < results.rows.length; ++i) {
                        temp.push(results.rows.item(i));
                      }
                      setRetailers(temp);
                      //console.log(temp);
                    }
                  },
                  (_, error) => {
                    console.log('Error fetching data:', error);
                  },
                );
              });
            }
          }, []);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSearch = text => {
    setSearchQuery(text);
  };
  const handleSearchRet = text => {
    setSearchQueryRet(text);
  };

  const ApprovalStatus = item => {
    if (item === 0) {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            color: 'red',
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus : No
        </Text>
      );
    } else if (item === 1) {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            color: 'blue',
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus : Yes
        </Text>
      );
    } else {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus :
        </Text>
      );
    }
  };
  const retApproval = item => {
    if (item === 0) {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            color: 'red',
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus : No
        </Text>
      );
    } else if (item === 1) {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            color: 'blue',
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus : Yes
        </Text>
      );
    } else {
      return (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Lato-Regular',
            margin: 5,
            padding: 5,
            //width: '50%',
            textAlignVertical: 'center',
            //textAli gn: 'center',
            alignItems: 'center',
          }}>
          ApprovalStatus :
        </Text>
      );
    }
  };

  const onSelectSwitch = value => {
    setGamesTab(value);
  };

  const filteredDoctors = useDoctors.filter(item => {
    return (
      item.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredRetailer = useRetailers.filter(item => {
    return (
      item.Name.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Area.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryRet.toLowerCase())
    );
  });
  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
          <CustomViewMaster
            selectionMode={1}
            option1="Master Doctors"
            option2="Master Retailers"
            onSelectSwitch={onSelectSwitch}
          />
        </View>

        {gamesTab == 1 && (
          <View>
            <TextInput
              style={styles.searchBar}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {/* {useDoctors.length ? ( */}
            {filteredDoctors.length ? (
              <View style={styles.areaStyle}>
                <FlatList
                  //data={useDoctors}
                  data={filteredDoctors}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          styles.menu,
                          {
                            backgroundColor: '#ecf0f1',
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Lato-Bold',
                            color: '#000',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAlign: 'center',
                            alignItems: 'center',
                          }}>
                          Name : {item.Name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Regular',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAlign: 'center',
                            alignItems: 'center',
                          }}>
                          Code : {item.Code}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Regular',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAli gn: 'center',
                            alignItems: 'center',
                          }}>
                          Area : {item.Area}
                        </Text>
                        {/* {item.ApprovalStatus === 1 ? (
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              margin: 5,
                              padding: 5,
                              color:'blue',
                              //width: '50%',
                              textAlignVertical: 'center',
                              //textAli gn: 'center',
                              alignItems: 'center',
                            }}>
                            ApprovalStatus : true
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              margin: 5,
                              padding: 5,
                              //width: '50%',
                              color:'red',
                              textAlignVertical: 'center',
                              //textAli gn: 'center',
                              alignItems: 'center',
                            }}>
                            ApprovalStatus : false
                          </Text>
                        )} */}
                        {ApprovalStatus(item.ApprovalStatus)}
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : (
              <SafeAreaView
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Roboto-BoldItalic',
                    fontSize: 18,
                    color: '#FF0000',
                  }}>
                  No Doctors Found
                </Text>
              </SafeAreaView>
            )}
          </View>
        )}
        {gamesTab == 2 && (
          <View>
            <TextInput
              style={styles.searchBar}
              placeholder="Search..."
              value={searchQueryRet}
              onChangeText={handleSearchRet}
            />
            {/* {useRetailers.length ? ( */}
            {filteredRetailer.length ? (
              <View style={styles.areaStyle}>
                <FlatList
                  data={filteredRetailer}
                  showsVerticalScrollIndicator={false}
                  renderItem={({item}) => (
                    <TouchableWithoutFeedback>
                      <View
                        style={[
                          styles.menu,
                          {
                            backgroundColor: '#ecf0f1',
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Lato-Bold',
                            color: '#000',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAlign: 'center',
                            alignItems: 'center',
                          }}>
                          Name : {item.Name}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Regular',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAlign: 'center',
                            alignItems: 'center',
                          }}>
                          Code : {item.Code}
                        </Text>
                        <Text
                          style={{
                            fontSize: 14,
                            fontFamily: 'Lato-Regular',
                            margin: 5,
                            padding: 5,
                            //width: '50%',
                            textAlignVertical: 'center',
                            //textAli gn: 'center',
                            alignItems: 'center',
                          }}>
                          Area : {item.Area}
                        </Text>
                        {/* {item.ApprovalStatus === 1 ? (
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              margin: 5,
                              padding: 5,
                              color: 'blue',
                              //width: '50%',
                              textAlignVertical: 'center',
                              //textAli gn: 'center',
                              alignItems: 'center',
                            }}>
                            ApprovalStatus : true
                          </Text>
                        ) : (
                          <Text
                            style={{
                              fontSize: 14,
                              fontFamily: 'Lato-Regular',
                              margin: 5,
                              padding: 5,
                              //width: '50%',
                              color: 'red',
                              textAlignVertical: 'center',
                              //textAli gn: 'center',
                              alignItems: 'center',
                            }}>
                            ApprovalStatus : false
                          </Text>
                        )} */}
                        {retApproval(item.ApprovalStatus)}
                      </View>
                    </TouchableWithoutFeedback>
                  )}
                />
              </View>
            ) : (
              <SafeAreaView
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: 'Roboto-BoldItalic',
                    fontSize: 18,
                    color: '#FF0000',
                  }}>
                  No Retailers Found
                </Text>
              </SafeAreaView>
            )}
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  );
};

export default ViewMasterData;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
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
    borderRadius: 2,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    paddingLeft: 10,
    paddingRight: 10,
    //paddingTop: 5,
    borderColor: 'black',
    //borderWidth: 1,
    marginLeft: 5,
    marginRight: 5,
    //marginTop: 5,
    //elevation: 5,
    borderRadius: 5,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    paddingLeft: 10,
  },
});
