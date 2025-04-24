// import React, {useState, useEffect} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   SafeAreaView,
//   ScrollView,
//   FlatList,
//   Alert,
// } from 'react-native';
// import NetInfo from '@react-native-community/netinfo';
// import {BASE_URL} from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // const sampleQuestions = [
// //   {
// //     id: '1',
// //     question: 'What is the capital of France?',
// //     type: 'single',
// //     options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
// //     answer: 'Paris',
// //   },
// //   {
// //     id: '2',
// //     question: 'Select all fruits:',
// //     type: 'multiple',
// //     options: ['Apple', 'Carrot', 'Banana', 'Potato'],
// //     answer: ['Apple', 'Banana'],
// //   },
// //   {
// //     id: '3',
// //     question: 'What is 10 + 15?',
// //     type: 'text',
// //     answer: '25',
// //   },
// // ];

// const EmployeeQuizScreen = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [shortAnswer, setShortAnswer] = useState('');
//   const [score, setScore] = useState(0);
//   const [isQuizFinished, setIsQuizFinished] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(60);
//   const [questions, setQuestions] = useState([]);

//   //const currentQuestion = sampleQuestions[currentQuestionIndex];

//   // Timer Effect
//   // useEffect(() => {
//   //   if (!isQuizFinished) {
//   //     if (timeLeft === 0) {
//   //       handleNext();
//   //       return;
//   //     }
//   //     const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
//   //     return () => clearTimeout(timer);
//   //   }
//   // }, [timeLeft]);

//   // const handleOptionPress = (option) => {
//   //   if (currentQuestion.type === 'multiple') {
//   //     setSelectedOptions((prev) =>
//   //       prev.includes(option) ? prev.filter((opt) => opt !== option) : [...prev, option]
//   //     );
//   //   } else {
//   //     setSelectedOptions([option]);
//   //   }
//   // };

//   // const checkAnswer = () => {
//   //   if (currentQuestion.type === 'single') {
//   //     return selectedOptions[0] === currentQuestion.answer;
//   //   } else if (currentQuestion.type === 'multiple') {
//   //     const selected = [...selectedOptions].sort().join(',');
//   //     const correct = [...currentQuestion.answer].sort().join(',');
//   //     return selected === correct;
//   //   } else if (currentQuestion.type === 'text') {
//   //     return shortAnswer.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
//   //   }
//   //   return false;
//   // };

//   // const handleNext = () => {
//   //   if (checkAnswer()) {
//   //     setScore((prev) => prev + 1);
//   //   }

//   //   if (currentQuestionIndex + 1 < sampleQuestions.length) {
//   //     setCurrentQuestionIndex((prev) => prev + 1);
//   //     setSelectedOptions([]);
//   //     setShortAnswer('');
//   //     setTimeLeft(60);
//   //   } else {
//   //     setIsQuizFinished(true);
//   //   }
//   // };

//   // const handlePrevious = () => {
//   //   if (currentQuestionIndex > 0) {
//   //     setCurrentQuestionIndex(prev => prev - 1);
//   //     setSelectedOptions([]);
//   //     setShortAnswer('');
//   //   }
//   // };

//   // const handleRestart = () => {
//   //   setCurrentQuestionIndex(0);
//   //   setScore(0);
//   //   setSelectedOptions([]);
//   //   setShortAnswer('');
//   //   setIsQuizFinished(false);
//   //   setTimeLeft(60);
//   // };

//   // return (
//   //   <SafeAreaView style={styles.container}>
//   //     {isQuizFinished ? (
//   //       <View style={styles.resultContainer}>
//   //         <Text style={styles.resultText}>Quiz Completed!</Text>
//   //         <Text style={styles.resultText}>
//   //           Your Score: {score}/{sampleQuestions.length}
//   //         </Text>
//   //         <TouchableOpacity style={styles.button} onPress={handleRestart}>
//   //           <Text style={styles.buttonText}>Restart Quiz</Text>
//   //         </TouchableOpacity>
//   //       </View>
//   //     ) : (
//   //       <ScrollView contentContainerStyle={styles.quizContainer}>
//   //         <Text style={styles.timer}>⏱ {timeLeft}s</Text>
//   //         <Text style={styles.questionText}>{currentQuestion.question}</Text>

