import { useSelector } from 'react-redux';
import { selectUsers } from '../../store/redux/slices/users';
import Styled from './styles';

const UserAvatar = (props) => {
  const {
    userName, userRole, userColor, userImage, isTalking, userId,
  } = props;

  const currentUserObj = useSelector(selectUsers);
  const presenterUser = currentUserObj.find((user) => user.presenter === true);

  const shouldRenderPresenterIcon = presenterUser && presenterUser.userId === userId;

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
      {shouldRenderPresenterIcon && (
        <Styled.PresenterIcon
          icon="presentation"
          size={13}
        />
      )}
    </Styled.Background>
  );
};

export default UserAvatar;
