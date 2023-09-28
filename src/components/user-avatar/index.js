import { useSelector } from 'react-redux';
import { selectUserByIntId } from '../../store/redux/slices/users';
import Styled from './styles';

const UserAvatar = (props) => {
  const {
    userName, userRole, userColor, userImage, isTalking, mini, userId
  } = props;

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
    </Styled.Background>
  );
};

export default UserAvatar;
