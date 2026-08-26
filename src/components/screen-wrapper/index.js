import { Pressable, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { trigDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import DraggableCamera from '../draggable-camera';
import BottomSheetChat from '../chat/bottom-sheet-chat';
import NotificationBar from '../bar-notification';
import BottomSheetActionsBar from '../actions-bar/bottom-sheet-actions-bar';
import ModalControllerComponent from '../modal';
import DebugWindow from '../debug-window';
import EmojiRain from '../emoji-rain';
import ReactionsBar from '../interactions/reactions-bar';

const ScreenWrapper = ({ children, renderWithView, alwaysOpen }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const handleRenderChildren = () => {
    if (!renderWithView) {
      return (
        <Pressable onPress={() => dispatch(trigDetailedInfo())} style={{ flex: 1 }}>
          {children}
        </Pressable>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        {children}
      </View>
    );
  };

  return (
    <>
      {handleRenderChildren()}
      <KeyboardAvoidingView
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
        behavior="translate-with-padding"
      >
        <ModalControllerComponent />
      </KeyboardAvoidingView>
      <NotificationBar />
      <DebugWindow />
      <DraggableCamera />
      {/* This components keep mounted because react navigation does NOT unmount previous screens
      So, we will disable them from rendering when is not focused */}
      {isFocused && (
        <>
          <EmojiRain />
          <BottomSheetActionsBar alwaysOpen={alwaysOpen} />
          <ReactionsBar />
          <BottomSheetChat />
        </>
      )}
    </>
  );
};

export default ScreenWrapper;
