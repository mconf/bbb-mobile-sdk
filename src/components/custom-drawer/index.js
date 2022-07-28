import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Styled from './styles';

const CustomDrawer = (props) => (
  <Styled.ViewContainer>
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ backgroundColor: '#003399CC' }}
    >
      <Styled.CustomDrawerContainer>
        <Styled.UserAvatar userName="Patolino" />
        <Styled.NameUserAvatar>Patolino</Styled.NameUserAvatar>
      </Styled.CustomDrawerContainer>
      <Styled.ContainerDrawerItemList>
        <DrawerItemList {...props} />
      </Styled.ContainerDrawerItemList>
    </DrawerContentScrollView>
    <Styled.ContainerCustomButtons>
      <Styled.ButtonLeaveContainer onPress={() => {}}>
        <Styled.ViewLeaveContainer>
          <Styled.TextLeaveContainer>Sair da sessão</Styled.TextLeaveContainer>
        </Styled.ViewLeaveContainer>
      </Styled.ButtonLeaveContainer>
    </Styled.ContainerCustomButtons>
  </Styled.ViewContainer>
);

export default CustomDrawer;
