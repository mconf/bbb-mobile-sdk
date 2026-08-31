import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '@apollo/client';
import { setIsReactionsBarOpen } from '../../../store/redux/slices/wide-app/layout';
import { useIsUserReactionsEnabled } from '../../../hooks/use-features';
import Queries from '../queries';
import Styled from './styles';

const ReactionsControls = () => {
  const isUserReactionsEnabled = useIsUserReactionsEnabled();
  const isReactionsBarOpen = useSelector((state) => state.layout.isReactionsBarOpen);
  const { data } = useSubscription(Queries.USER_CURRENT_REACTION_SUBSCRIPTION);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const currentUserReaction = data?.user_current[0]?.reactionEmoji ?? 'none';

  useEffect(() => {
    if (!isUserReactionsEnabled && isReactionsBarOpen) {
      dispatch(setIsReactionsBarOpen(false));
    }
  }, [isUserReactionsEnabled, isReactionsBarOpen]);

  if (!isUserReactionsEnabled) {
    return null;
  }

  return (
    <Styled.ReactionsButton
      currentUserReaction={currentUserReaction}
      isOpen={isReactionsBarOpen}
      accessibilityLabel={t('mobileSdk.reactions.label')}
      onPress={() => dispatch(setIsReactionsBarOpen(!isReactionsBarOpen))}
    />
  );
};

export default ReactionsControls;
