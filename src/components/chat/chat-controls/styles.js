import styled from 'styled-components/native';
import iconButton from '../../icon-button/index';

const NotificationIcon = styled(iconButton)`
  position: absolute;
  padding: 0px;
  margin: 0px;
  z-index: 1;
  height: 12px;
  width: 12px;
  right: 8px;
  top: 8px;
`;

const Container = styled.View`
  position: relative;
`;

export default {
  NotificationIcon,
  Container,
};
