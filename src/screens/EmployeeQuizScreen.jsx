import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
  BackHandler,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { BASE_URL } from '@env';
import moment from 'moment';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const EmployeeQuizScreen = ({ navigation }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [device, setDevice] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [useEmpname, setEmpname] = useState('');
  const [useHQ, setHQ] = useState('');
  const [useManager, setManager] = useState('');
  const [useIDEmployee, setIDEmployee] = useState('');
  const [useBusinessID, setBusinessID] = useState('');
  const [useEmpemail, setEmpemail] = useState('');
  const [useIDSurvey, setIDSurvey] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [data, setData] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const hasAutoStartedRef = useRef(false);

  const formatDate = date => {
    return moment(date).format('DD-MMM-YYYY'); // '03-Apr-2025'
  };

  const today = new Date();
  const todayDate = formatDate(today);

  useEffect(() => {
    //fetchSurveyQuestions();
    DeviceInfo.getDeviceName().then(deviceName => {
      setDevice(deviceName);
    });
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          setIDEmployee(user.IDEmployee);
          setBusinessID(user.BusinessID);
          setEmpname(user.Empname);
          setHQ(user.HQ);
          setManager(user.Manager);
          setEmpemail(user.Empemail);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const url =
                BASE_URL +
                'Survey/EmployeeQuizDetail?Businessid=' +
                user.BusinessID +
                '&IDEmployee=' +
                user.IDEmployee
                + '&SurveyType=EMPLOYEE';
              const response = await fetch(url);
              //console.log('Url',url);
              const json = await response.json();
              //console.log('Details',json);
              setIDSurvey(json[0].IDSurvey);
              setQuizData(json[0]); // Assuming only one object is returned
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
    }

    if (showCountdown && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);

            if (!hasAutoStartedRef.current) {
              hasAutoStartedRef.current = true;
              proceedToEmployeeSurvey(useIDEmployee, useEmpemail);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdown, showCountdown]);

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

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const fetchSurveyQuestions = async () => {
    // try {
    //   AsyncStorage.getItem('UserData').then(value => {
    //     if (value != null) {
    //       let user = JSON.parse(value);
    //       NetInfo.fetch().then(async state => {
    //         if (state.isConnected) {
    //           const url =
    //             BASE_URL +
    //             'Survey/CheckEmployeeQuiz?Businessid=' +
    //             useBusinessID +
    //             '&IDEmployee=' +
    //             useIDEmployee +
    //             '&IDSurvey=' +
    //             useIDSurvey;
    //           const response = await fetch(url);
    //           const json = await response.json();
    //           if (json.d !== '') {
    //             Alert.alert('Survey Already Submitted', 'This Employee Survey has already submitted.');
    //             return;
    //           }

    //           const EmpStartBody = {
    //             IDEmployee: useIDEmployee,
    //             EntryUser: useEmpemail,
    //             EntryDevice: `Mobile - ${device}`,
    //             Businessid: 'MEND-PVTL-890',
    //             SurveyType: 'EMPLOYEE',
    //           };

    //           const submitEmpResponse = await fetch(`${BASE_URL}Survey/Start/Save`, {
    //             method: 'POST',
    //             headers: {
    //               Accept: 'application/json',
    //               'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(EmpStartBody),
    //           });

    //           const submitData = await submitEmpResponse.json();

    //           if (submitData.result !== "") {
    //             Alert.alert('Error', submitData.result || 'Unexpected error occurred.');
    //             return;
    //           }

    //           if (submitData.result === '') {
    //             const url =
    //               BASE_URL +
    //               'Survey/Employee/QuestionList?Businessid=' +
    //               useBusinessID +
    //               '&IDEmployee=' +
    //               useIDEmployee +
    //               '&SurveyType=EMPLOYEE';
    //             const response = await fetch(url);
    //             const json = await response.json();
    //             //setQuestions(data.result);
    //             if (json.result?.length > 0) {
    //               const formatted = json.result.map(q => ({
    //                 id: q.IDQuestion.toString(),
    //                 IDQuestion: q.IDQuestion,
    //                 IDSurvey: q.IDSurvey,
    //                 question: q.Question,
    //                 options: [
    //                   q.Option1,
    //                   q.Option2,
    //                   q.Option3,
    //                   q.Option4,
    //                   q.Option5,
    //                 ].filter(Boolean),
    //                 type: q.QuestionType.includes('MULTIPLE')
    //                   ? 'multiple'
    //                   : q.QuestionType === 'SHORT-TEXT' ||
    //                     q.QuestionType === 'LONG-TEXT'
    //                     ? 'TEXT'
    //                     : 'single',
    //                 textType: q.QuestionType, // <-- Add this line to track original text type
    //               }));

    //               setQuizQuestions(formatted);
    //               setQuizStarted(true);

    //               setTimeLeft(json.Duration * 60); // Convert minutes to seconds

    //               const timer = setInterval(() => {
    //                 setTimeLeft(prev => {
    //                   if (prev <= 1) {
    //                     clearInterval(timer);
    //                     return 0;
    //                   }
    //                   return prev - 1;
    //                 });
    //               }, 1000);

    //               return () => clearInterval(timer);
    //             } else {
    //               Alert.alert('No quiz available.');
    //             }
    //           } else {
    //             Alert.alert(json.d);
    //           }
    //         } else {
    //           Alert.alert('No Internet');
    //         }
    //       }, []);
    //     }
    //   });
    // } catch (error) {
    //   Alert.alert(error);
    // }
    try {
      const value = await AsyncStorage.getItem('UserData');
      if (!value) return;

      const user = JSON.parse(value);
      const IDEmployee = user.IDEmployee;
      const Empemail = user.Email;


      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        Alert.alert('No Internet');
        return;
      }

      // Step 1: Check already submitted
      const checkUrl = `${BASE_URL}Survey/CheckEmployeeQuiz?Businessid=${useBusinessID}&IDEmployee=${IDEmployee}&IDSurvey=${useIDSurvey}`;
      const checkResponse = await fetch(checkUrl);
      const checkJson = await checkResponse.json();
      if (checkJson.d !== '') {
        Alert.alert('Survey Already Submitted', 'This Employee Survey has already been submitted.');
        return;
      }

      // Step 1.5: Check scheduling
      const scheduleUrl = `${BASE_URL}Survey/SurveyScheduling?Businessid=${useBusinessID}&IDParticipants=${IDEmployee}&SurveyType=EMPLOYEE`;
      const scheduleResponse = await fetch(scheduleUrl);
      const scheduleData = await scheduleResponse.json();
      const timerValue = scheduleData?.d;

      if (timerValue && timerValue !== '') {
        const [h, m, s] = timerValue.split(':').map(Number);
        const totalSeconds = h * 3600 + m * 60 + s;

        hasAutoStartedRef.current = false;
        setCountdown(totalSeconds);
        setShowCountdown(true);
        return;
      }

      // Proceed immediately if no waiting
      await proceedToEmployeeSurvey(IDEmployee, Empemail);
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  // === PROCEED TO SURVEY ===
  const proceedToEmployeeSurvey = async (IDEmployee, Empemail) => {
    try {
      const EmpStartBody = {
        IDEmployee: IDEmployee,
        EntryUser: Empemail,
        EntryDevice: `Mobile - ${device}`,
        Businessid: useBusinessID,
        SurveyType: 'EMPLOYEE',
      };

      const submitEmpResponse = await fetch(`${BASE_URL}Survey/Start/Save`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(EmpStartBody),
      });

      const submitData = await submitEmpResponse.json();
      if (submitData.result !== '') {
        Alert.alert('Error', submitData.result || 'Unexpected error occurred.');
        return;
      }

      // Fetch question list
      const questionUrl = `${BASE_URL}Survey/Employee/QuestionList?Businessid=${useBusinessID}&IDEmployee=${useIDEmployee}&SurveyType=EMPLOYEE`;
      const response = await fetch(questionUrl);
      const json = await response.json();

      if (json.result?.length > 0) {
        const formatted = json.result.map(q => ({
          id: q.IDQuestion.toString(),
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
            : q.QuestionType === 'SHORT-TEXT' || q.QuestionType === 'LONG-TEXT'
              ? 'TEXT'
              : 'single',
          textType: q.QuestionType,
        }));

        setQuizQuestions(formatted);
        setQuizStarted(true);
        setTimeLeft(json.Duration * 60); // minutes → seconds

        // countdown for quiz duration
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      } else {
        Alert.alert('No quiz available.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };



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
    setAnswersMap(prev => ({ ...prev, [q.id]: answerObj }));
  };

  const handleTextAnswerChange = text => {
    setShortAnswer(text);
    const q = currentQuestion;
    setAnswersMap(prev => ({
      ...prev,
      [q.id]: {
        IDQuestion: q.IDQuestion,
        IDSurvey: q.IDSurvey,
        AnswerShortText: q.type === 'TEXT' ? text : '',
        AnswerLongText: '',
        Answer1: false,
        Answer2: false,
        Answer3: false,
        Answer4: false,
        Answer5: false,
      },
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);

      const nextQuestion = quizQuestions[newIndex];
      const savedAnswer = answersMap[nextQuestion.id];

      // Restore multi/single selection answers
      const selectedOptions = [];
      nextQuestion.options?.forEach((opt, idx) => {
        if (savedAnswer?.[`Answer${idx + 1}`]) {
          selectedOptions.push(idx);
        }
      });

      setSelectedAnswers(selectedOptions || []);

      if (nextQuestion.type === 'TEXT') {
        setShortAnswer(
          savedAnswer?.AnswerShortText || savedAnswer?.AnswerLongText || '',
        );
      }
    } else {
      setIsQuizFinished(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);

      const prevQuestion = quizQuestions[newIndex];
      const savedAnswer = answersMap[prevQuestion.id];

      // Restore selected options
      const selectedOptions = [];
      prevQuestion.options?.forEach((opt, idx) => {
        if (savedAnswer?.[`Answer${idx + 1}`]) {
          selectedOptions.push(idx); // use index to match handleOptionPress
        }
      });

      setSelectedAnswers(selectedOptions || []);

      // Restore text if applicable
      if (prevQuestion.type === 'TEXT') {
        setShortAnswer(
          savedAnswer?.AnswerShortText || savedAnswer?.AnswerLongText || '',
        );
      }
    }
  };

  const handleSubmit = async () => {
    const payload = {
      IDEmployee: useIDEmployee,
      EntryUser: useEmpemail,
      EntryDevice: 'Mobile_' + device,
      Businessid: useBusinessID,
      SurveyType: 'EMPLOYEE',
      Answers: Object.values(answersMap),
    };
    console.log(payload);

    const apiUrl = BASE_URL + 'Survey/Employee/SubmitAnswer';

    console.log('Submitted Data:', JSON.stringify(payload));
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData); // Debugging

      // ✅ Check if response is {"result":""}
      if (responseData.result === '') {
        Alert.alert('Success', 'Your Quiz Submitted Successfully.', [
          { text: 'OK' },
        ]);
        attemptedAnswer();
        handleNext();
      } else {
        Alert.alert(
          'Error',
          responseData.result || 'Unexpected error occurred.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error submitting Quiz:', error);
      Alert.alert('Error', 'Failed to submit Quiz request. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const attemptedAnswer = async () => {
    const url =
      BASE_URL +
      'Survey/Response?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      useIDEmployee +
      '&IDSurvey=' +
      useIDSurvey;
    console.log(url);

    try {
      const response = await axios.get(url);
      setData(response.data[0]); // Assuming the response is an array
    } catch (err) {
      Alert.alert(err.message);
    }
  };
  const handleRestart = () => {
    setQuizStarted(false);
    setIsQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShortAnswer('');
  };



  // === COUNTDOWN UI ===
  if (showCountdown) {
    const hours = Math.floor(countdown / 3600);
    const minutes = Math.floor((countdown % 3600) / 60);
    const seconds = countdown % 60;

    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#ffffff' }}>
          <Text style={{ fontSize: 18, color: '#444', marginBottom: 8 }}>
            You will start your Survey After
          </Text>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#005696' }}>
            {`${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </Text>
          <Text style={{ fontSize: 14, color: '#777', marginTop: 12 }}>
            Please keep this screen open.
          </Text>
        </View>
      </>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {!quizStarted ? (
        <Card style={styles.card}>
          {quizData ? (
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={[styles.value, { fontWeight: 'bold' }]}>
                  {quizData.SurveyName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{useEmpname}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>HQ:</Text>
                <Text style={styles.value}>{useHQ}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Full Marks:</Text>
                <Text style={styles.value}>{quizData.FullMarks}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Time:</Text>
                <Text style={styles.value}>{quizData.Duration}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>No of Questions:</Text>
                <Text style={styles.value}>{quizData.NoofQuestion}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Manager Name:</Text>
                <Text style={styles.value}>{useManager}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{todayDate}</Text>
              </View>
            </Card.Content>
          ) : (
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={styles.label}>No data found</Text>
              </View>
            </Card.Content>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={fetchSurveyQuestions}>
            <Text style={styles.buttonText}>Start Quiz</Text>
          </TouchableOpacity>
        </Card>
      ) : isQuizFinished ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            🎉 CONGRATULATION Mr. {useEmpname} !{' '}
          </Text>
          <Text style={styles.resultText}>
            {' '}
            You have Answered {data?.AttemptedQuestions} out of{' '}
            {data?.TotalQuestions} Question
          </Text>
          <Text style={styles.resultText}>Thank you for participating. </Text>
          <Text style={styles.resultText1}>
            You are always very special for Team Mendine.{' '}
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView>
          {timeLeft !== null && (
            <Text style={styles.timer}>⏱ {timeLeft} sec</Text>
          )}

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
                value={shortAnswer}
                onChangeText={handleTextAnswerChange}
                multiline={true}
                numberOfLines={currentQuestion.textType === 'LONG-TEXT' ? 6 : 3}
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
            {/* Previous Button (Always show) */}
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

            {/* Conditional Next or Submit Button */}
            {currentQuestionIndex + 1 < quizQuestions.length ? (
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'green' }]}
                onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit & Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f2f2f2' },
  card: {
    padding: 10,
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    marginVertical: 15,
    backgroundColor: '#fff',
  },
  picker: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  questionText: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#005696',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultText: { fontSize: 20, fontWeight: 'bold', marginVertical: 10 },
  resultText1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    marginHorizontal: 5,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  optionRow: {
    flexDirection: 'row',
    //justifyContent: '',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#e6f9e6',
    borderColor: '#4CAF50',
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
  wordLimit: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 4,
  },
  longTextInput: {
    height: 120, // more height for long text
    textAlignVertical: 'top', // to start text from top in multiline
  },
  shortTextInput: {
    height: 60, // Compact height
    textAlignVertical: 'top',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: 'red',
  },
});
export default EmployeeQuizScreen;
