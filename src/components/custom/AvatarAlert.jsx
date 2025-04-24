import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const AvatarAlert = ({ visible, onClose }) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Avatar</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Take Photo...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Choose from Library...</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#ff4444',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: 'white',
  },
});

export default AvatarAlert;