import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

// Panel covering the chat sheet, which cannot host a nested bottom sheet.
const InSheetOverlay = ({ height, onClose, children }) => {
  const { t } = useTranslation();
  // The chat spans the whole screen, so keep the card clear of the system bar.
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [onClose]);

  return (
    <Styled.Overlay>
      <Styled.KeyboardAvoidingView behavior="padding">
        <Styled.Backdrop
          accessibilityLabel={t('app.modal.close')}
          onPress={onClose}
        />
        <Styled.Card height={height} bottomInset={insets.bottom}>
          {children}
        </Styled.Card>
      </Styled.KeyboardAvoidingView>
    </Styled.Overlay>
  );
};

export default InSheetOverlay;
