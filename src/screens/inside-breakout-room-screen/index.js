import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import BbbBreakoutSdk from './sdk-loader';
import { setMainRoomBlockedByBreakout } from '../../store/redux/slices/wide-app/client';

const InsideBreakoutRoomScreen = (props) => {
  const dispatch = useDispatch();
  const { route } = props;
  const { i18n } = useTranslation();
  const navigation = useNavigation();

  // Breakout builds ship a null loader — see sdk-loader.js
  if (!BbbBreakoutSdk) return null;

  return (
    <BbbBreakoutSdk
      joinURL={route.params.joinURL}
      isBreakout
      onLeaveSession={() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        dispatch(setMainRoomBlockedByBreakout(false));
      }}
      defaultLanguage={i18n.language}
    />
  );
};

export default InsideBreakoutRoomScreen;
