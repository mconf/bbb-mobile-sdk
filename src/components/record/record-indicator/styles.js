import styled from 'styled-components/native';
import Colors from '../../../constants/colors';

const RecordingIndicatorIcon = styled.View`
  width: 24px;
  height: 24px;
  z-index: 5;
`;

const Container = styled.View`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  right: 16px;
  z-index: 1;
  border-radius: 36px;

  ${({ neverRecorded }) => !neverRecorded && `
    background-color: ${Colors.white};
  `}

  ${({ recording }) => recording && `
    background-color: ${Colors.recordingRed};
  `}
`;

export default {
  RecordingIndicatorIcon,
  Container,
};
