import styled from 'styled-components/native';
import button from '../../../../components/button';
import Colors from '../../../../constants/colors';
import actionsBar from '../../../../components/actions-bar';

const ConfirmButton = styled(button)`
  background-color: ${Colors.orange};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 12px;
  margin-top: 32px;
`;

const CancelButton = styled(button)`
  background-color: ${Colors.lightGray300};
  color: ${Colors.white};
  font-size: 16px;
  font-weight: 400;
  padding: 12px;
  border-radius: 12px;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const AnswerTitle = styled.Text`
  font-weight: 500;
  font-size: 18px;
  padding: 24px 0;
  text-align: center;
`;

const Answer = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: #667080;
  width: 30%;
  text-align: center;
`;

const Bar = styled.View`
  background-color: #D4DDE4;
  border-radius: 4px;
  height: 30px;
`;

const BarContainer = styled.View`
  width: 55%;
`;

const InsideBarText = styled.Text`
  color: #667080;
  font-weight: 400;
  font-size: 12px;
  position: absolute;
`;

const Percentage = styled.Text`
  font-weight: 400;
  font-size: 16px;
  color: #667080;
  text-align: center;
  width: 15%;
`;

const AnswerContainer = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 4px;
`;

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ContainerViewPadding = styled.View`
  padding: 12px;
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      width: 10%;
      height: 100%;
  `}
`;

const ContainerPollCard = styled.ScrollView`
  background-color: ${Colors.white};
  width: 100%;
  max-height: 85%;
  border-radius: 12px;
  display: flex;
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      flex-direction: column;
      display: flex;
  `}
`;

export default {
  Title,
  AnswerTitle,
  ConfirmButton,
  Answer,
  Bar,
  Percentage,
  AnswerContainer,
  InsideBarText,
  BarContainer,
  ContainerView,
  ContainerViewPadding,
  ActionsBarContainer,
  ContainerPollCard,
  ActionsBar,
  CancelButton,
};
