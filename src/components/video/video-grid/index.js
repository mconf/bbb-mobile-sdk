import React, { useCallback, useState } from 'react';
import { FlatList, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { selectSortedVideoUsers } from '../../../store/redux/slices/video-streams';
import Styled from './styles';

const DEVICE_HEIGHT = parseInt(Dimensions.get('window').height, 10);

const GridView = () => {
  const videoUsers = useSelector(selectSortedVideoUsers);

  const contentAreaUserItem = {
    cameraId: 'ContentArea',
    contentArea: true,
  };

  const mescleGridItems = [contentAreaUserItem, ...videoUsers];
  const [numOfColumns, setNumOfColumns] = useState(1);

  useFocusEffect(
    useCallback(() => {
      setNumOfColumns(mescleGridItems.length > 2 ? 2 : 1);
    }, [mescleGridItems])
  );

  const renderItem = (videoUser) => {
    const { item: vuItem } = videoUser;
    const {
      cameraId,
      userId,
      userAvatar,
      userColor,
      name,
      local,
      visible,
      userRole,
      contentArea,
      userEmoji,
    } = vuItem;

    if (contentArea) {
      return (
        <Styled.Item usersCount={mescleGridItems.length} dimensionHeight={DEVICE_HEIGHT}>
          <Styled.ContentArea />
        </Styled.Item>
      );
    }

    return (
      <Styled.Item usersCount={mescleGridItems.length} dimensionHeight={DEVICE_HEIGHT}>
        <Styled.VideoListItem
          cameraId={cameraId}
          userId={userId}
          userAvatar={userAvatar}
          userColor={userColor}
          userName={name}
          local={local}
          visible={visible}
          isGrid
          usersCount={mescleGridItems.length}
          userRole={userRole}
          userEmoji={userEmoji}
        />
      </Styled.Item>
    );
  };

  return (
    <FlatList
      data={mescleGridItems}
      style={Styled.styles.container}
      renderItem={renderItem}
      numColumns={numOfColumns}
      initialNumToRender={2}
      key={numOfColumns}
      disableIntervalMomentum
    />
  );
};

export default GridView;
