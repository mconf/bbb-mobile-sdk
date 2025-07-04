import styled from 'styled-components/native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PLAYER_HEIGHT = width;

const Container = styled.View`
  width: 100%;
  height: ${PLAYER_HEIGHT}px;
`;

const Overlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 1;
`;

const VolumeContainer = styled.View`
  position: absolute;
  left: 20px;
  top: 50%;
  margin-top: -75px;
  height: 150px;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

export default {
  Container,
  Overlay,
  VolumeContainer,
};
