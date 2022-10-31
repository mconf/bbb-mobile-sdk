import { useDispatch, useSelector } from 'react-redux';
import { setFocusedId, setIsFocused } from '../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const FullscreenWrapper = () => {
  const layoutStore = useSelector((state) => state.layout);
  const dispatch = useDispatch();

  if (!layoutStore.isFocused) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Styled.VideoStream streamURL={layoutStore.focusedId} />
      </Styled.Wrapper>
      <Styled.ConfirmButton
        onPress={() => {
          dispatch(setIsFocused(false));
          dispatch(setFocusedId(''));
        }}
      >
        Minimizar
      </Styled.ConfirmButton>
    </Styled.Container>
  );
};

export default FullscreenWrapper;
