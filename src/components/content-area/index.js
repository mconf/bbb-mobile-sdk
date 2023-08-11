import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { selectScreenshare } from '../../store/redux/slices/screenshare';
import {
  setFocusedElement,
  setFocusedId,
  setIsFocused,
} from '../../store/redux/slices/wide-app/layout';
import Styled from './styles';

const ContentArea = (props) => {
  const { style, fullscreen } = props;

  const slidesStore = useSelector((state) => state.slidesCollection);
  const presentationsStore = useSelector((state) => state.presentationsCollection);
  const screenshare = useSelector(selectScreenshare);
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const dispatch = useDispatch();
  const navigation = useNavigation();

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
          obj.current === true
          && obj.presentationId === currentPresentation[0]?.id
        );
      }
    );
    const imageUri = currentSlideList[0]?.imageUri;
    return imageUri?.replace('/svg/', '/png/');
  }, [presentationsStore, slidesStore]);

  const handleFullscreenClick = () => {
    dispatch(setIsFocused(true));
    dispatch(setFocusedId(handleSlideAndPresentationActive()));
    dispatch(setFocusedElement('contentArea'));
    navigation.navigate('FullscreenWrapper');
  };

  // ** Content area views methods **
  const presentationView = () => (
    <Styled.Presentation
      width="100%"
      height="100%"
      source={{
        uri: handleSlideAndPresentationActive(),
      }}
    />
  );

  const screenshareView = () => (
    <Styled.Screenshare style={style} />
  );

  // ** return methods **
  if (fullscreen) {
    return (
      <>
        {!screenshare && presentationView()}
        {screenshare && screenshareView()}
      </>
    );
  }

  return (
    <Styled.ContentAreaPressable>
      {!screenshare && presentationView()}
      {screenshare && screenshareView()}
      {detailedInfo && (
        <>
          <Styled.NameLabelContainer>
            <Styled.NameLabel
              numberOfLines={1}
            >
              {screenshare ? 'Screenshare' : 'Presentation'}
            </Styled.NameLabel>
          </Styled.NameLabelContainer>

          <Styled.PressableButton
            activeOpacity={0.6}
            onPress={handleFullscreenClick}
          >
            <Styled.FullscreenIcon
              icon="fullscreen"
              iconColor="white"
              size={16}
              containerColor="#00000000"
            />
          </Styled.PressableButton>
        </>
      )}
    </Styled.ContentAreaPressable>

  );
};

export default ContentArea;
