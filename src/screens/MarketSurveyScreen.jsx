import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';

const sampleQuestions = [
  {
    id: '1',
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    answer: 'Paris',
  },
  {
    id: '2',
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
    answer: 'Mars',
  },
  {
    id: '3',
    question: 'What is 15 + 15?',
    options: ['25', '30', '20', '15'],
    answer: '30',
  },
  {
    id: '4',
    question: 'What is the function of Carmozyme syrup? ',
    options: [' '],
    answer: ' ',
  },
];

const MarketSurveyScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    if (option === currentQuestion.answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < sampleQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsQuizFinished(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {isQuizFinished ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Quiz Completed!</Text>
          <Text style={styles.resultText}>Your Score: {score}/{sampleQuestions.length}</Text>
          <TouchableOpacity style={styles.button} onPress={handleRestart}>
            <Text style={styles.buttonText}>Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.quizContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOption === option && {
                  backgroundColor:
                    option === currentQuestion.answer ? 'green' : 'red',
                },
              ]}
              onPress={() => handleOptionPress(option)}
              disabled={selectedOption !== null}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {selectedOption && (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default MarketSurveyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  quizContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#33767C',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});