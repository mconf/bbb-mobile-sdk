import styled from 'styled-components/native';
import Colors from '../../constants/colors';

const RecordingControl = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  font-size: 16px;
  font-weight: 400;
  min-height: 40px;
  margin: 5px;
  padding: 5px;
  gap: 10px;

  ${({ recording }) => recording 
    && `
      background-color: ${Colors.dangerDark};
      border: ${Colors.white} solid 2px;
      border-radius: 12px;
  `}

  ${({ recording }) => !recording 
    && `
      border: 2px solid ${Colors.white};
      border-radius: 12px;
  `}
`;

const RecordingIndicatorContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const RecordingIndicatorIcon = styled.View`
  width: 40px;  
`;

const RecordTimeText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${Colors.white};
  text-align: center;
  padding-right: 5px;
`;

export default {
  RecordingIndicatorIcon,
  RecordTimeText,
  RecordingIndicatorContainer,
  RecordingControl
};
