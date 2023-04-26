import styled from 'styled-components/native';
import { Divider } from 'react-native-paper';
import Colors from '../../../constants/colors';
import actionsBar from '../../../components/actions-bar';
import button from '../../../components/button';
import iconButton from '../../../components/icon-button';

const ContainerView = styled.View`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  padding-top: 20px;
  padding-bottom: 20px;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
    flex-direction: row;
    justify-content: center;
  `}
`;

const ActionsBar = styled(actionsBar)`
  ${({ orientation }) => orientation === 'LANDSCAPE'
  && `
      flex-direction: column;
      display: flex;
  `}
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

const GuestPolicyTop = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 12px;
`;

const GuestPolicyTopText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  color: ${Colors.white};
  text-align: center;
`;

const DividerTop = styled(Divider)`
  margin-top: 6px;
  margin-left: 6px;
  margin-right: 6px;
  border-width: 1px;
  border-color: ${Colors.white};
`;

const GuestPolicyView = styled.View`
  width: 100%;
  display: flex;

  ${({ orientation }) => orientation === 'LANDSCAPE'
    && `
      width: 90%;
  `}
`;

const OptionsButton = styled(button)`
  background-color: ${Colors.white}
  color: ${Colors.lightGray400};
  font-size: 16px;
  font-weight: 500;
  padding: 12px;
  border-radius: 12px;

  ${({ selected }) => selected
    && `
      background-color: ${Colors.blue};
      color: ${Colors.white};
  `}
`;

const OptionsButtonsContainer = styled.View`
  margin-top: 24px;
  margin-bottom: 12px;
`;

const BackIcon = styled(iconButton)`
  position: absolute;
  left: -12px;
`;

export default {
  ActionsBar,
  ActionsBarContainer,
  ContainerView,
  GuestPolicyView,
  GuestPolicyTop,
  GuestPolicyTopText,
  DividerTop,
  OptionsButton,
  OptionsButtonsContainer,
  BackIcon
};
