import React from 'react';
import Styled from './styles';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Colors from '../../../constants/colors';

const ToggleButton = ({ toggled, onToggle }) => {
  return (
    <Styled.Container onPress={onToggle}>
      <Icon
        name={toggled ? "toggle-switch" : "toggle-switch-off"}
        size={32}
        color={toggled ? Colors.blue : Colors.white}
      />
    </Styled.Container>
  );
};

export default ToggleButton;
