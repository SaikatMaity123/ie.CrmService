import {
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import CustomSwitch from '../components/custom/CustomSwitch';
import {BASE_URL} from '@env';
import NetInfo from '@react-native-community/netinfo';

const TourViewScreen = props => {
  const [data, setData] = useState([]);
  const [dataBusiness, setDataBusiness] = useState('');
  const [gamesTab, setGamesTab] = useState(1);

  var cYear = moment().year();

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setDataBusiness(user.BusinessID);
          //console.warn(props.route.params.month, props.route.params.year);
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
    const url =
      BASE_URL +
      'TourProgram/List?Businessid=' +
      businessID +
      '&Month=' +
      month +
      '&Year=' +
      year +
      '&IDEmployee=' +
      idEmp;
    console.log(url);
    let result = await fetch(url);
    result = await result.json();
    //console.log('Main '+result);
    setData(result);
  };

  const onSelectSwitch = value => {
    setGamesTab(value);
  };
  const onDelete = async item => {
    //Alert.alert(item);
    let result = await fetch(
      BASE_URL +
        'TourProgram/Delete?Businessid=' +
        dataBusiness +
        '&IDTourProgram=' +
        item,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify(data_api),
      },
    );

    result = await result.json();

    if (result.result === '') {
      Alert.alert(
        'Success',
        'Record Successfully Deleted',
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
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={{marginLeft: 5, marginRight: 5, marginTop: 5}}>
        <CustomSwitch
          selectionMode={1}
          option1="Areas"
          option2="Doctors"
          option3="Retailers"
          option4="Visit With"
          onSelectSwitch={onSelectSwitch}
        />
      </View>
      <View style={styles.container}>
        {data.length ? (
          <FlatList
            data={data}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => (
              <View
                style={[
                  styles.menu,
                  {
                    backgroundColor: '#ecf0f1',
                  },
                ]}>
                <TouchableWithoutFeedback>
                  <View>
                    {item.Rejected === false ? (
                      <View
                        style={[
                          styles.menu,
                          {
                            backgroundColor: '#c2dec6',
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Roboto-Bold',
                            color: '#000',
                            marginTop: 5,
                            marginBottom: 5,
                            paddingTop: 5,
                            paddingBottom: 5,
                            flex: 1,
                            textAlign: 'center',
                          }}>
                          {item.TourDate + ' ' + '(' + item.TourDayName + ')'}
                        </Text>
                        {item.Approved === false ? (
                          <AntDesign
                            name="delete"
                            size={30}
                            color="red"
                            onPress={() => {
                              onDelete(item.IDTourProgram);
                            }}
                          />
                        ) : null}
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.menu,
                          {
                            backgroundColor: '#FF7F7F',
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                            alignItems: 'center',
                          },
                        ]}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: 'Roboto-Bold',
                            color: '#000',
                            marginTop: 5,
                            marginBottom: 5,
                            paddingTop: 5,
                            paddingBottom: 5,
                            flex: 1,
                            textAlign: 'center',
                          }}>
                          {item.TourDate + ' ' + '(' + item.TourDayName + ')'}
                        </Text>
                        {item.Approved === false ? (
                          <AntDesign
                            name="delete"
                            size={30}
                            color="#880808"
                            onPress={() => {
                              onDelete(item.IDTourProgram);
                            }}
                          />
                        ) : null}
                      </View>
                    )}

                    <View
                      style={[
                        styles.menu,
                        {
                          backgroundColor: '#ecf0f1',
                          justifyContent: 'space-between',
                          //flexDirection: 'row',
                          alignItems: 'center',
                        },
                      ]}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          padding: 5,
                          textAlign: 'center',
                        }}>
                        Morning : {item.MorningWorktypeName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          padding: 5,
                          textAlign: 'center',
                        }}>
                        Evening : {item.EveningWorktypeName}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: 'Lato-Regular',
                          color: '#000',
                          padding: 5,
                          textAlign: 'center',
                        }}>
                        Remarks : {item.Remarks}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
                {gamesTab == 1 && (
                  <View>
                    {item.Areas.length ? (
                      <View style={styles.areaStyle}>
                        <FlatList
                          data={item.Areas}
                          renderItem={({item}) => (
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  styles.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                  },
                                ]}>
                                <Text style={styles.menuItem}>
                                  {item.Name + ' ' + '(' + item.Shift + ')'}
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
                            padding: 5,
                            margin: 5,
                            color: '#FF0000',
                          }}>
                          No Areas Found
                        </Text>
                      </SafeAreaView>
                    )}
                  </View>
                )}
                {gamesTab == 2 && (
                  <View>
                    {item.Doctors.length ? (
                      <View style={styles.areaStyle}>
                        <FlatList
                          data={item.Doctors}
                          renderItem={({item}) => (
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  styles.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                  },
                                ]}>
                                <Text style={styles.menuItem}>
                                  {item.Name + ' ' + '(' + item.Shift + ')'}
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
                            padding: 5,
                            margin: 5,
                            color: '#FF0000',
                          }}>
                          No Doctors Found
                        </Text>
                      </SafeAreaView>
                    )}
                  </View>
                )}
                {gamesTab == 3 && (
                  <View>
                    {item.Retailers.length ? (
                      <View style={styles.areaStyle}>
                        <FlatList
                          data={item.Retailers}
                          renderItem={({item}) => (
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  styles.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                  },
                                ]}>
                                <Text style={styles.menuItem}>
                                  {item.Name + ' ' + '(' + item.Shift + ')'}
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
                            padding: 5,
                            margin: 5,
                            color: '#FF0000',
                          }}>
                          No Retailers Found
                        </Text>
                      </SafeAreaView>
                    )}
                  </View>
                )}
                {gamesTab == 4 && (
                  <View>
                    {item.VisitWiths.length ? (
                      <View style={styles.areaStyle}>
                        <FlatList
                          data={item.VisitWiths}
                          renderItem={({item}) => (
                            <TouchableWithoutFeedback>
                              <View
                                style={[
                                  styles.menu,
                                  {
                                    backgroundColor: '#ecf0f1',
                                  },
                                ]}>
                                <Text style={styles.menuItem}>
                                  {item.Name + ' ' + '(' + item.Shift + ')'}
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
                            padding: 5,
                            margin: 5,
                            color: '#FF0000',
                          }}>
                          No Visit Data Found
                        </Text>
                      </SafeAreaView>
                    )}
                  </View>
                )}
              </View>
            )}
          />
        ) : (
          <SafeAreaView
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text
              style={{
                fontFamily: 'Roboto-BoldItalic',
                fontSize: 25,
                color: '#FF0000',
              }}>
              No Data Found
            </Text>
          </SafeAreaView>
        )}
      </View>
    </SafeAreaView>
  );
};

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

    // ANDROID SHADOW
    elevation: 10,

    // iOS SHADOW
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    backgroundColor: '#fff', // required on iOS for shadow to show
    borderRadius: 6,
  },

  menuItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#000',
    margin: 5,
    padding: 5,
    textAlignVertical: 'center',
    textAlign: 'center',
    alignItems: 'center', // Centered horizontally
  },
  areaStyle: {
    padding: 10,
    borderColor: 'black',
    //borderWidth: 1,
    margin: 5,
    //elevation: 5,
    borderRadius: 5,
  },
});

export default TourViewScreen;
