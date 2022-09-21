import { SafeAreaView } from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { ActionsBarContext } from '../../store/context/actions-bar-context';
import BottomSheetChat from '../../components/chat/bottom-sheet-chat';
import { BottomSheetContext } from '../../store/context/bottom-sheet-context';
import { useOrientation } from '../../hooks/use-orientation';
import Colors from '../../constants/colors';
import Styled from './styles';

const ClassroomMainScreen = () => {
  // variables
  const usersStore = useSelector((state) => state.usersCollection);
  const groupChatMsgStore = useSelector(
    (state) => state.groupChatMsgCollection
  );
  const videoStreamsStore = useSelector((state) => state.videoStreamsCollection);
  const orientation = useOrientation();
  const [switchLandscapeLayout, setSwitchLandscapeLayout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const actionsBarCtx = useContext(ActionsBarContext);
  const bottomSheetCtx = useContext(BottomSheetContext);
  const { actionsBarStatus } = actionsBarCtx;
  const { bottomSheet } = bottomSheetCtx;

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

  const handleMessages = useCallback(
    () =>
      Object.values(groupChatMsgStore.groupChatMsgCollection).map((message) => {
        // TODO this method will be huge, move this to another file
        // if is a poll result message
        if (message.id.toString().includes('PUBLIC_CHAT_POLL_RESULT')) {
          return {
            author: 'Sistema',
            timestamp: message.timestamp,
            message:
              'Uma enquete foi publicada, verifique a seção destinada a enquete para observar os resultados',
          };
        }
        // if is a clear chat message
        if (message.id.toString().includes('PUBLIC_CHAT_CLEAR')) {
          return {
            author: 'Sistema',
            timestamp: message.timestamp,
            message:
              'O histórico do bate-papo público foi apagado por um moderador',
          };
        }
        return {
          author: message.senderName,
          timestamp: message.timestamp,
          message: message.message,
          role: message.senderRole,
          // ...other properties
        };
      }),
    [groupChatMsgStore]
  );

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
            {actionsBarStatus.isChatActive && (
              <Styled.Chat
                messages={handleMessages()}
                onPressItem={() =>
                  bottomSheetCtx.triggerButton('chatBottomSheet', true)
                }
              />
            )}
          </Styled.ChatContainer>

          <Styled.ActionsBarContainer>
            <Styled.ActionsBar />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
        {bottomSheet.chatBottomSheet && (
          <BottomSheetChat messages={handleMessages()} />
        )}
      </SafeAreaView>
    );
  };

  const renderLandscapeOrientation = () => {
    return (
      <SafeAreaView>
        <Styled.ContainerView orientation={orientation}>
          <Styled.ContentAreaContainer orientation={orientation}>
            {actionsBarStatus.isChatActive && (
              <Styled.Chat
                messages={handleMessages()}
                onPressItem={() =>
                  bottomSheetCtx.triggerButton('chatBottomSheet', true)
                }
              />
            )}
            {!actionsBarStatus.isChatActive && (
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
            )}
          </Styled.ContentAreaContainer>
          <Styled.ActionsBarContainer orientation={orientation}>
            <Styled.ActionsBar orientation={orientation} />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
        {bottomSheet.chatBottomSheet && (
          <BottomSheetChat messages={handleMessages()} />
        )}
      </SafeAreaView>
    );
  };

  // return
  if (isLoading) return Styled.renderSkeletonLoading();
  if (orientation === 'PORTRAIT') return renderPortraitOrientation();
  return renderLandscapeOrientation();
};

export default ClassroomMainScreen;
