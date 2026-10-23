import { Modal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import { hide } from '../../../store/redux/slices/wide-app/modal';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import UserAvatar from '../../../components/user-avatar';
import Styled from './styles';

const PickRandomUserModal = () => {
  const modalCollection = useSelector((state) => state.modal);
  const orientation = useOrientation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { data: currentUserData } = useCurrentUser();
  const currentUserId = currentUserData?.user_current[0]?.userId;
  const {
    selectedUserId,
    selectedUserName,
    selectedUserColor,
    selectedUserAvatar,
    selectedUserRole,
  } = modalCollection.extraInfo || {};
  const isCurrentUserPicked = !!currentUserId && selectedUserId === currentUserId;

  const renderUserSelected = () => {
    return (
      <Styled.Container orientation={orientation}>
        <Styled.TitleModal>
          {isCurrentUserPicked
            ? t('app.pickRandomUser.modal.currentUserPicked')
            : t('app.pickRandomUser.modal.participantPicked')}
        </Styled.TitleModal>
        <UserAvatar
          userName={selectedUserName}
          userColor={selectedUserColor}
          userImage={selectedUserAvatar}
          userRole={selectedUserRole}
        />
        <Styled.UserName>
          {selectedUserName}
        </Styled.UserName>
      </Styled.Container>
    )
  };

  return (
    <Modal
      visible={modalCollection.isShow}
      onDismiss={() => dispatch(hide())}
    >
      {renderUserSelected()}
    </Modal>
  );
};

export default PickRandomUserModal;
