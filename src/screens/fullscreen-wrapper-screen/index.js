import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { OrientationLocker, LANDSCAPE } from 'react-native-orientation-locker';
import { useFocusEffect } from '@react-navigation/native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { BackHandler } from 'react-native';
import {
  setFocusedElement, setFocusedId, setIsFocused, trigDetailedInfo
} from '../../store/redux/slices/wide-app/layout';
import ScreenWrapper from '../../components/screen-wrapper';
import UserAvatar from '../../components/user-avatar';
import Styled from './styles';

const FullscreenWrapperScreen = ({ navigation }) => {
  const layoutStore = useSelector((state) => state.layout);
  const dispatch = useDispatch();

  const onCloseFullscreen = () => {
    dispatch(setIsFocused(false));
    dispatch(setFocusedId(''));
    dispatch(setFocusedElement(''));
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        onCloseFullscreen();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [layoutStore.isFocused]),
  );

  if (!layoutStore.isFocused) {
    return null;
  }

  return (
    <ScreenWrapper>
      <Styled.Container>
        <Styled.Wrapper>
          <ReactNativeZoomableView
            maxZoom={5.0}
            minZoom={1}
            zoomStep={0.5}
            bindToBorders
            onLongPress={() => dispatch(trigDetailedInfo())}
          >
            {layoutStore.focusedElement === 'videoStream' && (
              <Styled.VideoStream streamURL={layoutStore.focusedId} />
            )}
            {layoutStore.focusedElement === 'avatar' && <Styled.UserAvatar source={{ uri: layoutStore.focusedId }} />}
            {layoutStore.focusedElement === 'contentArea'
            && (
            <>
              <OrientationLocker orientation={LANDSCAPE} />
              <Styled.ContentArea fullscreen />
            </>
            )}
            {layoutStore.focusedElement === 'color'
            && (
              <Styled.UserColor userColor={layoutStore.focusedId.userColor} isGrid>
                <UserAvatar
                  isGrid
                  userName={layoutStore.focusedId.userName}
                  userColor={`${layoutStore.focusedId.userColor}`}
                  userRole={layoutStore.focusedId.userRole}
                  isTalking={layoutStore.focusedId.isTalking}
                />
              </Styled.UserColor>
            )}
          </ReactNativeZoomableView>

        </Styled.Wrapper>
        <Styled.PressableButton
          activeOpacity={0.6}
          onPress={onCloseFullscreen}
        >
          <Styled.FullscreenIcon
            icon="fullscreen"
            iconColor="white"
            size={16}
            containerColor="#00000000"
          />
        </Styled.PressableButton>
      </Styled.Container>
    </ScreenWrapper>
  );
};

export default FullscreenWrapperScreen;
