import { useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import ScreenWrapper from '../../../components/screen-wrapper';
import Styled from './styles';
import Colors from '../../../constants/colors';
import { SUBMIT_APPROVAL_STATUS } from '../../../graphql/mutations/guestPolicy';
import useGuestWaitingList from '../../../graphql/hooks/useGuestWaitingList'
import useCurrentUser from '../../../graphql/hooks/useCurrentUser'
import PrimaryButton from '../../../components/buttons/primary-button';

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const WaitingUsersScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { data: currentUserData, loading, error } = useCurrentUser();
  const { data: pendingUsersData } = useGuestWaitingList();
  const currentUser = currentUserData?.user_current[0];
  const pendingUsers = pendingUsersData?.user_guest || [];
  const [dispatchSubmitApprovalStatus] = useMutation(SUBMIT_APPROVAL_STATUS);

  const handleDispatchSubmitApprovalStatus = (waitingGuests, status) => {
    const formattedGuests = Array.isArray(waitingGuests) ? waitingGuests : [waitingGuests];
    const guests = formattedGuests.map(guest => ({
      guest: guest.userId,
      status: status
    }));

    dispatchSubmitApprovalStatus({
      variables: {
        guests
      }
    })
  };

  const orientation = useOrientation();

  const renderItem = ({ item, index }) => {

    return (
      <Styled.UserCard>
        <Styled.UserAvatar
          userName={item.user.name}
          userRole={item.user.role}
          userColor={item.user.color}
        />
        <Styled.UserName>{item.user.name}</Styled.UserName>
        <Styled.AllowButton
          icon="check-circle-outline"
          iconColor={Colors.green}
          animated
          size={32}
          onPress={() => { handleDispatchSubmitApprovalStatus(pendingUsers[index], ALLOW_STATUS) }}
        />
        <Styled.DenyButton
          icon="close-circle-outline"
          iconColor={Colors.red}
          animated
          size={32}
          onPress={() => { handleDispatchSubmitApprovalStatus(pendingUsers[index], DENY_STATUS) }}
        />
      </Styled.UserCard>
    );
  };

  // lifecycle methods
  useEffect(() => {
    // user got demoted to viewer, go out of this screen as he does not have
    // permission to use it
    if (!loading) {
      if (!currentUser?.isModerator || error) {
        navigation.goBack();
      }
    }
  }, [currentUserData, loading, error]);

  return (
    <ScreenWrapper>
      <Styled.ContainerView orientation={orientation}>
        <Styled.WaitingUsersView orientation={orientation}>
          <Styled.WaitingUsersTop>
            <Styled.BackIcon
              icon="arrow-left"
              iconColor={Colors.white}
              onPress={() => { navigation.goBack(); }}
            />
            <Styled.WaitingUsersTopText>{t('mobileSdk.userList.waitingAtendees')}</Styled.WaitingUsersTopText>
          </Styled.WaitingUsersTop>
          <Styled.DividerTop />
          <Styled.AccRejContainer>
            <PrimaryButton
              variant="secondaryAlt"
              mode="pollOptions"
              fullWidth={false}
              disabled={pendingUsers?.length === 0}
              onPress={() => {
                handleDispatchSubmitApprovalStatus(pendingUsers, ALLOW_STATUS)
                navigation.goBack();
              }}
            >
              {t('app.userList.guest.allowEveryone')}
            </PrimaryButton>
            <PrimaryButton
              variant="secondaryAlt"
              mode="pollOptions"
              fullWidth={false}
              disabled={pendingUsers?.length === 0}
              onPress={() => {
                handleDispatchSubmitApprovalStatus(pendingUsers, DENY_STATUS)
                navigation.goBack();
              }}
            >
              {t('app.userList.guest.denyEveryone')}
            </PrimaryButton>
          </Styled.AccRejContainer>
          {pendingUsers?.length > 0
            ? <Styled.FlatList data={pendingUsers} renderItem={renderItem} />
            : (
              <Styled.NoPendingUsersText>
                {t('app.userList.guest.noPendingUsers')}
              </Styled.NoPendingUsersText>
            )}
        </Styled.WaitingUsersView>
      </Styled.ContainerView>
    </ScreenWrapper>
  );
};

export default WaitingUsersScreen;
