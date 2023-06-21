import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../store/redux/slices/wide-app/layout';
import UserAvatar from '../user-avatar';
import Colors from '../../constants/colors';
import Styled from './styles';

const FullscreenWrapper = ({ navigation }) => {
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
    <Styled.Container>
      <Styled.Wrapper>
        {layoutStore.focusedElement === 'videoStream' && <Styled.VideoStream streamURL={layoutStore.focusedId} />}
        {layoutStore.focusedElement === 'avatar' && <Styled.UserAvatar source={{ uri: layoutStore.focusedId }} />}
        {layoutStore.focusedElement === 'contentArea' && <Styled.ContentArea fullscreen />}
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
  );
};

export default FullscreenWrapper;
