import React, { useCallback, useState } from 'react';
import { FlatList, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useSubscription } from '@apollo/client';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import Styled from './styles';
import Queries from './queries';

const DEVICE_HEIGHT = parseInt(Dimensions.get('window').height, 10);

const GridView = () => {
  const isPresentationOpen = useSelector((state) => state.layout.isPresentationOpen);
  const { data: userData } = useSubscription(Queries.USER_LIST_SUBSCRIPTION);
  const { data: currentUserData } = useCurrentUser();
  const videoUsersCopy = userData?.user.filter(() => true);
  const [numOfColumns, setNumOfColumns] = useState(1);
  const currentUserId = currentUserData?.user_current[0].userId;
  const { t } = useTranslation();

  const removeCurrentUserFromVideoUsers = () => {
    return videoUsersCopy?.filter((user) => user.userId !== currentUserId);
  };

  useFocusEffect(
    useCallback(() => {
      removeCurrentUserFromVideoUsers();
    }, [videoUsersCopy, currentUserId])
  );

  useFocusEffect(
    useCallback(() => {
      setNumOfColumns(userData?.user.length > 2 ? 2 : 1);
    }, [userData])
  );

  const renderItem = (videoUser) => {
    const { item: vuItem } = videoUser;
    const {
      cameras,
      userId,
      avatar,
      color,
      name,
      local,
      visible,
      role,
      emoji,
      raiseHand
    } = vuItem;

    // TODO: MULTIPLE CAMERAS
    const cameraId = cameras ? cameras[0] : null;

    return (
      <Styled.Item
        usersCount={videoUsersCopy.length}
        dimensionHeight={DEVICE_HEIGHT - 90}
        isPresentationOpen={isPresentationOpen}
      >
        <Styled.VideoListItem
          cameraId={cameraId?.streamId || null}
          userId={userId}
          userAvatar={avatar}
          userColor={color}
          userName={name}
          local={local}
          visible={visible}
          isGrid
          usersCount={videoUsersCopy.length}
          userRole={role}
          userEmoji={emoji}
          raiseHand={raiseHand}
        />
      </Styled.Item>
    );
  };

  return (
    <>
      <Styled.ContainerViewItem
        isPresentationOpen={isPresentationOpen}
        dimensionHeight={DEVICE_HEIGHT - 90}
      >
        <Styled.ContentArea />
      </Styled.ContainerViewItem>
      <FlatList
        data={videoUsersCopy}
        style={Styled.styles.container}
        renderItem={renderItem}
        numColumns={numOfColumns}
        initialNumToRender={2}
        key={numOfColumns}
        disableIntervalMomentum
      />
    </>
  );
};

export default GridView;
