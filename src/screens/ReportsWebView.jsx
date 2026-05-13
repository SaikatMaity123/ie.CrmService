import React, {useRef, useCallback} from 'react';
import {BackHandler} from 'react-native';
import {WebView} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';

const ReportsWebView = ({route, navigation}) => {
  const webviewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AppNavScreen'); // <-- Your main screen
        return true; // prevent default back behavior
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation]),
  );

  return (
    <WebView
      ref={webviewRef}
      source={{uri: route.params.url}}
      startInLoadingState
    />
  );
};

export default ReportsWebView;
