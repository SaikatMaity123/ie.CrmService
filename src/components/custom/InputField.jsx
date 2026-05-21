import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const InputField = ({
  label,
  icon,
  inputType,
  keyboardType,
  fieldButtonLabel,
  fieldButtonFunction,
  onChangeText,
  value,
  autoCapitalize,
  autoCorrect,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingBottom: 8,
        marginBottom: 25,
      }}>
      {icon}
      {inputType == 'password' ? (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0,color:'#000'}}
          secureTextEntry={true}
          onChangeText={onChangeText}
          value={value}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        // <View style={styles.container}>
        //   <TextInput
        //     style={styles.input}
        //     secureTextEntry={!showPassword}
        //     value={password}
        //     onChangeText={setPassword}
        //     placeholder="Password"
        //   />
        //   <TouchableOpacity
        //     style={styles.toggleButton}
        //     onPress={toggleShowPassword}>
        //     <Ionicons
        //       name={showPassword ? 'eye-off-outline' : 'eye-outline'}
        //       size={24}
        //       color="black"
        //     />
        //   </TouchableOpacity>
        // </View>
      ) : (
        <TextInput
          placeholder={label}
          keyboardType={keyboardType}
          style={{flex: 1, paddingVertical: 0, color: '#000'}}
          onChangeText={onChangeText}
          value={value}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
      )}
      <TouchableOpacity onPress={fieldButtonFunction}>
        <Text style={{color: '#AD40AF', fontWeight: '700'}}>
          {fieldButtonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  toggleButton: {
    padding: 8,
  },
});
