import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const ComposerBar = ({
  icon, label, preview, onCancel, onPress,
}) => {
  const { t } = useTranslation();

  // Back cancels the draft context instead of closing the chat.
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });

    return () => backHandler.remove();
  }, [onCancel]);

  return (
    <Styled.Container disabled={!onPress} onPress={onPress}>
      <Styled.Icon name={icon} />
      <Styled.Info>
        <Styled.Label numberOfLines={1}>{label}</Styled.Label>
        {!!preview && <Styled.Preview numberOfLines={1}>{preview}</Styled.Preview>}
      </Styled.Info>
      <Styled.CancelButton
        accessibilityLabel={t('app.settings.main.cancel.label')}
        onPress={onCancel}
      >
        <Styled.CancelIcon />
      </Styled.CancelButton>
    </Styled.Container>
  );
};

export default ComposerBar;
