import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

const CustomButton = ({label, onPress}) => {
  return (
    <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#005696',
      padding: 20,
      borderRadius: 10,
      marginTop:5,
      marginBottom: 30,
      //display:'none'
    }}>
    <Text
      style={{
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: '#ffffff',
      }}>
      {label}
    </Text>
  </TouchableOpacity>
  )
}

export default CustomButton