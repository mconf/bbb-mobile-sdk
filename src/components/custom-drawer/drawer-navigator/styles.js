import styled from 'styled-components/native';
import Icon from '@expo/vector-icons/MaterialIcons';
import iconButton from '../../icon-button';
import Colors from '../../../constants/colors';
import Tag from '../../tag';

const DrawerIcon = styled(iconButton)`
  position: absolute;
  padding: 0px;
`;

const IconMaterial = styled(Icon)`
  position: absolute;
  left: 0px;
  margin: 14px;
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
`;

const HeaderTitleText = styled.Text`
  color: ${Colors.white};
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  max-width: 80%;
`;

const BetaTag = styled(Tag)`
  position: absolute;
  right: 12px;
`;

export default {
  DrawerIcon,
  NotificationIcon,
  HeaderTitleContainer,
  HeaderTitleText,
  BetaTag,
  IconMaterial
};
