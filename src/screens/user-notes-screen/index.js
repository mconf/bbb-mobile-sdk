import { View, Keyboard, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { setDetailedInfo } from '../../store/redux/slices/wide-app/layout';
import makeCall from '../../services/api/makeCall';
import { selectPadSession } from '../../store/redux/slices/pads-sessions';
import ScreenWrapper from '../../components/screen-wrapper';

const UserNotesScreen = () => {
  const sessionToken = useSelector((state) => state.client.meetingData.sessionToken);
  const padSession = useSelector(selectPadSession);
  const host = useSelector((state) => state.client.meetingData.host);

  const [padId, setPadId] = useState('');
  const [keyboardIsVisible, setKeyboardIsVisible] = useState(false);

  const dispatch = useDispatch();

  const url = `https://${host}/pad/auth_session?padName=${padId}&sessionID=${padSession}&lang=pt-br&rtl=false&sessionToken=${sessionToken}`;
  const isAndroid = Platform.OS === 'android';

  useFocusEffect(useCallback(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardIsVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardIsVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []));

  const getPadId = () => {
    makeCall('getPadId', 'notes').then((response) => {
      if (response) {
        setPadId(response[0]);
      }
    });
  };

  const createSession = () => {
    makeCall('createSession', 'notes');
  };

  useEffect(() => {
    if (keyboardIsVisible && !isAndroid) {
      dispatch(setDetailedInfo(false));
      return;
    }
    // ? The dispatch is updated faster than the calculation of View outside keyboard
    setTimeout(() => {
      if (!isAndroid) {
        dispatch(setDetailedInfo(true));
      }
    }, 1);
  }, [keyboardIsVisible]);

  useFocusEffect(useCallback(() => {
    if (isAndroid) {
      dispatch(setDetailedInfo(true));
    }
  }, []));

  useEffect(() => {
    createSession();
    getPadId();
  }, []);

  const INJECTED_JAVASCRIPT = `(function() {
    var elem = document.querySelector('li[data-key="import_export"]')
    elem.style.display = 'none';
    return false;
  })();`;

  return (
    <ScreenWrapper renderWithView alwaysOpen>
      <View style={isAndroid ? { flex: 1, paddingBottom: 100 } : { flex: 1 }}>
        <WebView
          source={{ uri: url }}
          javaScriptEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          injectedJavaScript={INJECTED_JAVASCRIPT}
        />
      </View>
    </ScreenWrapper>
  );
};

export default UserNotesScreen;
