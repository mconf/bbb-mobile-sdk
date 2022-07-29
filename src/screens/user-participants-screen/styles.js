import styled from 'styled-components/native';
import userAvatar from '../../components/user-avatar';
import Colors from '../../constants/colors';

const CardPressable = styled.Pressable`
  background-color: ${Colors.white};
  width: 100%;
  min-height: 20px;
  border-radius: 12px;
  padding: 12px;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const UserName = styled.Text`
  color: black;
  padding-left: 20px;
  font-size: 16px;
`;

const UserAvatar = styled(userAvatar)``;
const FlatList = styled.FlatList`
  padding: 12px;
`;

export default {
  UserAvatar,
  UserName,
  CardPressable,
  FlatList,
};
