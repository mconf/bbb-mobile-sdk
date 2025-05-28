import React from 'react';
import { Picker } from '@react-native-picker/picker';

const TimerPicker = ({
  onSelect,
  selectedValue,
  min = 0,
  max = 59,
}) => {
  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={(itemValue) => {
        onSelect(itemValue);
      }}
      mode='dropdown'
      style={{
        width: 100,
        height: 80,
        alignSelf: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: 24,
      }}
    >
      {Array.from({ length: max - min + 1 }, (_, i) => (
        <Picker.Item
          key={i + 1}
          label={`${i + min}`}
          value={i + 1}
          style={{ textAlign: 'center', fontSize: 24 }}
        />
      ))}
    </Picker>
  );
};

export default TimerPicker;
