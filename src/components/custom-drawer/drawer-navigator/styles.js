import styled from 'styled-components/native';
import iconButton from '../../icon-button';

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

export default {
  DrawerIcon,
  NotificationIcon
};
