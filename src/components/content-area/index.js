import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Styled from './styles';
import { selectScreenshare } from '../../store/redux/slices/screenshare';
import { setFocusedElement, setFocusedId, setIsFocused } from '../../store/redux/slices/wide-app/layout';

const ContentArea = (props) => {
  const { style } = props;
  const slidesStore = useSelector((state) => state.slidesCollection);
  const presentationsStore = useSelector((state) => state.presentationsCollection);
  const screenshare = useSelector(selectScreenshare);
  const dispatch = useDispatch();

  const handleSlideAndPresentationActive = useCallback(() => {
    // TODO Review this collection after update the 2.6 code
    const currentPresentation = Object.values(
      presentationsStore.presentationsCollection
    ).filter((obj) => {
      return obj.current === true;
    });

    const currentSlideList = Object.values(slidesStore.slidesCollection).filter(
      (obj) => {
        return (
          obj.current === true &&
          obj.presentationId === currentPresentation[0]?.id
        );
      }
    );
    const imageUri = currentSlideList[0]?.imageUri;
    return imageUri?.replace('/svg/', '/png/');
  }, [presentationsStore, slidesStore]);

  const onClickPresentation = () => {
    dispatch(setIsFocused(true));
    dispatch(setFocusedId(handleSlideAndPresentationActive()));
    dispatch(setFocusedElement('presentation'));
  };

  const onClickScreenshare = () => {
    dispatch(setIsFocused(true));
    // Focused ID is not needed here because the Screenshare component is self contained
    dispatch(setFocusedId(''));
    dispatch(setFocusedElement('screenshare'));
  };

  if (!screenshare) {
    return (
      <Styled.ContentAreaPressable onPress={onClickPresentation}>
        <Styled.Presentation
          width="100%"
          height="100%"
          source={{
            uri: handleSlideAndPresentationActive(),
          }}
        />
      </Styled.ContentAreaPressable>
    );
  }

  return (
    <Styled.ContentAreaPressable onPress={onClickScreenshare}>
      <Styled.Screenshare style={style} />
    </Styled.ContentAreaPressable>
  );
};

export default ContentArea;
