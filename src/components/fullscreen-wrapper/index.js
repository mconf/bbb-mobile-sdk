import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../store/redux/slices/wide-app/layout';
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

  return (
    <Styled.Container>
      <Styled.Wrapper>
        {layoutStore.focusedElement === 'videoStream' && <Styled.VideoStream streamURL={layoutStore.focusedId} />}
        {layoutStore.focusedElement === 'avatar' && <Styled.UserAvatar source={{ uri: layoutStore.focusedId }} />}
        {layoutStore.focusedElement === 'color' && <Styled.UserColor userColor={layoutStore.focusedId} />}
        {layoutStore.focusedElement === 'presentation' && <Styled.Presentation source={{ uri: layoutStore.focusedId }} />}
        {layoutStore.focusedElement === 'screenshare' && <Styled.FullscreenScreenshare />}
      </Styled.Wrapper>
      <Styled.CloseFullscreenButton
        icon="fullscreen-exit"
        iconColor={Colors.lightGray300}
        containerColor={Colors.lightGray100}
        animated
        onPress={onCloseFullscreen}
      />
    </Styled.Container>
  );
};

export default FullscreenWrapper;
