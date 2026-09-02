import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import useCurrentUser from '../../../graphql/hooks/useCurrentUser';
import useUserList from '../../../graphql/hooks/useUserList';
import { useOrientation } from '../../../hooks/use-orientation';
import Styled from './styles';

const getNumOfColumns = ({ usersCount, isLandscape, isPresentationOpen }) => {
  if (isLandscape) {
    // With the presentation open the cameras become a side column next to
    // it; otherwise two wide tiles per row fill the screen.
    if (isPresentationOpen) return 1;
    return usersCount > 1 ? 2 : 1;
  }
  return usersCount > 2 ? 2 : 1;
};

const GridView = () => {
  const isPresentationOpen = useSelector((state) => state.layout.isPresentationOpen);
  const { data: userData } = useUserList();
  const { data: currentUserData } = useCurrentUser();
  const isLandscape = useOrientation() === 'LANDSCAPE';
  const videoUsersCopy = userData?.user.filter(() => true);
  const usersCount = videoUsersCopy?.length || 0;
  const [numOfColumns, setNumOfColumns] = useState(1);
  // Measured instead of derived from the window size: it already accounts
  // for the header, the indicator bar and the current orientation.
  const [gridHeight, setGridHeight] = useState(0);
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
      setNumOfColumns(getNumOfColumns({ usersCount, isLandscape, isPresentationOpen }));
    }, [usersCount, isLandscape, isPresentationOpen])
  );

  const onGridLayout = useCallback(({ nativeEvent }) => {
    setGridHeight(Math.round(nativeEvent.layout.height));
  }, []);

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
        usersCount={usersCount}
        dimensionHeight={gridHeight}
        isPresentationOpen={isPresentationOpen}
        isLandscape={isLandscape}
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
          usersCount={usersCount}
          userRole={role}
          userEmoji={emoji}
          raiseHand={raiseHand}
        />
      </Styled.Item>
    );
  };

  return (
    <Styled.GridContainer isLandscape={isLandscape} onLayout={onGridLayout}>
      <Styled.ContainerViewItem
        isPresentationOpen={isPresentationOpen}
        isLandscape={isLandscape}
        dimensionHeight={gridHeight}
      >
        <Styled.ContentArea />
      </Styled.ContainerViewItem>
      {gridHeight > 0 && (
        <FlatList
          data={videoUsersCopy}
          style={Styled.styles.container}
          renderItem={renderItem}
          numColumns={numOfColumns}
          initialNumToRender={2}
          key={`${numOfColumns}-${isLandscape}`}
          disableIntervalMomentum
        />
      )}
    </Styled.GridContainer>
  );
};

export default GridView;
