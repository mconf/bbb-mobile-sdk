import styled, { css } from 'styled-components/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Pressable from '../../pressable';
import Colors from '../../../constants/colors';

const Container = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.8,
  },
}))`
  ${() => css`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    background-color: ${Colors.lightGray300};
    border-radius: 12px;
    padding: 12px;
    width: 100%;
    gap: 12px;
  `}
`;

const AudioIcon = styled(MaterialCommunityIcons)`
  padding: 4px;
`;

const AudioText = styled.Text`
  font-size: 16px;
  color: ${Colors.lightGray100}
  text-align: center;
  flex: 1;
`;

const OpenAudioSelectorModal = ({ onPress }) => (
  <Pressable
    onPress={onPress}
  >
    <Ionicons name="open-outline" size={24} color="white" />
  </Pressable>
);

export default {
  AudioIcon,
  Container,
  AudioText,
  OpenAudioSelectorModal
};
