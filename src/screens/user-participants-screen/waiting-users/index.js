import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useOrientation } from '../../../hooks/use-orientation';
import withPortal from '../../../components/high-order/with-portal';
import Styled from './styles';
import Service from './service';
import Colors from '../../../constants/colors';
import { selectWaitingUsers } from '../../../store/redux/slices/guest-users';
import { isModerator } from '../../../store/redux/slices/current-user';

const ALLOW_STATUS = 'ALLOW';
const DENY_STATUS = 'DENY';

const WaitingUsersScreen = ({ navigation }) => {
  const amIModerator = useSelector(isModerator);
  const pendingUsers = useSelector(selectWaitingUsers);
  const { t } = useTranslation();

  const handleUsersName = useCallback(
    () => pendingUsers.map((user) => {
      return {
        name: user.name,
        role: user.role,
        color: user.color,
        // ...other properties
      };
    }),
    [pendingUsers]
  );

  const orientation = useOrientation();

  const renderItem = ({ item, index }) => {
    return (
      <Styled.UserCard>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
        />
        <Styled.UserName>{item.name}</Styled.UserName>
        <Styled.AllowButton
          icon="check-circle-outline"
          iconColor={Colors.green}
          animated
          size={32}
          onPress={() => { Service.handleAllowPendingUsers([pendingUsers[index]], ALLOW_STATUS); }}
        />
        <Styled.DenyButton
          icon="close-circle-outline"
          iconColor={Colors.red}
          animated
          size={32}
          onPress={() => { Service.handleAllowPendingUsers([pendingUsers[index]], DENY_STATUS); }}
        />
      </Styled.UserCard>
    );
  };

  // lifecycle methods
  useEffect(() => {
    // user got demoted to viewer, go out of this screen as he does not have
    // permission to use it
    if (!amIModerator) {
      navigation.goBack();
    }
  }, [amIModerator]);

  return (
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
          <Styled.AccRejButtons>
            <Styled.AccRejButtonsText
              disabled={pendingUsers.length === 0}
              onPress={() => {
                Service.handleAllowPendingUsers(pendingUsers, ALLOW_STATUS);
                navigation.goBack();
              }}
            >
              {t('app.userList.guest.allowEveryone')}
            </Styled.AccRejButtonsText>
          </Styled.AccRejButtons>
          <Styled.AccRejButtons>
            <Styled.AccRejButtonsText
              disabled={pendingUsers.length === 0}
              onPress={() => {
                Service.handleAllowPendingUsers(pendingUsers, DENY_STATUS);
                navigation.goBack();
              }}
            >
              {t('app.userList.guest.denyEveryone')}
            </Styled.AccRejButtonsText>
          </Styled.AccRejButtons>
        </Styled.AccRejContainer>
        {pendingUsers.length > 0
          ? <Styled.FlatList data={handleUsersName()} renderItem={renderItem} />
          : (
            <Styled.NoPendingUsersText>
              {t('app.userList.guest.noPendingUsers')}
            </Styled.NoPendingUsersText>
          )}
      </Styled.WaitingUsersView>
    </Styled.ContainerView>
  );
};

export default withPortal(WaitingUsersScreen);
