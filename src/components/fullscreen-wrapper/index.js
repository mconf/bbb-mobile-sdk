import { useDispatch, useSelector } from 'react-redux';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const FullscreenWrapper = () => {
  const layoutStore = useSelector((state) => state.layout);
  const dispatch = useDispatch();

  const onCloseFullscreen = () => {
    dispatch(setIsFocused(false));
    dispatch(setFocusedId(''));
    dispatch(setFocusedElement(''));
  };

  if (!layoutStore.isFocused) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.Wrapper>
        {layoutStore.focusedElement === 'videoStream' && <Styled.VideoStream streamURL={layoutStore.focusedId} />}
        {layoutStore.focusedElement === 'avatar' && <Styled.UserAvatar source={{ uri: layoutStore.focusedId }} />}
        {layoutStore.focusedElement === 'color' && <Styled.UserColor userColor={layoutStore.focusedId} />}
        {layoutStore.focusedElement === 'presentation' && <Styled.Presentation source={{ uri: layoutStore.focusedId }} />}
      </Styled.Wrapper>
      <Styled.ConfirmButton onPress={onCloseFullscreen}>
        Desfocar
      </Styled.ConfirmButton>
    </Styled.Container>
  );
};

export default FullscreenWrapper;
