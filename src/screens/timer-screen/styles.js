import styled from 'styled-components/native';
import { Divider, Button } from 'react-native-paper';
import Colors from '../../constants/colors';

const Container = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 20px 16px;
  background-color: ${Colors.blueBackgroundColor};

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
    flex-direction: row;
    justify-content: center;
  `}
`;

const TimerHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px;
`;

const TimerBody = styled.View`
  width: 100%;
  padding-top: 16px;
  align-items: center;
`;

const TimerText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
  padding-left: 12px;
`;

const TimerValue = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.lightGray400};
  align-self: center;
`;

const TimerPickerContainer = styled.View`
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
`;

const TimerContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

const TimerButton = ({ onPress, children }) => (
  <ButtonBodyCreate
    mode="contained"
    onPress={onPress}
    buttonColor={Colors.lightBlue}
    textColor={Colors.white}
    labelStyle={{
      fontSize: 18,
      fontWeight: '500',
    }}
  >
    {children}
  </ButtonBodyCreate>
);

const Card = styled.View`
  width: 100%;
  background-color: ${Colors.white};
  min-height: 64px;
  border-radius: 12px;
  border: 4px ${Colors.white} solid;
  padding: 8px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
  justify-content: center;
  gap: 24px;
`;

const Block = styled.View`
  flex-direction: column;

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
    width: 100%;
    max-height: 95%;
  `}
`;

const DividerTop = styled(Divider)`
  margin-left: 12px;
  margin-right: 12px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${Colors.white};
`;

const DividerTimer = styled(Divider)`
  margin-left: 33%;
  margin-right: 33%;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  border-color: ${Colors.lightGray300};
  margin-bottom: 24px;
`;

const ButtonText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${Colors.white};
`;

const ButtonWrapper = styled.View`
  flex: 1;
  margin-right: ${({ isLast }) => (isLast ? '0px' : '16px')};
`;

const ButtonBodyCreate = styled(Button)`
  margin: 0;
  padding: 4px;
  border-radius: 24px;
`;

const BodyButton = ({ onPress, children, selected }) => (
  <ButtonBodyCreate
    mode="contained"
    onPress={onPress}
    buttonColor={selected ? Colors.blue : Colors.lightGray100}
    textColor={selected ? Colors.white : Colors.lightGray400}
    labelStyle={{
      fontSize: 18,
      fontWeight: '500',
    }}
  >
    {children}
  </ButtonBodyCreate>
);

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  marging-horizontal: 16px;
  margin-bottom: 24px;
`;

const ButtonBottomCreate = styled(Button)`
  margin: 0;
  padding: 4px 0;
  border-radius: 24px;
  width: 100%;
`;

const BottomButton = ({ onPress, children, reset, running }) => (
  <ButtonBottomCreate
    mode={reset ? "outlined" : "contained"}
    onPress={onPress}
    buttonColor={reset ? Colors.white : running ? Colors.red : Colors.blue}
    textColor={reset ? Colors.lightGray100 : Colors.white}
    labelStyle={{
      fontSize: 18,
      fontWeight: '500',
    }}
    style={
      reset
        ? {
          borderWidth: 2,
          borderColor: Colors.lightGray100,
          backgroundColor: Colors.blueBackgroundColor,
        }
        : {}
    }
  >
    {children}
  </ButtonBottomCreate>
);

const BottomButtonContainer = styled.View`
  width: 100%;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  margin-bottom: 16px;
  gap: 24px;
`;

export default {
  Container,
  TimerHeader,
  TimerContainer,
  TimerText,
  TimerValue,
  TimerButton,
  TimerBody,
  TimerPickerContainer,
  BodyButton,
  BottomButton,
  ButtonWrapper,
  ButtonText,
  Card,
  DividerTop,
  DividerTimer,
  ButtonContainer,
  BottomButtonContainer,
  Block,
};
