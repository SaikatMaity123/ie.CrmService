import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  LogBox,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native';
import React, {useEffect, useState} from 'react';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import axios from 'axios';

const ViewActivity = () => {
  const [gamesTab, setGamesTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');
  const [useDoctors, setDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);

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
              const wturl =
                BASE_URL +
                'DCR/Mobile/Msr/DCRList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee +
                '&Type=Doctor';
              console.log(wturl);
              var config = {
                method: 'get',
                url: wturl,
              };
              axios(config)
                .then(function (response) {
                  setDoctors(response.data.d);
                })
                .catch(function (error) {
                  console.log(error);
                });

              const rturl =
                BASE_URL +
                'DCR/Mobile/Msr/DCRList?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee +
                '&Type=Retailer';
              console.log(rturl);
              var config = {
                method: 'get',
                url: rturl,
              };
              axios(config)
                .then(function (response) {
                  setRetailers(response.data.d);
                })
                .catch(function (error) {
                  console.log(error);
                });
            }
          }, []);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const filteredDoctors = useDoctors.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const filteredRetailer = useRetailers.filter(item => {
    return (
      item.Customer.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.DCRDate.toLowerCase().includes(searchQueryRet.toLowerCase()) ||
      item.Code.toLowerCase().includes(searchQueryRet.toLowerCase())
    );
  });

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const handleSearchRet = text => {
    setSearchQueryRet(text);
  };
  const onSelectSwitch = value => {
    setGamesTab(value);
  };
  return (
    <ScrollView
      style={{flex: 1, backgroundColor: false}}
      showsVerticalScrollIndicator={false}>
      <SafeAreaView>
        <View style={{marginLeft: 10, marginRight: 10, marginTop: 10}}>
          <CustomViewMaster
            selectionMode={1}
            option1="Doctors"
            option2="Retailers"
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
                          Name : {item.Customer}
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
                          DCR Date : {item.DCRDate}
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
                          Customer Type : {item.CustomerType}
                        </Text>
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
                          Name : {item.Customer}
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
                          DCR Date : {item.DCRDate}
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
                          Customer Type : {item.CustomerType}
                        </Text>
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

export default ViewActivity;

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
