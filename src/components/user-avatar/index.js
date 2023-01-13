import Styled from './styles';

const UserAvatar = (props) => {
  const { userName, userRole, userColor } = props;

  return (
    <Styled.Background userRole={userRole} userColor={userColor}>
      <Styled.UserName>{userName?.substring(0, 2)}</Styled.UserName>
    </Styled.Background>
  );
};

export default UserAvatar;
