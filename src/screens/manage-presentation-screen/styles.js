import styled from 'styled-components/native';
import actionsBar from '../../components/actions-bar';
import button from '../../components/button';
import Colors from '../../constants/colors';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 10px;

  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ActionsBarContainer = styled.View`
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
      width: 10%;
      height: 100%;
  `}
`;

const ContainerPresentationCard = styled.View`
  background-color: ${Colors.white};
  width: 100%;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  height: 85%;
`;

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

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) =>
    orientation === 'LANDSCAPE' &&
    `
      flex-direction: column;
      display: flex;
  `}
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 24px;
`;

const ContainerPresentationList = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ContainerFileView = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ContainerButtonView = styled.View`
  flex-direction: row;
`;

const FileNameText = styled.Text``;

export default {
  ContainerView,
  ActionsBarContainer,
  ActionsBar,
  ContainerPresentationCard,
  Title,
  ConfirmButton,
  ContainerPresentationList,
  ContainerButtonView,
  ContainerFileView,
  FileNameText,
};
