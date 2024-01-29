import { Pressable, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { trigDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import BottomSheetChat from '../chat/bottom-sheet-chat';
import NotificationBar from '../bar-notification';
import BottomSheetActionsBar from '../actions-bar/bottom-sheet-actions-bar';
import ModalControllerComponent from '../modal';
import ChatPopupList from '../chat/chat-popup';
import DebugWindow from '../debug-window';

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
      <ModalControllerComponent />
      <NotificationBar />
      <DebugWindow />
      {/* This components keep mounted because react navigation does NOT unmount previous screens
      So, we will disable them from rendering when is not focused */}
      {isFocused && (
        <>
          <BottomSheetActionsBar alwaysOpen={alwaysOpen} />
          <BottomSheetChat />
          <ChatPopupList />
        </>
      )}
    </>
  );
};

export default ScreenWrapper;
