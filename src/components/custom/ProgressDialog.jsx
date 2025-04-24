// ProgressDialog.js
// import React from 'react';
// import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

import React from 'react';
import {Modal, View, Text, ActivityIndicator, StyleSheet} from 'react-native';

const ProgressDialog = ({visible, message}) => {
  // return (
  //   <Modal transparent={true} animationType="none" visible={visible}>
  //     <View style={styles.modalBackground}>
  //       <View style={styles.activityIndicatorWrapper}>
  //         <ActivityIndicator animating={visible} />
  //       </View>
  //     </View>
  //   </Modal>
  // );
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
        <View style={styles.activityIndicatorWrapper}>
          <ActivityIndicator size="large" color="#0000ff" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

// const styles = StyleSheet.create({
//   modalBackground: {
//     flex: 1,
//     alignItems: 'center',
//     flexDirection: 'column',
//     justifyContent: 'space-around',
//     backgroundColor: '#00000040',
//   },
//   activityIndicatorWrapper: {
//     backgroundColor: '#FFFFFF',
//     height: 100,
//     width: 100,
//     borderRadius: 10,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//   },
// });

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
  },
});
export default ProgressDialog;
