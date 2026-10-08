import React, {useState, useEffect, useCallback, useRef} from 'react';
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
  Platform,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Dropdown} from 'react-native-element-dropdown';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import {useFocusEffect} from '@react-navigation/native';

const DoctorQuizScreen = ({navigation}) => {
  const [form, setForm] = useState({area: '', doctor: '', contact: ''});
  const [areaList, setAreaList] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [shortAnswer, setShortAnswer] = useState('');
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [IDEmployee, setIDEmployee] = useState(null);
  const [empEmail, setEmpEmail] = useState(null);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [device, setDevice] = useState('');
  const [answersMap, setAnswersMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [useBusinessID, setBusinessID] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    DeviceInfo.getDeviceName().then(setDevice);

    if (showCountdown && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowCountdown(false);

            if (!hasAutoStartedRef.current) {
              hasAutoStartedRef.current = true;
              proceedToSurvey(); // auto-start quiz when timer hits zero
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [countdown, showCountdown]);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
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
        }, []);
      }
    });
  }, []);

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

  const fetchAreas = async (IDEmployee, BusinessID) => {
    setLoadingAreas(true); // Show loader
    try {
      const url =
        BASE_URL +
        'Area/EmployeeWiseAreaList?Businessid=' +
        BusinessID +
        '&IDEmployee=' +
        IDEmployee;
      const response = await fetch(url);
      const data = await response.json();
      setAreaList(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      Alert.alert('Error', 'Failed to load areas.');
    } finally {
      setLoadingAreas(false); // Hide loader
    }
  };

  const fetchDoctors = async (selectedAreaId = 0) => {
    if (!IDEmployee) return;
    const url =
      BASE_URL +
      'Doctor/EmployeeAndAreaWiseDoctorList?Businessid=' +
      useBusinessID +
      '&IDEmployee=' +
      IDEmployee +
      '&IDArea=' +
      selectedAreaId;
    const response = await fetch(url);
    const data = await response.json();
    setDoctorList(data);
  };

  // const handleStart = async () => {
  //   if (
  //     !form.area ||
  //     !form.doctor ||
  //     !form.contact ||
  //     !/^\d{10}$/.test(form.contact)
  //   ) {
  //     Alert.alert('Invalid input', 'Please fill all fields with valid data.');
  //     return;
  //   }

  //   setIsLoading(true); // Show loader

  //   try {
  //     // Step 1: Check if the quiz has already been submitted
  //     const checkQuizResponse = await fetch(
  //       `${BASE_URL}Survey/CheckDoctorQuiz?Businessid=MEND-PVTL-890&IDDoctor=${form.doctor}&IDArea=${form.area}&SurveyType=DOCTOR`
  //     );
  //     const checkQuizData = await checkQuizResponse.json();

  //     if (checkQuizData.d !== "") {
  //       Alert.alert('Quiz Already Submitted', 'This doctor Quiz has already submitted.');
  //       setIsLoading(false);
  //       return;
  //     }

  //     // ✅ Step 1.5: Check timer scheduling
  //     const scheduleResponse = await fetch(
  //       `${BASE_URL}Survey/SurveyScheduling?Businessid=MEND-PVTL-890&IDParticipants=${form.doctor}&SurveyType=DOCTOR`
  //     );
  //     const scheduleData = await scheduleResponse.json();
  //     const timerValue = scheduleData?.d;

  //     if (timerValue && timerValue !== "") {
  //       // Timer exists → show countdown screen instead of starting quiz
  //       const [hours, minutes, seconds] = timerValue.split(':').map(Number);
  //       const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  //       setIsLoading(false);
  //       setCountdown(totalSeconds); // <- useState for countdown
  //       setShowCountdown(true); // <- useState for showing countdown screen
  //       return;
  //     }

  //     // Step 2: Submit doctor details
  //     const StartBody = {
  //       IDParticipants: form.doctor,
  //       IDEmployee: encodeURIComponent(IDEmployee),
  //       Mobile: form.contact,
  //       IDArea: form.area,
  //       EntryUser: empEmail,
  //       EntryDevice: `Mobile - ${device}`,
  //       Businessid: 'MEND-PVTL-890',
  //       SurveyType: 'DOCTOR',
  //     };

  //     const submitResponse = await fetch(`${BASE_URL}Survey/ParticipantsStart/Save`, {
  //       method: 'POST',
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(StartBody),
  //     });

  //     console.log('Submitted Doctor Details:', JSON.stringify(StartBody));
  //     const submitData = await submitResponse.json();

  //     // if (submitData.result !== "") {
  //     //   Alert.alert('Error', submitData.result || 'Unexpected error occurred.');
  //     //   setIsLoading(false);
  //     //   return;
  //     // }
  //     if (submitData.result && submitData.result !== "") {
  //       const errorMsg = submitData.result;

  //       // Check if backend error contains FK constraint or delete conflict keywords
  //       if (
  //         errorMsg.includes("FK_Survey_Answer") ||
  //         errorMsg.includes("DELETE statement conflicted")
  //       ) {
  //         Alert.alert("Notice", "Please activate any quiz to attempt this.");
  //       } else {
  //         Alert.alert("Error", errorMsg || "Unexpected error occurred.");
  //       }

  //       setIsLoading(false);
  //       return;
  //     }

  //     // Step 3: Fetch quiz questions
  //     const questionsResponse = await fetch(
  //       `${BASE_URL}Survey/QuestionList?Businessid=DEMO-PVTL-890&IDDoctor=${form.doctor}&SurveyType=DOCTOR`
  //     );
  //     const questionsData = await questionsResponse.json();

  //     if (questionsData.result?.length > 0) {
  //       const formatted = questionsData.result.map(q => ({
  //         id: q.IDQuestion.toString(),
  //         IDQuestion: q.IDQuestion,
  //         IDSurvey: q.IDSurvey,
  //         question: q.Question,
  //         options: [
  //           q.Option1,
  //           q.Option2,
  //           q.Option3,
  //           q.Option4,
  //           q.Option5,
  //         ].filter(Boolean),
  //         type: q.QuestionType.includes('MULTIPLE')
  //           ? 'multiple'
  //           : q.QuestionType === 'SHORT-TEXT' || q.QuestionType === 'LONG-TEXT'
  //             ? 'TEXT'
  //             : 'single',
  //         textType: q.QuestionType, // <-- Add this line to track original text type
  //       }));

  //       setQuizQuestions(formatted);
  //       setQuizStarted(true);
  //     } else {
  //       Alert.alert('No quiz available.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching quiz:', error);
  //     Alert.alert('Error', 'Something went wrong. Please try again.');
  //   } finally {
  //     setIsLoading(false); // Hide loader
  //   }
  // };

  const handleStart = async () => {
    if (
      !form.area ||
      !form.doctor ||
      !form.contact ||
      !/^\d{10}$/.test(form.contact)
    ) {
      Alert.alert('Invalid input', 'Please fill all fields with valid data.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Already submitted?
      const checkQuizResponse = await fetch(
        `${BASE_URL}Survey/CheckDoctorQuiz?Businessid=MEND-PVTL-890&IDDoctor=${form.doctor}&IDArea=${form.area}&SurveyType=DOCTOR`,
      );
      const checkQuizData = await checkQuizResponse.json();

      if (checkQuizData.d !== '') {
        Alert.alert(
          'Quiz Already Submitted',
          'This doctor quiz has already been submitted.',
        );
        setIsLoading(false);
        return;
      }

      // Step 1.5: Scheduling check
      const scheduleResponse = await fetch(
        `${BASE_URL}Survey/SurveyScheduling?Businessid=MEND-PVTL-890&IDParticipants=${form.doctor}&SurveyType=DOCTOR`,
      );
      const scheduleData = await scheduleResponse.json();
      const timerValue = scheduleData?.d; // "HH:MM:SS" or null/empty

      if (timerValue && timerValue !== '') {
        // Countdown required
        const [h, m, s] = timerValue.split(':').map(Number);
        const totalSeconds = h * 3600 + m * 60 + s;

        hasAutoStartedRef.current = false;
        setCountdown(totalSeconds);
        setShowCountdown(true);
        setIsLoading(false);
        return;
      }

      // No timer restriction -> go ahead
      await proceedToSurvey();
    } catch (error) {
      console.error('Error in handleStart:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      // If countdown is showing, do not hide loader here (already hidden above)
      if (!showCountdown) {
        setIsLoading(false);
      }
    }
  };

  const proceedToSurvey = async () => {
    try {
      setIsLoading(true);

      // Step 2: Submit doctor details
      const StartBody = {
        IDParticipants: form.doctor,
        IDEmployee: encodeURIComponent(IDEmployee),
        Mobile: form.contact,
        IDArea: form.area,
        EntryUser: empEmail,
        EntryDevice: `Mobile - ${device}`,
        Businessid: 'MEND-PVTL-890',
        SurveyType: 'DOCTOR',
      };

      const submitResponse = await fetch(
        `${BASE_URL}Survey/ParticipantsStart/Save`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(StartBody),
        },
      );

      console.log('Submitted Doctor Details:', JSON.stringify(StartBody));
      const submitData = await submitResponse.json();

      if (submitData.result && submitData.result !== '') {
        const errorMsg = submitData.result;

        if (
          errorMsg.includes('FK_Survey_Answer') ||
          errorMsg.includes('DELETE statement conflicted')
        ) {
          Alert.alert('Notice', 'Please activate any quiz to attempt this.');
        } else {
          Alert.alert('Error', errorMsg || 'Unexpected error occurred.');
        }

        return;
      }

      // Step 3: Fetch quiz questions
      const questionsResponse = await fetch(
        `${BASE_URL}Survey/QuestionList?Businessid=DEMO-PVTL-890&IDDoctor=${form.doctor}&SurveyType=DOCTOR`,
      );
      const questionsData = await questionsResponse.json();

      if (questionsData.result?.length > 0) {
        const formatted = questionsData.result.map(q => ({
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
      } else {
        Alert.alert('No quiz available.');
      }
    } catch (error) {
      console.error('Error starting survey:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
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
    setAnswersMap(prev => ({...prev, [q.id]: answerObj}));
  };

  const handleTextAnswerChange = text => {
    setShortAnswer(text);
    const q = currentQuestion;
    setAnswersMap(prev => ({
      ...prev,
      [q.id]: {
        // IDEmployee:IDEmployee,
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

  const SubmitDocQuiz = async () => {
    const requestBody = {
      IDParticipants: form.doctor,
      IDDoctor: form.doctor,
      Mobile: form.contact,
      IDArea: form.area,
      EntryUser: empEmail,
      EntryDevice: `Mobile - ${device}`,
      Businessid: 'MEND-PVTL-890',
      SurveyType: 'DOCTOR',
      Answers: Object.values(answersMap),
    };

    // Construct API URL
    const apiUrl = BASE_URL + 'Survey/Doctor/SubmitAnswer';

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
        Alert.alert('Success', 'Your Quiz Submitted Successfully.', [
          {text: 'OK'},
        ]);
        handleNext();
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

  const handleRestart = () => {
    setQuizStarted(false);
    setIsQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShortAnswer('');
    setForm({area: '', doctor: '', contact: ''});
  };

  // if (showCountdown) {
  //   const hours = Math.floor(countdown / 3600);
  //   const minutes = Math.floor((countdown % 3600) / 60);
  //   const seconds = countdown % 60;

  //   return (
  //     <>
  //       <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
  //       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
  //         <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#005696' }}>
  //           You will start your Survey After
  //         </Text>
  //         <Text style={{ fontSize: 36, marginTop: 20 }}>
  //           {`${hours.toString().padStart(2, '0')}:${minutes
  //             .toString()
  //             .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
  //         </Text>
  //       </View>
  //     </>
  //   );
  // }

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
            padding: 16,
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#a9ddfaff" />
      {!quizStarted ? (
        <>
          <View style={styles.dropdownWrapper}>
            {loadingAreas ? (
              <ActivityIndicator size="small" color="#005696" />
            ) : (
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
                placeholder="Select Area"
                searchPlaceholder="Search..."
                value={form.area}
                onChange={item => {
                  setForm({...form, area: item.value});
                  fetchDoctors(item.value);
                }}
              />
            )}
          </View>

          <View style={styles.dropdownWrapper}>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              search
              maxHeight={250}
              data={
                doctorList.length > 0
                  ? doctorList.map(d => ({label: d.Name, value: d.IDDoctor}))
                  : [{label: 'No Doctors Available', value: ''}]
              }
              labelField="label"
              valueField="value"
              placeholder="Select Doctor"
              searchPlaceholder="Search..."
              value={form.doctor}
              onChange={item => {
                setForm({...form, doctor: item.value});
                const doc = doctorList.find(d => d.IDDoctor === item.value);
                setSelectedDoctorName(doc?.Name ?? '');
              }}
            />
          </View>

          <TextInput
            placeholder="Enter Mobile number"
            keyboardType="number-pad"
            style={styles.input}
            value={form.contact}
            maxLength={10}
            onChangeText={val => setForm({...form, contact: val})}
          />

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#005696"
              style={{marginTop: 20}}
            />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Start Quiz</Text>
            </TouchableOpacity>
          )}
        </>
      ) : isQuizFinished ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            🎉 CONGRATULATION Dr. {selectedDoctorName} !{' '}
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
                style={[styles.button, {backgroundColor: 'green'}]}
                onPress={() => {
                  SubmitDocQuiz();
                  // handleNext();
                }}>
                <Text style={styles.buttonText}>Submit & Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default DoctorQuizScreen;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f2f2f2'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    marginVertical: 15,
    backgroundColor: '#fff',
  },
  dropdownWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 18 : 0,
    paddingHorizontal: Platform.OS === "ios" ? 18 : 0,
    marginVertical: 12,
  },

  dropdown: {
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  placeholderStyle: {
    fontSize: 15,
    color: '#888',
  },

  selectedTextStyle: {
    fontSize: 15,
    color: '#000',
  },

  inputSearchStyle: {
    height: 45,
    fontSize: 14,
    borderRadius: 8,
  },

  questionText: {fontSize: 20, fontWeight: 'bold', marginBottom: 20},
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
  buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  resultContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  resultText: {fontSize: 20, fontWeight: 'bold', marginVertical: 10},
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
});
