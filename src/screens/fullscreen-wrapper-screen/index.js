import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import {
  setFocusedElement, setFocusedId, setIsFocused, trigDetailedInfo
} from '../../store/redux/slices/wide-app/layout';
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
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        onCloseFullscreen();
        return true;
      });

      return () => backHandler.remove();
    }, [layoutStore.isFocused]),
  );

  if (!layoutStore.isFocused) {
    return null;
  }

  return (
    <Styled.RenderWithZoomable
      layoutStore={layoutStore}
      trigDetailedInfo={() => dispatch(trigDetailedInfo)}
      onCloseFullscreen={onCloseFullscreen}
      focusedId={layoutStore.focusedId}
    />
  );
};

export default FullscreenWrapperScreen;
