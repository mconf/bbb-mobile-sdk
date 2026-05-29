import styled from 'styled-components/native';
import Icon from '@expo/vector-icons/MaterialIcons';
import iconButton from '../../icon-button';
import Colors from '../../../constants/colors';
import Tag from '../../tag';

const DrawerIcon = styled(iconButton)`
  position: absolute;
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

const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 24px;
  margin-right: 12px;
`;

const BetaTag = styled(Tag)`
  position: absolute;
  right: 12px;
`;

const ScreenOptions = {
  contentOptions: {
    style: {
      backgroundColor: 'black',
      flex: 1,
    },
  },
  drawerStyle: {
    width: '80%',
  },
  drawerItemStyle: {
    borderRadius: 8,
  },
  drawerLabelStyle: {
    textAlign: 'left',
    textAlignVertical: 'center',
    paddingLeft: 12,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 18,
  },
  sceneContainerStyle: { backgroundColor: '#06172A' },
  drawerActiveBackgroundColor: Colors.blue,
  drawerInactiveBackgroundColor: Colors.lightGray100,
  drawerActiveTintColor: Colors.white,
  drawerInactiveTintColor: Colors.lightGray400,
  headerStyle: { backgroundColor: Colors.blue },
  headerTitleContainerStyle: { maxWidth: '75%' },
  headerTintColor: Colors.white,
  drawerBackgroundColor: Colors.blue,
  headerTitleAlign: 'center',
};

export default {
  DrawerIcon,
  NotificationIcon,
  HeaderTitleContainer,
  HeaderTitleText,
  HeaderRight,
  BetaTag,
  IconMaterial,
  ScreenOptions,
};
