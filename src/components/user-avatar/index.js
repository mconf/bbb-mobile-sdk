import Styled from './styles';

const UserAvatar = (props) => {
  const {
    userName, userRole, userColor, userImage, isTalking
  } = props;

  return (
    <Styled.Background
      userRole={userRole}
      userColor={userColor}
      userImage={userImage}
      isTalking={isTalking}
    >
      {userImage
        ? (
          <Styled.ImageContainer userRole={userRole}>
            <Styled.ImageBackground source={{ uri: userImage }} userRole={userRole} />
          </Styled.ImageContainer>
        )
        : <Styled.UserName>{userName?.substring(0, 2)}</Styled.UserName>}
    </Styled.Background>
  );
};

export default UserAvatar;
