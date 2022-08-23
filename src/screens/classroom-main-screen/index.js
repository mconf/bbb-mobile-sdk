import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { ActionsBarContext } from '../../store/context/actions-bar-context';
import BottomSheetChat from '../../components/chat/bottom-sheet-chat';
import { BottomSheetContext } from '../../store/context/bottom-sheet-context';
import { useOrientation } from '../../hooks/use-orientation';
import Colors from '../../constants/colors';
import Styled from './styles';

const ClassroomMainScreen = () => {
  // mock data
  const messages = [
    {
      author: 'Gaguinho',
      message: 'Bom dd-d-d-ia P-p-pessual',
    },
    {
      author: 'Patolino',
      message: 'O MAGO É IMPLACÁVEL',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Patolino',
      message: 'O MAGO É IMPLACÁVEL',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: '...',
    },
    {
      author: 'Pernalonga',
      message: 'Last message',
    },
  ];

  const videoUsers = [
    {
      userName: 'Gaguinho da Silva Sauro',
      videoSource: 'https://c.tenor.com/j1vcQTkMQroAAAAM/annoyed-porky-pig.gif',
    },
    {
      userName: 'Patolino',
      videoSource:
        'https://c.tenor.com/L976YIbKDa4AAAAM/daffy-duck-waitingforananswer.gif',
    },
    {
      userName: 'Pernalonga',
      videoSource:
        'https://2.bp.blogspot.com/-1DhhXLUW1nM/WcgNH0jd1WI/AAAAAAAAcaI/NIAmRXsT4NA9dBkHKchEfbKEnUuwzsWOACLcBGAs/s1600/pernalonga%2Bfumando%2Brwf.gif',
    },
    {
      userName: 'Taz',
      videoSource:
        'https://i.pinimg.com/originals/17/48/c1/1748c119990d3b965b138220582b6830.gif',
    },
    {
      userName: 'Lola',
      videoSource: 'https://c.tenor.com/iNVJLgItcD8AAAAM/lola-bunny-love.gif',
    },
    {
      userName: 'Frajola',
      videoSource: 'https://c.tenor.com/T2svBtpx5-YAAAAC/frajola-coffee.gif',
    },
  ];

  // variables
  const slidesStore = useSelector((state) => state.slidesCollection);
  const presentationsStore = useSelector(
    (state) => state.presentationsCollection
  );
  const orientation = useOrientation();
  const [switchLandscapeLayout, setSwitchLandscapeLayout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const actionsBarCtx = useContext(ActionsBarContext);
  const bottomSheetCtx = useContext(BottomSheetContext);
  const { actionsBarStatus } = actionsBarCtx;
  const { bottomSheet } = bottomSheetCtx;

  const handleSlideAndPresentationActive = () => {
    // TODO Review this collection after update the 2.6 code
    const currentSlideList = Object.values(slidesStore.slidesCollection).filter(
      (obj) => {
        return obj.current === true;
      }
    );
    // eslint-disable-next-line no-unused-vars
    const currentPresentation = Object.values(
      presentationsStore.presentationsCollection
    ).filter((obj) => {
      return obj.current === true;
    });
    return currentSlideList[0]?.imageUri;
  };

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
            <Styled.VideoList videoUsers={videoUsers} />
          </Styled.VideoListContainer>

          <Styled.PresentationContainer>
            <SvgUri
              width="100%"
              height="100%"
              uri={handleSlideAndPresentationActive()}
            />
          </Styled.PresentationContainer>

          <Styled.ChatContainer>
            {actionsBarStatus.isChatActive && (
              <Styled.Chat
                messages={messages.slice(messages.length - 3, messages.length)}
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
        {bottomSheet.chatBottomSheet && <BottomSheetChat messages={messages} />}
      </SafeAreaView>
    );
  };

  const renderLandscapeOrientation = () => {
    return (
      <SafeAreaView>
        <Styled.ContainerView orientation={orientation}>
          <Styled.PresentationContainer orientation={orientation}>
            {actionsBarStatus.isChatActive && (
              <Styled.Chat
                messages={messages}
                onPressItem={() =>
                  bottomSheetCtx.triggerButton('chatBottomSheet', true)
                }
              />
            )}
            {!actionsBarStatus.isChatActive && (
              <>
                {switchLandscapeLayout && (
                  <SvgUri
                    width="100%"
                    height="100%"
                    uri={handleSlideAndPresentationActive()}
                  />
                )}
                {!switchLandscapeLayout && (
                  <Styled.VideoListContainer orientation={orientation}>
                    <Styled.VideoList
                      videoUsers={videoUsers}
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
          </Styled.PresentationContainer>
          <Styled.ActionsBarContainer orientation={orientation}>
            <Styled.ActionsBar orientation={orientation} />
          </Styled.ActionsBarContainer>
        </Styled.ContainerView>
        {bottomSheet.chatBottomSheet && <BottomSheetChat messages={messages} />}
      </SafeAreaView>
    );
  };

  // return
  if (isLoading) return Styled.renderSkeletonLoading();
  if (orientation === 'PORTRAIT') return renderPortraitOrientation();
  return renderLandscapeOrientation();
};

export default ClassroomMainScreen;
