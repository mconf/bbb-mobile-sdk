import Styled from './styles';

const UserAvatar = (props) => {
  const { userName, userRole } = props;

  return (
    <Styled.Background userRole={userRole}>
      <Styled.UserName>{userName.substring(0, 2)}</Styled.UserName>
    </Styled.Background>
  );
};

export default UserAvatar;
