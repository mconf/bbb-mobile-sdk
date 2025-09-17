import React, { useState } from 'react';
import {
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Styled from './styles'

const TimerPicker = ({
  onSelect,
  selectedValue,
  min = 0,
  max = 59,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const pickerItems = Array.from({ length: max - min + 1 }, (_, i) => ({
    key: i + 1,
    label: `${i + min}`,
    value: i + 1,
  }));

  if (Platform.OS === 'ios') {
    return (
      <>
        <Styled.Button onPress={() => setModalVisible(true)}>
          <Styled.ButtonText>
            {pickerItems.find((item) => item.value === selectedValue)?.label ??
              ''}
          </Styled.ButtonText>
        </Styled.Button>

        <Modal
          transparent
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <Styled.ModalOverlay>
              <TouchableWithoutFeedback>
                <Styled.ModalContent>
                  <Picker
                    selectedValue={selectedValue}
                    onValueChange={(itemValue) => onSelect(itemValue)}
                    style={{
                      width: 100,
                      alignSelf: 'center',
                      fontSize: 24,
                    }}
                  >
                    {pickerItems.map(({ key, label, value }) => (
                      <Picker.Item
                        key={key}
                        label={label}
                        value={value}
                        style={{ textAlign: 'center', fontSize: 24 }}
                      />
                    ))}
                  </Picker>
                </Styled.ModalContent>
              </TouchableWithoutFeedback>
            </Styled.ModalOverlay>
          </TouchableWithoutFeedback>
        </Modal>
      </>
    );
  }

  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={(itemValue) => onSelect(itemValue)}
      mode="dropdown"
      style={{
        width: 100,
        height: 80,
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 24,
        color: 'black'
      }}
      dropdownIconColor={'black'}
      dropdownIconRippleColor={'gray'}
    >
      {
        pickerItems.map(({ key, label, value }) => (
          <Picker.Item
            key={key}
            label={label}
            value={value}
            style={{ textAlign: 'center', fontSize: 24 }}
            color='white'
          />
        ))
      }
    </Picker>
  );
};

export default TimerPicker;
