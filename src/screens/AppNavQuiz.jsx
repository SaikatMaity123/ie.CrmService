import { View, Text } from 'react-native'
import React from 'react'
import { AppProvider } from '../components/custom/AppContext'
import QuizDrawer from '../components/drawer/QuizDrawer'

const AppNavQuiz = () => {
  return (
    <AppProvider>
    <QuizDrawer/>
    </AppProvider>
  )
}

export default AppNavQuiz