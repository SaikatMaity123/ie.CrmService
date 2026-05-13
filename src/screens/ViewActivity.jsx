import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  LogBox,
  FlatList,
  TouchableWithoutFeedback,
  BackHandler, StatusBar,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CustomViewMaster from '../components/custom/CustomViewMaster';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ViewActivity = ({ navigation }) => {
  const [gamesTab, setGamesTab] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryRet, setSearchQueryRet] = useState('');
  const [useDoctors, setDoctors] = useState([]);
  const [useRetailers, setRetailers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedRetailerIndex, setExpandedRetailerIndex] = useState(null);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavActivity'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

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
      style={{ flex: 1, backgroundColor: false }}
      showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor="#a9ddfaff" barStyle="light-content" />
      <SafeAreaView>
        <View style={{ marginLeft: 10, marginRight: 10, marginTop: 10 }}>
          <CustomViewMaster
            selectionMode={1}
            option1="Doctors"
            option2="Retailers"
            onSelectSwitch={onSelectSwitch}
          />
        </View>
        {gamesTab == 1 && (
          <View style={{ flex: 1 }}>
            {/* 🔍 Search Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                margin: 10,
                paddingHorizontal: 10,
                elevation: 2,
              }}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>
            {filteredDoctors.length ? (
              <FlatList
                data={filteredDoctors}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        marginHorizontal: 10,
                        marginVertical: 6,
                        padding: 12,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowOffset: { width: 0, height: 2 },
                      }}>
                      {/* 👤 Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="doctor"
                          style={{ marginRight: 10 }}
                          size={45} color="#005696" />

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                            }}>
                            Dr. {item.Customer}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#777',
                              fontFamily: 'Lato-Regular',
                            }}>
                            Area: {item.Area}
                          </Text>
                        </View>
                        {/* <TouchableOpacity>
                                          <Text
                                            style={{
                                              color: '#005696',
                                              fontSize: 14,
                                              fontFamily: 'Lato-Bold',
                                            }}>
                                            Edit
                                          </Text>
                                        </TouchableOpacity> */}
                      </View>


                      {/* 📅 Date + Time Row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 10,
                          marginBottom: 5,
                          marginLeft: 10,
                        }}>
                        {/* Split date and time */}
                        {(() => {
                          const datePart = item.DCRDate?.split('(')[0] || '';
                          const timePart = item.DCRDate?.includes('(')
                            ? item.DCRDate.split('(')[1].replace(')', '')
                            : '';
                          return (
                            <>
                              <Ionicons name="calendar-outline" size={18} color="#005696" />
                              <Text
                                style={{
                                  fontSize: 13,
                                  marginLeft: 6,
                                  color: '#555',
                                  fontFamily: 'Lato-Regular',
                                }}>
                                {datePart.trim()}
                              </Text>

                              {timePart ? (
                                <>
                                  <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#005696"
                                    style={{ marginLeft: 20 }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      marginLeft: 6,
                                      color: '#555',
                                      fontFamily: 'Lato-Regular',
                                    }}>
                                    {timePart.trim()}
                                  </Text>
                                </>
                              ) : null}
                            </>
                          );
                        })()}
                      </View>

                      {/* 🔘 Details Button */}
                      <TouchableOpacity
                        onPress={() => toggleExpand(index)}
                        style={{
                          backgroundColor: '#005696',
                          marginTop: 12,
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            fontFamily: 'Lato-Bold',
                          }}>
                          {isExpanded ? 'Hide Details' : 'Details'}
                        </Text>
                      </TouchableOpacity>

                      {/* 📋 Expanded Section */}
                      {isExpanded && (
                        <View
                          style={{
                            marginTop: 10,
                            backgroundColor: '#f4f6f8',
                            borderRadius: 8,
                            padding: 10,
                          }}>
                          <Text style={styles.detailText}>Code: {item.Code}</Text>
                          {/* <Text style={styles.detailText}>Area: {item.Area}</Text> */}
                          <Text style={styles.detailText}>
                            Customer Type: {item.CustomerType}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }}
              />
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
          <View style={{ flex: 1 }}>
            {/* 🔍 Search Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 10,
                margin: 10,
                paddingHorizontal: 10,
                elevation: 2,
              }}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchBar}
                placeholder="Search..."
                value={searchQueryRet}
                onChangeText={handleSearchRet}
              />
            </View>
            {filteredRetailer.length ? (
              <FlatList
                data={filteredRetailer}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item, index }) => {
                  const isExpanded = expandedRetailerIndex === index;
                  return (
                    <View
                      style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        marginHorizontal: 10,
                        marginVertical: 6,
                        padding: 12,
                        elevation: 3,
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowOffset: { width: 0, height: 2 },
                      }}>
                      {/* 🏪 Header */}
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                          name="store-outline"
                          size={45}
                          color="#005696"
                          style={{ marginRight: 10 }}
                        />

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontFamily: 'Lato-Bold',
                              color: '#000',
                            }}>
                            {item.Customer}
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#777',
                              fontFamily: 'Lato-Regular',
                            }}>
                            Area: {item.Area}
                          </Text>
                        </View>
                      </View>

                      {/* 📅 Date + Time */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 10,
                          marginBottom: 5,
                          marginLeft: 10,
                        }}>
                        {(() => {
                          const datePart = item.DCRDate?.split('(')[0] || '';
                          const timePart = item.DCRDate?.includes('(')
                            ? item.DCRDate.split('(')[1].replace(')', '')
                            : '';
                          return (
                            <>
                              <Ionicons name="calendar-outline" size={18} color="#005696" />
                              <Text
                                style={{
                                  fontSize: 13,
                                  marginLeft: 6,
                                  color: '#555',
                                  fontFamily: 'Lato-Regular',
                                }}>
                                {datePart.trim()}
                              </Text>

                              {timePart ? (
                                <>
                                  <Ionicons
                                    name="time-outline"
                                    size={18}
                                    color="#005696"
                                    style={{ marginLeft: 20 }}
                                  />
                                  <Text
                                    style={{
                                      fontSize: 13,
                                      marginLeft: 6,
                                      color: '#555',
                                      fontFamily: 'Lato-Regular',
                                    }}>
                                    {timePart.trim()}
                                  </Text>
                                </>
                              ) : null}
                            </>
                          );
                        })()}
                      </View>

                      {/* 🔘 Details Button */}
                      <TouchableOpacity
                        onPress={() =>
                          setExpandedRetailerIndex(isExpanded ? null : index)
                        }
                        style={{
                          backgroundColor: '#005696',
                          marginTop: 12,
                          borderRadius: 8,
                          paddingVertical: 8,
                          alignItems: 'center',
                        }}>
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: 14,
                            fontFamily: 'Lato-Bold',
                          }}>
                          {isExpanded ? 'Hide Details' : 'Details'}
                        </Text>
                      </TouchableOpacity>

                      {/* 📋 Expanded Section */}
                      {isExpanded && (
                        <View
                          style={{
                            marginTop: 10,
                            backgroundColor: '#f4f6f8',
                            borderRadius: 8,
                            padding: 10,
                          }}>
                          <Text style={styles.detailText}>Code: {item.Code}</Text>
                          {/* <Text style={styles.detailText}>Area: {item.Area}</Text> */}
                          <Text style={styles.detailText}>
                            Customer Type: {item.CustomerType}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                }}
              />
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
    flex: 1,
    marginLeft: 8,
    paddingVertical: 8,
    fontSize: 15
  },
});
