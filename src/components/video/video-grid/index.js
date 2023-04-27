import React from 'react';
import {
  StyleSheet, View, FlatList, Dimensions
} from 'react-native';
import { useSelector } from 'react-redux';
import Styled from './styles';
import { selectSortedVideoUsers } from '../../../store/redux/slices/video-streams';

const GridView = () => {
  const numColumns = 2;

  const videoUsers = useSelector(selectSortedVideoUsers);

  const contentAreaUserItem = {
    cameraId: 'ContentArea',
    contentArea: true,
  };

  const mescleGridItems = [contentAreaUserItem, ...videoUsers];

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
    } = vuItem;

    if (contentArea) {
      return (
        <View
          style={styles.item}
        >
          <Styled.ContentArea />
        </View>
      );
    }

    return (
      <View
        style={styles.item}
      >
        <Styled.VideoListItem
          cameraId={cameraId}
          userId={userId}
          userAvatar={userAvatar}
          userColor={userColor}
          userName={name}
          local={local}
          visible={visible}
          isGrid
          userRole={userRole}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={mescleGridItems}
      style={styles.container}
      renderItem={renderItem}
      numColumns={numColumns}
      initialNumToRender={4}
      disableIntervalMomentum
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    backgroundColor: '#d0c4cb',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '50%',
    height: Dimensions.get('window').width / 2, // approximate a square
  },
  itemPresentation: {
    backgroundColor: '#d0c4cb',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    height: Dimensions.get('window').width / 2, // approximate a square
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: '#fff',
  },
});

export default GridView;
