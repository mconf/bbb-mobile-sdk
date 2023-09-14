import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const NotificationBar = (props) => {

  const { t } = useTranslation();
  const isMuted = useSelector((state) => state.audio.isMuted);
  const currentUserStore = useSelector((state) => state.currentUserCollection);
  const currentUserObj = Object.values(
    currentUserStore.currentUserCollection
  )[0];
  const isHandRaised = currentUserObj?.emoji === 'raiseHand';
  const { bottomSheetIndex } = props;

  return (
    <Styled.IndexContainer index={bottomSheetIndex}>
      {/* user raised hand notification */}
      {isHandRaised ? (
        <Styled.Container>
          <Styled.NotificationContainer>
            <Styled.TextContainer>
              <Styled.Text>
                {t('mobileSdk.notificationBar.handsUp')}
              </Styled.Text>
            </Styled.TextContainer>
          </Styled.NotificationContainer>
        </Styled.Container>
      ) : null}

      {/* user muted notification */}
      {isMuted ? (
        <Styled.Container>
          <Styled.NotificationContainer>
            <Styled.TextContainer>
              <Styled.Text>
                {t('mobileSdk.notificationBar.microphoneOff')}
              </Styled.Text>
            </Styled.TextContainer>
          </Styled.NotificationContainer>
        </Styled.Container>
      ) : null}
    </Styled.IndexContainer>
  );
};

export default NotificationBar;
