import { SafeAreaView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setBottomChatOpen } from '../../store/redux/slices/wide-app/chat';

import BottomSheetChat from '../../components/chat/bottom-sheet-chat';
import { useOrientation } from '../../hooks/use-orientation';
import Colors from '../../constants/colors';
import Styled from './styles';

const ClassroomMainScreen = () => {
  // variables
  const usersStore = useSelector((state) => state.usersCollection);
  const chatStore = useSelector((state) => state.chat);
  const videoStreamsStore = useSelector(
    (state) => state.videoStreamsCollection
  );
  const orientation = useOrientation();
  const [switchLandscapeLayout, setSwitchLandscapeLayout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // handle redux store methods
  const handleVideoUsers = useCallback(() => {
    // TODO refactor. This is ugly, inefficient and sucks - prlanzarin
    return Object.values(usersStore.usersCollection).map((user) => {
      const cameraId = Object.values(
        videoStreamsStore.videoStreamsCollection
      ).find((stream) => stream.userId === user.intId)?.stream;
      return {
        userName: user.name,
        cameraId,
        userAvatar: user.avatar,
        userColor: user.color,
        // ...other properties
      };
    });
  }, [usersStore, videoStreamsStore]);

  // lifecycle methods
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // view components
  const renderPortraitOrientation = () => {
    return (
      <SafeAreaView>
        <Styled.ContainerView>
          <Styled.VideoListContainer>
            <Styled.VideoList videoUsers={handleVideoUsers()} />
          </Styled.VideoListContainer>

          <Styled.ContentAreaContainer>
            <Styled.ContentArea width="100%" height="100%" />
          </Styled.ContentAreaContainer>

          <Styled.ChatContainer>
            {chatStore.isFastChatOpen && (
              <Styled.Chat
                onPressItem={() => dispatch(setBottomChatOpen(true))}
              />
            )}
          </Styled.ChatContainer>

          <Styled.ActionsBarContainer>
            <Styled.ActionsBar />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
        {chatStore.isBottomChatOpen && <BottomSheetChat />}
      </SafeAreaView>
    );
  };

  const renderLandscapeOrientation = () => {
    return (
      <SafeAreaView>
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContentAreaContainer orientation={orientation}>
            <>
              {switchLandscapeLayout && (
                <Styled.ContentArea width="100%" height="100%" />
              )}
              {!switchLandscapeLayout && (
                <Styled.VideoListContainer orientation={orientation}>
                  <Styled.VideoList
                    videoUsers={handleVideoUsers()}
                    orientation={orientation}
                  />
                </Styled.VideoListContainer>
              )}
              <Styled.SwitchLayoutButton
                icon="animation-play-outline"
                iconColor={Colors.lightGray300}
                containerColor={Colors.lightGray100}
                animated
                onPress={() =>
                  setSwitchLandscapeLayout((prevState) => !prevState)
                }
              />
            </>
          </Styled.ContentAreaContainer>
          <Styled.ActionsBarContainer orientation={orientation}>
            <Styled.ActionsBar orientation={orientation} />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
        {chatStore.isBottomChatOpen && <BottomSheetChat />}
      </SafeAreaView>
    );
  };

  // return
  if (isLoading) return Styled.renderSkeletonLoading();
  if (orientation === 'PORTRAIT') return renderPortraitOrientation();
  return renderLandscapeOrientation();
};

export default ClassroomMainScreen;
