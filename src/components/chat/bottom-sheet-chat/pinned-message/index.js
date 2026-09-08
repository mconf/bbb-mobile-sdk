import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDeduplicatedSubscription from '../../../../graphql/hooks/useDeduplicatedSubscription';
import CHAT_PINNED_MESSAGE_SUBSCRIPTION from '../../../../graphql/queries/chatPinnedMessageSubscription';
import { formatTime, getFirstLine } from '../service';
import Styled from './styles';

const EXPANDED_LINE_LIMIT = 8;

const PinnedMessage = ({
  pinnedMessageId,
  pinnedByName,
  canUnpin,
  onUnpin,
  onPress,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { data } = useDeduplicatedSubscription(CHAT_PINNED_MESSAGE_SUBSCRIPTION, {
    variables: { messageId: pinnedMessageId },
    skip: !pinnedMessageId,
  });
  const message = data?.chat_message_public?.[0];

  useEffect(() => setExpanded(false), [pinnedMessageId]);

  // Deleting the message clears the pin, but the two subscriptions land apart:
  // without this the banner shows an empty line until the second one arrives.
  if (!message || message.deletedAt) {
    return null;
  }

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.PinIcon />
        <Styled.PinnedBy numberOfLines={1}>
          {`${t('app.chat.pinnedMessages.pinnedBy')} `}
          <Styled.PinnedByName>{pinnedByName}</Styled.PinnedByName>
        </Styled.PinnedBy>
        <Styled.HeaderButton
          accessibilityLabel={t(expanded
            ? 'app.chat.pinnedMessages.tooltipCollapse'
            : 'app.chat.pinnedMessages.tooltipExpand')}
          onPress={() => setExpanded((wasExpanded) => !wasExpanded)}
        >
          <Styled.HeaderIcon name={expanded ? 'chevron-up' : 'chevron-down'} />
        </Styled.HeaderButton>
        {canUnpin && (
          <Styled.HeaderButton
            accessibilityLabel={t('app.chat.header.tooltipUnpin')}
            onPress={onUnpin}
          >
            <Styled.HeaderIcon name="pin-off-outline" />
          </Styled.HeaderButton>
        )}
      </Styled.Header>
      <Styled.Preview
        accessibilityLabel={t('app.chat.pinnedMessages.goToMessage')}
        onPress={() => onPress(message.messageSequence)}
      >
        <Styled.PreviewText numberOfLines={expanded ? EXPANDED_LINE_LIMIT : 1}>
          {expanded ? message.message : getFirstLine(message.message)}
        </Styled.PreviewText>
      </Styled.Preview>
      {expanded && (
        <Styled.Footer numberOfLines={1}>
          <Styled.FooterSender>{message.senderName}</Styled.FooterSender>
          {` · ${t('app.chat.pinnedMessages.sentAt')} ${formatTime(message.createdAt)}`}
        </Styled.Footer>
      )}
    </Styled.Container>
  );
};

export default PinnedMessage;