//   //         {/* Single / Multiple Options */}
//   //         {currentQuestion.type === 'single' ||
//   //         currentQuestion.type === 'multiple' ? (
//   //           currentQuestion.options.map(option => (
//   //             <TouchableOpacity
//   //               key={option}
//   //               style={[
//   //                 styles.optionButton,
//   //                 selectedOptions.includes(option) && {
//   //                   backgroundColor:
//   //                     currentQuestion.type === 'multiple'
//   //                       ? '#e0f8e9'
//   //                       : '#d0f0c0',
//   //                   borderColor: '#33aa33',
//   //                 },
//   //               ]}
//   //               onPress={() => handleOptionPress(option)}>
//   //               <Text style={styles.optionText}>{option}</Text>
//   //             </TouchableOpacity>
//   //           ))
//   //         ) : currentQuestion.type === 'text' ? (
//   //           <TextInput
//   //             placeholder="Type your answer"
//   //             style={styles.input}
//   //             value={shortAnswer}
//   //             onChangeText={setShortAnswer}
//   //           />
//   //         ) : null}

//   //         {/* <TouchableOpacity style={styles.button} onPress={handleNext}>
//   //           <Text style={styles.buttonText}>Next</Text>
//   //         </TouchableOpacity> */}

//   //         <View style={styles.navRow}>
//   //           <TouchableOpacity
//   //             style={[styles.button, {backgroundColor: 'gray'}]}
//   //             onPress={handlePrevious}
//   //             disabled={currentQuestionIndex === 0}>
//   //             <Text style={styles.buttonText}>Previous</Text>
//   //           </TouchableOpacity>

//   //           <TouchableOpacity style={styles.button} onPress={handleNext}>
//   //             <Text style={styles.buttonText}>Next</Text>
//   //           </TouchableOpacity>
//   //         </View>
//   //       </ScrollView>
//   //     )}
//   //   </SafeAreaView>
//   // );

//   /*New One*/
//   useEffect(() => {
//     try {
//       AsyncStorage.getItem('UserData').then(value => {
//         if (value != null) {
//           let user = JSON.parse(value);
//           NetInfo.fetch().then(async state => {
//             if (state.isConnected) {
//               const url =
//                 BASE_URL +
//                 'Survey/Employee/QuestionList?Businessid=' +
//                 user.BusinessID +
//                 '&IDEmployee=' +
//                 user.IDEmployee;
//               fetch(url)
//                 .then(response => response.json())
//                 .then(data => setQuestions(data.result))
//                 .catch(error =>
//                   console.error('Error fetching questions:', error),
//                 );

//               // let result = await fetch(url);
//               // result = await result.json();
//               // console.log('result',result);
//               // setQuestions(result);
//             }
//           }, []);
//         }
//       });
//     } catch (error) {
//       Alert.alert(error);
//     }
//   }, []);

//   return (
//     <FlatList
//       data={questions}
//       keyExtractor={item => item.IDQuestion.toString()}
//       renderItem={({item}) =>
//        <RenderQuestion question={item} />
//       //console.log(item)

//     }
//     />
//   );
// };

// const RenderQuestion = ({question}) => {
//   if (question.QuestionType === 'SINGLE-SELECTION-4') {
//     return <SingleSelection question={question} />;
//   } else if (question.QuestionType === 'LONG-TEXT') {
//     return <LongText question={question} />;
//   }
//   return null;
// };
// const SingleSelection = ({question}) => {
//   const [selectedOption, setSelectedOption] = useState(null);

//   return (
//     <View style={{padding: 10, borderBottomWidth: 1, borderColor: '#ccc'}}>
//       <Text style={{fontSize: 16, fontWeight: 'bold'}}>
//         {question.Question}
//       </Text>
//       {[question.Option1, question.Option2, question.Option3, question.Option4]
//         .filter(option => option) // Remove empty options
//         .map((option, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={() => setSelectedOption(option)}
//             style={{
//               flexDirection: 'row',
//               alignItems: 'center',
//               padding: 10,
//               backgroundColor:
//                 selectedOption === option ? 'lightblue' : 'white',
//               marginVertical: 5,
//               borderRadius: 5,
//               borderWidth: 1,
//               borderColor: '#ddd',
//             }}>
//             <Text>{option}</Text>
//           </TouchableOpacity>
//         ))}

