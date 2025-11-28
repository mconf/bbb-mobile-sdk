import { useMutation } from '@apollo/client';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { ActivityIndicator, Menu, Provider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import ScreenWrapper from '../../components/screen-wrapper';
import Colors from '../../constants/colors';
import useCurrentUser from '../../graphql/hooks/useCurrentUser';
import useGuestWaitingList from '../../graphql/hooks/useGuestWaitingList';
import useUserList from '../../graphql/hooks/useUserList';
import {
  SET_PRESENTER,
  SET_ROLE
} from '../../graphql/mutations/userList';
import { useOrientation } from '../../hooks/use-orientation';
import { isBreakout } from '../../store/redux/slices/wide-app/client';
import Styled from './styles';

const UserParticipantsScreen = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [menuAnchor, setMenuAnchor] = useState({ x: 0, y: 0 });
  const meetingIsBreakout = useSelector(isBreakout);

  const { t } = useTranslation();
  const orientation = useOrientation();
  const navigation = useNavigation();

  const { data: userListData } = useUserList();
  const { data: currentUserData } = useCurrentUser();
  const { data: pendingUsersData } = useGuestWaitingList();
  const currentUser = currentUserData?.user_current[0];
  const userList = userListData?.user ? [...userListData.user] : [];
  const pendingUsers = pendingUsersData?.user_guest;
  const [dispatchSetRole] = useMutation(SET_ROLE);
  const [dispatchSetPresenter] = useMutation(SET_PRESENTER);

  if (currentUser) {
    const currentUserIndex = userList.findIndex((u) => u.userId === currentUser.userId);
    if (currentUserIndex !== -1) {
      const [user] = userList.splice(currentUserIndex, 1);
      userList.unshift(user);
    }
  }

  const handleDispatchSetPresenter = (userId) => {
    dispatchSetPresenter({
      variables: {
        userId
      }
    })
  };

  const handleDispatchSetRole = (userId, role) => {
    role = (role === "VIEWER") ? "MODERATOR" : "VIEWER";

    dispatchSetRole({
      variables: {
        userId,
        role,
      }
    })
  };

  const onIconPress = (event, item) => {
    const { nativeEvent } = event;
    const anchor = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY - 150,
    };

    setSelectedUser(item);
    setMenuAnchor(anchor);
    setShowMenu(true);
  };

  const renderItem = ({ item }) => {
    const isMe = currentUser?.userId === item.userId;

    return (
      <Styled.CardPressable onPress={(e) => onIconPress(e, item, isMe)} isMe={isMe}>
        <Styled.UserAvatar
          userName={item.name}
          userRole={item.role}
          userColor={item.color}
          userId={item.userId}
          presenter={item.presenter}
          away={item.away}
          userImage={item.avatar}
        />
        <Styled.UserName numberOfLines={1}>{item.name}</Styled.UserName>
      </Styled.CardPressable>
    );
  };

  const renderGuestPolicy = () => (
    <>
      <Pressable
        onPress={() => {
          navigation.navigate('GuestPolicyScreen');
        }}
      >
        <Styled.GuestMenuContainer>
          <Icon name="account-cog-outline" size={24} color={Colors.white} />
          <Styled.GuestPolicyText>{t('app.guest-policy.title')}</Styled.GuestPolicyText>
          <Styled.GuestPolicyIcon
            icon="arrow-right"
            iconColor={Colors.white}
          />
        </Styled.GuestMenuContainer>
      </Pressable>
      {pendingUsers?.length > 0 && (
        <Pressable
          onPress={() => {
            navigation.navigate('WaitingUsersScreen');
          }}
        >
          <Styled.GuestMenuContainer>
            <Icon name="account-multiple-outline" size={24} color={Colors.white} />
            <Styled.GuestPolicyText>{t('mobileSdk.userList.waitingAtendees')}</Styled.GuestPolicyText>
            <Styled.GuestPolicyIcon
              icon="arrow-right"
              iconColor={Colors.white}
            />
          </Styled.GuestMenuContainer>
        </Pressable>
      )}
      <Styled.DividerTop />
    </>
  );

  const renderMenuView = () => {
    const isViewer = selectedUser.role === 'VIEWER';
    const isPresenter = selectedUser.presenter;
    const isMe = currentUser?.userId === selectedUser.userId;

    return (
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={menuAnchor}
      >
        {currentUser?.isModerator && (
          <>
            {isMe && !isPresenter && (
              <Menu.Item
                onPress={() => {
                  handleDispatchSetPresenter(selectedUser.userId)
                  setShowMenu(false);
                }}
                title={t('app.userList.menu.makePresenter.label')}
              />
            )}

            {!isMe && (
              <>
                <Menu.Item
                  onPress={() => {
                    handleDispatchSetRole(
                      selectedUser.userId,
                      selectedUser.role
                    );
                    setShowMenu(false);
                  }}
                  title={
                    isViewer
                      ? t('app.userList.menu.promoteUser.label')
                      : t('app.userList.menu.demoteUser.label')
                  }
                />
                {!isPresenter && (
                  <Menu.Item
                    onPress={() => {
                      handleDispatchSetPresenter(selectedUser.userId)
                      setShowMenu(false);
                    }}
                    title={t('app.userList.menu.makePresenter.label')}
                  />
                )}
              </>
            )}
          </>
        )}
      </Menu>
    );
  };

  if (!currentUser) {
    return (
      <Styled.LoadingWrapper>
        <ActivityIndicator size={50} />
      </Styled.LoadingWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <Provider>
        <Styled.ContainerView orientation={orientation}>
          <Styled.Block orientation={orientation}>
            {currentUser?.isModerator && !meetingIsBreakout && renderGuestPolicy()}
            <Styled.FlatList data={userList} renderItem={renderItem} />
            {renderMenuView()}
          </Styled.Block>
        </Styled.ContainerView>
      </Provider>
    </ScreenWrapper>
  );
};

export default UserParticipantsScreen;
