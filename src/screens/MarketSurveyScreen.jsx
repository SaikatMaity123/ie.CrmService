// Updated MarketSurveyScreen.jsx
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  BackHandler,
  StatusBar,
} from 'react-native';
//import PushNotification from 'react-native-push-notification';
//import messaging from '@react-native-firebase/messaging';
import NetInfo from '@react-native-community/netinfo';
import {Picker} from '@react-native-picker/picker';
import {Dropdown} from 'react-native-element-dropdown';
import {BASE_URL} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import KeyboardAwareLayout from '../components/custom/KeyboardAwareLayout';

const MarketSurveyScreen = () => {
  const navigation = useNavigation();
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [IDEmployee, setIDEmployee] = useState(null);
  const [empEmail, setEmpEmail] = useState(null);
  const [device, setDevice] = useState('');
  const [areaList, setAreaList] = useState([]);
  const typeOptions = ['DOCTOR', 'RETAILER'];
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const hasAutoStartedRef = useRef(false);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [longAnswer, setLongAnswer] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);
  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollRef.current?.scrollToEnd({animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollRef.current?.scrollTo({y: 0, animated: true});
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    //requestNotificationPermission();
    //createNotificationChannel();
    AsyncStorage.getItem('UserData').then(value => {
      if (value) {
        const user = JSON.parse(value);
        setIDEmployee(user.IDEmployee);
        setEmpEmail(user.Empemail);
        setBusinessID(user.BusinessID);
        NetInfo.fetch().then(async state => {
          if (state.isConnected) {
            fetchAreas(user.IDEmployee, user.BusinessID);
          } else {
            Alert.alert('No Internet');
          }
        });
      }
    });

    if (showCountdown && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);

            if (!hasAutoStartedRef.current) {
              hasAutoStartedRef.current = true;
              proceedToMarketSurvey(); // auto-start
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [showCountdown, countdown]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavQuiz'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
      }
    }
  };

  const createNotificationChannel = () => {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          importance: 3,
          vibrate: true,
        },
        created => console.log(`Channel created: ${created}`),
      );
    }
  };

  const fetchAreas = async (IDEmployee, BusinessID) => {
    setLoadingAreas(true);
    try {
      const url = `${BASE_URL}Area/EmployeeWiseAreaList?Businessid=${BusinessID}&IDEmployee=${IDEmployee}`;
      const response = await fetch(url);
      const data = await response.json();
      setAreaList(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load areas.');
    } finally {
      setLoadingAreas(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const url = `${BASE_URL}Survey/TypeWiseCustomerList?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&IDArea=${selectedArea}&Type=${selectedType}`;
      const response = await fetch(url);
      const data = await response.json();
      setCustomerOptions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers.');
    }
  };

  useEffect(() => {
    if (selectedArea && selectedType && IDEmployee && useBusinessID) {
      fetchCustomers();
      setSelectedCustomer('');
    }
  }, [selectedArea, selectedType]);

  const handleOptionPress = optionIndex => {
    const q = currentQuestion;
    const selected =
      q.type === 'multiple'
        ? selectedAnswers.includes(optionIndex)
          ? selectedAnswers.filter(i => i !== optionIndex)
          : [...selectedAnswers, optionIndex]
        : [optionIndex];
    setSelectedAnswers(selected);

    const answerObj = {
      IDQuestion: q.IDQuestion,
      IDSurvey: q.IDSurvey,
      AnswerShortText: '',
      AnswerLongText: '',
    };
    q.options.forEach((_, idx) => {
      answerObj[`Answer${idx + 1}`] = selected.includes(idx);
    });
    setAnswersMap(prev => ({...prev, [q.id]: answerObj}));
  };

  const handleTextAnswerChange = (text, question) => {
    if (question.textType === 'LONG-TEXT') {
      setLongAnswer(text);
    } else {
      setShortAnswer(text);
    }

    setAnswersMap(prev => ({
      ...prev,
      [question.id]: {
        //   IDEmployee : IDEmployee,
        IDQuestion: question.IDQuestion,
        IDSurvey: question.IDSurvey,
        AnswerShortText: question.textType === 'SHORT-TEXT' ? text : '',
        AnswerLongText: question.textType === 'LONG-TEXT' ? text : '',
        Answer1: false,
        Answer2: false,
        Answer3: false,
        Answer4: false,
        Answer5: false,
      },
    }));
  };

  const loadQuestion = index => {
    const question = quizQuestions[index];
    const savedAnswer = answersMap[question.id] || {};

    // Restore options
    const selectedOptions = [];
    question.options?.forEach((_, idx) => {
      if (savedAnswer[`Answer${idx + 1}`]) {
        selectedOptions.push(idx);
      }
    });
    setSelectedAnswers(selectedOptions);

    // Restore text
    if (question.textType === 'SHORT-TEXT') {
      setShortAnswer(savedAnswer?.AnswerShortText || '');
      setLongAnswer(''); // do not preserve value here
    } else if (question.textType === 'LONG-TEXT') {
      setLongAnswer(savedAnswer?.AnswerLongText || '');
      setShortAnswer('');
    }

    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      loadQuestion(currentQuestionIndex + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      loadQuestion(currentQuestionIndex - 1);
    }
  };

  // const startSurvey = async () => {
  //   if (!selectedArea || !selectedType || !selectedCustomer || !mobileNumber.trim()) {
  //     Alert.alert('Incomplete Form', 'Please fill out all fields.');
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const checkUrl = `${BASE_URL}Survey/CheckMarketQuiz?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&IDCustomer=${selectedCustomer}&SurveyType=MARKET`;
  //     const response = await fetch(checkUrl);
  //     const result = await response.json();
  //     if (result?.d === '') {
  //       const StartBody = {
  //         IDParticipants: IDEmployee,
  //         Mobile: mobileNumber,
  //         IDArea: selectedArea,
  //         EntryUser: empEmail,
  //         EntryDevice: `Mobile - ${device}`,
  //         Businessid: useBusinessID,
  //         SurveyType: 'MARKET',
  //         IDCustomer: selectedCustomer,
  //       };
  //       console.log('StartBody', StartBody);
  //       const startRes = await fetch(`${BASE_URL}Survey/MarketParticipantsStart/Save`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(StartBody),
  //       });
  //       const startData = await startRes.json();
  //       if (startData?.result === '') {
  //         const questionsRes = await fetch(`${BASE_URL}Survey/Market/QuestionList?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&SurveyType=MARKET`);
  //         const questionsData = await questionsRes.json();
  //         if (questionsData.result?.length > 0) {
  //           const formatted = questionsData.result.map((q, idx) => ({
  //             id: idx.toString(),
  //             IDQuestion: q.IDQuestion,
  //             IDSurvey: q.IDSurvey,
  //             question: q.Question,
  //             options: [q.Option1, q.Option2, q.Option3, q.Option4, q.Option5].filter(Boolean),
  //             type: q.QuestionType.includes('MULTIPLE')
  //               ? 'multiple'
  //               : q.QuestionType.includes('TEXT')
  //                 ? 'TEXT'
  //                 : 'single',
  //             textType: q.QuestionType,
  //           }));
  //           setQuizQuestions(formatted);
  //           setShowSurvey(true);
  //         } else Alert.alert('No questions found.');
  //       } else Alert.alert('Start Failed', startData.result || 'Unable to begin quiz.');
  //     } else {
  //       Alert.alert('Already Attempted', 'You have already submitted this survey.');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert('Error', 'Failed to start quiz.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const startSurvey = async () => {
    if (
      !selectedArea ||
      !selectedType ||
      !selectedCustomer ||
      !mobileNumber.trim()
    ) {
      Alert.alert('Incomplete Form', 'Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: check already submitted
      const checkUrl = `${BASE_URL}Survey/CheckMarketQuiz?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&IDCustomer=${selectedCustomer}&SurveyType=MARKET`;
      const response = await fetch(checkUrl);
      const result = await response.json();

      if (result?.d !== '') {
        Alert.alert(
          'Already Attempted',
          'You have already submitted this survey.',
        );
        setIsLoading(false);
        return;
      }

      // Step 1.5: scheduling check
      const scheduleUrl = `${BASE_URL}Survey/SurveyScheduling?Businessid=${useBusinessID}&IDParticipants=${IDEmployee}&SurveyType=MARKET`;
      const scheduleRes = await fetch(scheduleUrl);
      const scheduleData = await scheduleRes.json();
      const timerValue = scheduleData?.d;

      if (timerValue && timerValue !== '') {
        // format HH:MM:SS → seconds
        const [h, m, s] = timerValue.split(':').map(Number);
        const totalSeconds = h * 3600 + m * 60 + s;

        hasAutoStartedRef.current = false;
        setCountdown(totalSeconds);
        setShowCountdown(true);
        setIsLoading(false);
        return;
      }

      // no delay — go immediately
      await proceedToMarketSurvey();
    } catch (err) {
      console.error('startSurvey error:', err);
      Alert.alert('Error', 'Failed to start quiz.');
      setIsLoading(false);
    }
  };

  const proceedToMarketSurvey = async () => {
    try {
      const StartBody = {
        IDParticipants: IDEmployee,
        Mobile: mobileNumber,
        IDArea: selectedArea,
        EntryUser: empEmail,
        EntryDevice: `Mobile - ${device}`,
        Businessid: useBusinessID,
        SurveyType: 'MARKET',
        IDCustomer: selectedCustomer,
      };

      console.log('StartBody', StartBody);

      const startRes = await fetch(
        `${BASE_URL}Survey/MarketParticipantsStart/Save`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(StartBody),
        },
      );

      const startData = await startRes.json();

      if (startData?.result !== '') {
        Alert.alert(
          'Start Failed',
          startData.result || 'Unable to begin quiz.',
        );
        return;
      }

      // fetch questions
      const questionsRes = await fetch(
        `${BASE_URL}Survey/Market/QuestionList?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&SurveyType=MARKET`,
      );
      const questionsData = await questionsRes.json();

      if (questionsData.result?.length > 0) {
        const formatted = questionsData.result.map((q, idx) => ({
          id: idx.toString(),
          IDQuestion: q.IDQuestion,
          IDSurvey: q.IDSurvey,
          question: q.Question,
          options: [
            q.Option1,
            q.Option2,
            q.Option3,
            q.Option4,
            q.Option5,
          ].filter(Boolean),
          type: q.QuestionType.includes('MULTIPLE')
            ? 'multiple'
            : q.QuestionType.includes('TEXT')
            ? 'TEXT'
            : 'single',
          textType: q.QuestionType,
        }));

        setQuizQuestions(formatted);
        setShowSurvey(true);
      } else {
        Alert.alert('No questions found.');
      }
    } catch (error) {
      console.error('proceedToMarketSurvey error:', error);
      Alert.alert('Error', 'Failed to start quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const SubmitMarketSurvey = async () => {
    const requestBody = {
      IDParticipants: IDEmployee,
      IDCustomer: selectedCustomer,
      BusinessID: 'MEND-PVTL-890',
      SurveyType: 'MARKET',
      Answers: Object.values(answersMap),
    };

    // Construct API URL
    const apiUrl = BASE_URL + 'Survey/Market/SubmitAnswer';

    console.log('Submitted Data:', JSON.stringify(requestBody));
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData); // Debugging

      // ✅ Check if response is {"result":""}
      if (responseData.result === '') {
        Alert.alert('Success', 'Your Market Survey Submitted Successfully.', [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{name: 'AppNavQuiz'}],
              }),
          },
        ]);
      } else {
        Alert.alert(
          'Error',
          responseData.result || 'Unexpected error occurred.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error submitting Quiz:', error);
      Alert.alert('Error', 'Failed to submit Quiz request. Please try again.', [
        {text: 'OK'},
      ]);
    }
  };

  if (showCountdown) {
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;

    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            backgroundColor: '#ffffff',
          }}>
          <Text style={{fontSize: 18, color: '#444', marginBottom: 8}}>
            You will start your Survey After
          </Text>
          <Text style={{fontSize: 40, fontWeight: 'bold', color: '#005696'}}>
            {`${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </Text>
          <Text style={{fontSize: 14, color: '#777', marginTop: 12}}>
            Please keep this screen open.
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      <SafeAreaView style={styles.container}>
        {!showSurvey ? (
          <KeyboardAwareLayout keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              <Text style={styles.title}>📝 Start Market Survey</Text>

              {/* Area */}
              <Text style={styles.label}>Select Area</Text>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  search
                  maxHeight={250}
                  data={areaList.map(a => ({label: a.Name, value: a.IDArea}))}
                  labelField="label"
                  valueField="value"
                  placeholder="-- Select Area --"
                  searchPlaceholder="Search area..."
                  value={selectedArea}
                  onChange={item => {
                    setSelectedArea(item.value);
                    setSelectedType('');
                    setSelectedCustomer('');
                    setCustomerOptions([]);
                  }}
                />
              </View>

              {/* Type */}
              <Text style={styles.label}>Select Type</Text>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  data={typeOptions.map(t => ({label: t, value: t}))}
                  labelField="label"
                  valueField="value"
                  placeholder="-- Select Type --"
                  value={selectedType}
                  onChange={item => {
                    setSelectedType(item.value);
                    setSelectedCustomer('');
                  }}
                />
              </View>

              {/* Customer */}
              <Text style={styles.label}>Select Customer</Text>
              <View style={styles.dropdownWrapper}>
                <Dropdown
                  style={styles.dropdown}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  search
                  maxHeight={250}
                  data={
                    customerOptions.length > 0
                      ? customerOptions.map(c => ({
                          label: c.Name,
                          value: c.IDCustomer,
                        }))
                      : [{label: 'No Customers Available', value: ''}]
                  }
                  labelField="label"
                  valueField="value"
                  placeholder="-- Select Customer --"
                  searchPlaceholder="Search customer..."
                  value={selectedCustomer}
                  onChange={item => setSelectedCustomer(item.value)}
                />
              </View>

              {/* Mobile */}
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                value={mobileNumber}
                maxLength={10}
                onChangeText={setMobileNumber}
              />
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#005696"
                  style={{marginTop: 20}}
                />
              ) : (
                <TouchableOpacity style={styles.button} onPress={startSurvey}>
                  <Text style={styles.buttonText}>Start Survey</Text>
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAwareLayout>
        ) : isQuizFinished ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Thank you for your time!</Text>
          </View>
        ) : (
          <ScrollView>
            <Text style={styles.questionText}>{currentQuestion?.question}</Text>

            {currentQuestion.type === 'TEXT' ? (
              <View>
                {currentQuestion.textType === 'SHORT-TEXT' && (
                  <Text style={styles.wordLimit}>{'(Word limit : 100)'}</Text>
                )}
                {currentQuestion.textType === 'LONG-TEXT' && (
                  <Text style={styles.wordLimit}>{'(Word limit : 500)'}</Text>
                )}

                <TextInput
                  placeholder="Type your answer"
                  style={[
                    styles.input,
                    currentQuestion.textType === 'LONG-TEXT' &&
                      styles.longTextInput,
                    currentQuestion.textType === 'SHORT-TEXT' &&
                      styles.shortTextInput,
                  ]}
                  value={
                    currentQuestion.textType === 'LONG-TEXT'
                      ? longAnswer
                      : shortAnswer
                  }
                  onChangeText={text =>
                    handleTextAnswerChange(text, currentQuestion)
                  }
                  multiline={true}
                  numberOfLines={
                    currentQuestion.textType === 'LONG-TEXT' ? 6 : 3
                  }
                  maxLength={
                    currentQuestion.textType === 'SHORT-TEXT' ? 100 : 500
                  }
                />
              </View>
            ) : (
              currentQuestion.options.map((option, idx) => (
                <TouchableOpacity
                  key={`${option}-${idx}`}
                  style={[
                    styles.optionButton,
                    selectedAnswers.includes(idx) && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionPress(idx)}>
                  <View style={styles.optionRow}>
                    {/* Selection icon */}
                    {currentQuestion.type === 'multiple' ? (
                      <View style={styles.checkbox}>
                        {selectedAnswers.includes(idx) && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    ) : (
                      <View style={styles.radioOuter}>
                        {selectedAnswers.includes(idx) && (
                          <View style={styles.radioInner} />
                        )}
                      </View>
                    )}
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      currentQuestionIndex === 0 ? 'gray' : '#005696',
                  },
                ]}
                onPress={handlePrevious}
                disabled={currentQuestionIndex === 0}>
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>

              {currentQuestionIndex + 1 < quizQuestions.length ? (
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, {backgroundColor: 'green'}]}
                  onPress={() => SubmitMarketSurvey()}>
                  <Text style={styles.buttonText}>Submit & Finish</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  // container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  questionText: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  optionSelected: {
    backgroundColor: '#e6f9e6',
    borderColor: '#4CAF50',
  },
  optionText: {fontSize: 16, padding: 5},
  button: {
    backgroundColor: '#005696',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  resultContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  resultText: {fontSize: 20, fontWeight: 'bold', marginVertical: 10},
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#333',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  inner: {
    flex: 1,
    padding: 10,
    justifyContent: 'flex-start',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 700,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#005696',
  },
  dropdownWrapper: {
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 0,
    marginBottom: 15,
  },

  dropdown: {
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#999',
  },

  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },

  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderRadius: 8,
  },

  optionRow: {
    flexDirection: 'row',
    //justifyContent: '',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  checkmark: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});

export default MarketSurveyScreen;
