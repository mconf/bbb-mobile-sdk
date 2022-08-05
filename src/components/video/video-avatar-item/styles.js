import styled from 'styled-components/native';
import { css } from 'styled-components';
import Colors from '../../../constants/colors';
import Pressable from '../../pressable';

const ContainerPressable = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
    borderColor: '#FFFFFF00',
    borderWidth: 1,
  },
}))`
  ${() => css`
    height: 120px;
    width: 120px;
  `}
`;

const UserAvatar = styled.Image`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const NameLabelContainer = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: #28282d99;
  padding: 5px;
  margin: 5px;
  border-radius: 4px;
`;
const NameLabel = styled.Text`
  color: ${Colors.white};
`;

const PressableButton = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    flex-direction: row;
    background-color: #28282d99;
    border-radius: 4px;
    position: absolute;
    margin: 8px;
    align-items: center;
  `}
`;

export default {
  ContainerPressable,
  UserAvatar,
  NameLabel,
  NameLabelContainer,
  PressableButton,
};
