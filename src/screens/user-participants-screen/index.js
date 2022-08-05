import { Alert } from 'react-native';
import { useOrientation } from '../../hooks/use-orientation';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const userListNames = [
    'Patolino',
    'Gaguinho',
    'Pernalonga',
    'Taz',
    'Lola',
    'Frajola',
    'Gaguinho',
    'Pernalonga',
    'Taz',
    'Lola',
    'Frajola',
  ];

  const orientation = useOrientation();

  const renderItem = ({ item }) => {
    return (
      <Styled.CardPressable
        onPress={() =>
          Alert.alert(
            'Currently under development',
            'This feature will be addressed soon, please check out our github page'
          )
        }
      >
        <Styled.UserAvatar userName={item} />
        <Styled.UserName>{item}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  return (
    <Styled.ContainerView orientation={orientation}>
      <Styled.FlatList data={userListNames} renderItem={renderItem} />

      <Styled.ActionsBarContainer orientation={orientation}>
        <Styled.ActionsBar orientation={orientation} />
      </Styled.ActionsBarContainer>
    </Styled.ContainerView>
  );
};

export default UserParticipantsScreen;
