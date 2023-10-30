import { useSelector } from 'react-redux';
import { selectUserByIntId, selectUsers } from '../../store/redux/slices/users';
import Styled from './styles';

const UserAvatar = (props) => {
  const {
    userName, userRole, userColor, userImage, isTalking, mini, userId
  } = props;

  const currentUserObj = useSelector(selectUsers);
  const presenterUser = currentUserObj.find((user) => user.presenter === true);

  const shouldRenderPresenterIcon = presenterUser && presenterUser.userId === userId;

  const userColorByIntId = useSelector((state) => {
    if (!userId) {
      return;
    }
    return selectUserByIntId(state, userId)?.color;
  });

  return (
    <Styled.Background
      userRole={userRole}
      userColor={userColor || userColorByIntId}
      userImage={userImage}
      isTalking={isTalking}
      mini={mini}
    >
      {userImage
        ? (
          <Styled.ImageContainer userRole={userRole}>
            <Styled.ImageBackground source={{ uri: userImage }} userRole={userRole} />
          </Styled.ImageContainer>
        )
        : <Styled.UserName mini={mini}>{userName?.substring(0, 2)}</Styled.UserName>}
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
