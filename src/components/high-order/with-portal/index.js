import { Pressable } from 'react-native';
import BottomSheetChat from '../../chat/bottom-sheet-chat';
import NotificationBar from '../../notification-bar';
import BottomSheetActionsBar from '../../actions-bar/bottom-sheet-actions-bar';
import { trigDetailedInfo } from '../../../store/redux/slices/wide-app/layout';
import { store } from '../../../store/redux/store';

const withPortal = (Component) => {
  const handleDispatchDetailedInfo = () => {
    return store.dispatch(trigDetailedInfo());
  };

  return (props) => (
    <>
      <Pressable onPress={handleDispatchDetailedInfo} style={{ flex: 1 }}>
        <Component {...props} />
      </Pressable>
      <BottomSheetActionsBar />
      <NotificationBar />
      <BottomSheetChat />
    </>
  );
};

export default withPortal;
