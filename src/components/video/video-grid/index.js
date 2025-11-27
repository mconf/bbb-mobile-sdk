import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useUserList from '../../../graphql/hooks/useUserList';
import Styled from './styles';

const DEVICE_HEIGHT = parseInt(Dimensions.get('window').height, 10);

const GridView = () => {
  const isPresentationOpen = useSelector((state) => state.layout.isPresentationOpen);
  const { data: userData } = useUserList();
  const { data: currentUserData } = useCurrentUser();
  const videoUsersCopy = userData?.user.filter(() => true);
  const [numOfColumns, setNumOfColumns] = useState(1);
  const currentUserId = currentUserData?.user_current[0].userId;

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