//       {question.Timers.length > 0 && (
//         <Text style={{color: 'red', marginTop: 5}}>
//           Timer: {question.Timers[0].Duration} min
//         </Text>
//       )}
//     </View>
//   );
// };

// const LongText = ({question}) => {
//   const [text, setText] = useState('');

//   return (
//     <View style={{padding: 10, borderBottomWidth: 1, borderColor: '#ccc'}}>
//       <Text style={{fontSize: 16, fontWeight: 'bold'}}>
//         {question.Question}
//       </Text>
//       <TextInput
//         placeholder="Write your answer..."
//         multiline
//         style={{
//           borderWidth: 1,
//           borderColor: '#ccc',
//           borderRadius: 5,
//           padding: 10,
//           minHeight: 100,
//           marginTop: 10,
//         }}
//         value={text}
//         onChangeText={setText}
//       />
//     </View>
//   );
// };

// export default EmployeeQuizScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f2f2f2',
//   },
//   quizContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//   },
//   questionText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   optionButton: {
//     backgroundColor: '#fff',
//     padding: 15,
//     marginVertical: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//   },
//   optionText: {
//     fontSize: 16,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     marginVertical: 10,
//   },
//   button: {
//     backgroundColor: '#33767C',
//     padding: 15,
//     borderRadius: 8,
//     marginTop: 20,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   resultContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   resultText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginVertical: 10,
//   },
//   timer: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//     marginBottom: 10,
//   },
//   navRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 20,
//   },
// });

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native';
import {Card} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import {BASE_URL} from '@env';
import moment from 'moment';
import axios from 'axios';

const EmployeeQuizScreen = () => {
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
                user.IDEmployee;
              const response = await fetch(url);
              const json = await response.json();
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
  }, []);

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const fetchSurveyQuestions = async () => {
    try {
      AsyncStorage.getItem('UserData').then(value => {
        if (value != null) {
          let user = JSON.parse(value);
          NetInfo.fetch().then(async state => {
            if (state.isConnected) {
              const url =
                BASE_URL +
                'Survey/CheckEmployeeQuiz?Businessid=' +
                useBusinessID +
                '&IDEmployee=' +
                useIDEmployee +
                '&IDSurvey=' +
                useIDSurvey;
              const response = await fetch(url);
              const json = await response.json();
              if (json.d === '') {
                const url =
                  BASE_URL +
                  'Survey/Employee/QuestionList?Businessid=' +
                  useBusinessID +
                  '&IDEmployee=' +
                  useIDEmployee;
                const response = await fetch(url);
                const json = await response.json();
                //setQuestions(data.result);
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
                      : q.QuestionType === 'SHORT-TEXT' ||
                        q.QuestionType === 'LONG-TEXT'
                      ? 'TEXT'
                      : 'single',
                    textType: q.QuestionType, // <-- Add this line to track original text type
                  }));

                  setQuizQuestions(formatted);
                  setQuizStarted(true);

                  setTimeLeft(json.Duration * 60); // Convert minutes to seconds

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
              } else {
                Alert.alert(json.d);
              }
            } else {
              Alert.alert('No Internet');
            }
          }, []);
        }
      });
    } catch (error) {
      Alert.alert(error);
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
          {text: 'OK'},
        ]);
        attemptedAnswer();
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

  return (
    <SafeAreaView style={styles.container}>
      {!quizStarted ? (
        <Card style={styles.card}>
          {quizData ? (
            <Card.Content>
              <View style={styles.detailRow}>
                <Text style={[styles.value, {fontWeight: 'bold'}]}>
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
                    currentQuestionIndex === 0 ? 'gray' : '#33767C',
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
  container: {flex: 1, padding: 20, backgroundColor: '#f2f2f2'},
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
    backgroundColor: '#33767C',
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
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-end',
    marginBottom: 10,
    color: 'red',
  },
});
export default EmployeeQuizScreen;
