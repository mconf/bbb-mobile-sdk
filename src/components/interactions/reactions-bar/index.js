import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useMutation, useSubscription } from '@apollo/client';
import { setIsReactionsBarOpen } from '../../../store/redux/slices/wide-app/layout';
import { useIsUserReactionsEnabled } from '../../../hooks/use-features';
import useMeetingSettings from '../../../graphql/local-states/useMeetingSettings';
import logger from '../../../services/logger';
import Queries from '../queries';
import Styled from './styles';

const ReactionsBar = () => {
  const isUserReactionsEnabled = useIsUserReactionsEnabled();
  const isReactionsBarOpen = useSelector((state) => state.layout.isReactionsBarOpen);
  const detailedInfo = useSelector((state) => state.layout.detailedInfo);
  const expandActionsBar = useSelector((state) => state.layout.expandActionsBar);
  const [meetingSettings] = useMeetingSettings();
  const { data } = useSubscription(Queries.USER_CURRENT_REACTION_SUBSCRIPTION);
  const [setReactionEmoji] = useMutation(Queries.SET_REACTION_EMOJI);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const reactions = meetingSettings?.public?.userReaction?.reactions ?? [];
  const autoCloseReactionsBar = meetingSettings
    ?.public?.app?.defaultSettings?.application?.autoCloseReactionsBar ?? true;
  const currentUserReaction = data?.user_current[0]?.reactionEmoji ?? 'none';

  useEffect(() => {
    if (isReactionsBarOpen && (!detailedInfo || expandActionsBar)) {
      dispatch(setIsReactionsBarOpen(false));
    }
  }, [detailedInfo, expandActionsBar, isReactionsBarOpen]);

  const handleReactionSelect = (reactionEmoji) => {
    setReactionEmoji({ variables: { reactionEmoji } }).catch((error) => {
      logger.error({
        logCode: 'set_reaction_emoji_failure',
        extraInfo: {
          errorMessage: error.message,
          reactionEmoji,
        },
      }, `Unable to set reaction emoji: ${error.message}`);
    });

    if (autoCloseReactionsBar) {
      dispatch(setIsReactionsBarOpen(false));
    }
  };

  if (!isUserReactionsEnabled || !isReactionsBarOpen || reactions.length === 0) {
    return null;
  }

  return (
    <Styled.Container onStartShouldSetResponder={() => true}>
      {reactions.map(({ id, native }) => (
        <Styled.ReactionButton
          key={id}
          active={native === currentUserReaction}
          accessibilityLabel={native}
          onPress={() => handleReactionSelect(native)}
        >
          <Styled.Reaction>{native}</Styled.Reaction>
        </Styled.ReactionButton>
      ))}
      <Styled.Divider />
      <Styled.RemoveReactionButton
        disabled={currentUserReaction === 'none'}
        accessibilityLabel={t('mobileSdk.reactions.remove')}
        onPress={() => handleReactionSelect('none')}
      />
    </Styled.Container>
  );
};

export default ReactionsBar;
