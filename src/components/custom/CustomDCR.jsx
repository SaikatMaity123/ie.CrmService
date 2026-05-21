import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomDCR = ({
  selectionMode,
  option1,
  option2,
  option3,
  //option4,
  onSelectSwitch,
}) => {
  const [getSelectionMode, setSelectionMode] = useState(selectionMode);
  const updateSwitchData = value => {
    setSelectionMode(value);
    onSelectSwitch(value);
  };
  const getIconName = option => {
    if (option.toLowerCase() === 'sample') return 'flask-outline';
    if (option.toLowerCase() === 'gift') return 'gift-outline';
    if (option.toLowerCase() === 'campaign') return 'megaphone-outline';
    return 'ellipse-outline';
  };
  return (
    <View
      style={{
        height: 44,
        width: '100%',
        backgroundColor: '#e4e4e4',
        borderRadius: 10,
        borderColor: '#005696',
        flexDirection: 'row',
        justifyContent: 'center',
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => updateSwitchData(1)}
        style={{
          flex: 1,
          backgroundColor: getSelectionMode == 1 ? '#005696' : '#e4e4e4',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Ionicons
          name={getIconName(option1)}
          size={18}
          color={getSelectionMode == 1 ? 'white' : '#005696'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: getSelectionMode == 1 ? 'white' : '#005696',
            fontSize: 14,
            fontFamily: 'Roboto-Medium',
          }}>
          {option1}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => updateSwitchData(2)}
        style={{
          flex: 1,
          backgroundColor: getSelectionMode == 2 ? '#005696' : '#e4e4e4',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Ionicons
          name={getIconName(option2)}
          size={18}
          color={getSelectionMode == 2 ? 'white' : '#005696'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: getSelectionMode == 2 ? 'white' : '#005696',
            fontSize: 14,
            fontFamily: 'Roboto-Medium',
          }}>
          {option2}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => updateSwitchData(3)}
        style={{
          flex: 1,
          backgroundColor: getSelectionMode == 3 ? '#005696' : '#e4e4e4',
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
        }}>
        <Ionicons
          name={getIconName(option3)}
          size={18}
          color={getSelectionMode == 3 ? 'white' : '#005696'}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: getSelectionMode == 3 ? 'white' : '#005696',
            fontSize: 14,
            fontFamily: 'Roboto-Medium',
          }}>
          {option3}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomDCR;
