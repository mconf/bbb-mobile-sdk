import styled from 'styled-components/native';
import iconButton from '../../icon-button';
import Colors from '../../../constants/colors';

const DrawerIcon = styled(iconButton)`
  position: absolute;
  padding: 0px;
`;

const NotificationIcon = styled(iconButton)`
  position: absolute;
  right: 8px;
  padding: 0px;
  margin: 0px;
`;

const HeaderTitleContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 10px;

  ${({ recordMeeting }) => recordMeeting 
    && `
      margin-left: 6%; 
  `}

`;

const HeaderTitleText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  max-width: 80%;
`;

export default {
  DrawerIcon,
  NotificationIcon,
  HeaderTitleContainer,
  HeaderTitleText
};
