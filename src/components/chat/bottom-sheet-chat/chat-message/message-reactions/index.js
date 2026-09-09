import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Styled from './styles';

const sortByCount = (r1, r2) => r2.count - r1.count;
const sortByLeastRecent = (r1, r2) => r1.leastRecent - r2.leastRecent;

// One item per emoji: how many users reacted with it, who they are and whether
// the current user is one of them.
const groupReactions = (reactions, currentUserId) => Object.values(
  reactions.reduce((groups, { createdAt, reactionEmoji, user }) => {
    const reactedByMe = !!currentUserId && user?.userId === currentUserId;
    const group = groups[reactionEmoji];

    if (!group) {
      groups[reactionEmoji] = {
        reactionEmoji,
        count: 1,
        userNames: reactedByMe ? [] : [user?.name],
        reactedByMe,
        leastRecent: new Date(createdAt).getTime(),
      };
      return groups;
    }

    group.count += 1;
    if (reactedByMe) {
      group.reactedByMe = true;
    } else {
      group.userNames.push(user?.name);
    }
    return groups;
  }, {})
).sort(sortByLeastRecent).sort(sortByCount);

const MessageReactions = ({
  reactions,
  currentUserId,
  reactionsEnabled,
  onToggleReaction,
}) => {
  const { t } = useTranslation();
  const groupedReactions = useMemo(
    () => groupReactions(reactions || [], currentUserId),
    [reactions, currentUserId]
  );

  if (groupedReactions.length === 0) {
    return null;
  }

  const buildLabel = ({ userNames, reactedByMe, reactionEmoji }) => {
    let usersLabel = userNames.filter(Boolean).join(', ');

    if (reactedByMe) {
      usersLabel = usersLabel
        ? `${usersLabel} ${t('mobileSdk.chat.reactions.and')} ${t('mobileSdk.chat.reactions.you')}`
        : t('mobileSdk.chat.reactions.you');
    }

    return t('mobileSdk.chat.reactions.reactionLabel', {
      userNames: usersLabel,
      reaction: reactionEmoji,
    });
  };

  return (
    <Styled.Container>
      {groupedReactions.map((reaction) => (
        <Styled.ReactionButton
          key={reaction.reactionEmoji}
          active={reaction.reactedByMe}
          disabled={!reactionsEnabled}
          accessibilityLabel={buildLabel(reaction)}
          onPress={() => onToggleReaction(reaction.reactionEmoji, reaction.reactedByMe)}
        >
          <Styled.Reaction>{reaction.reactionEmoji}</Styled.Reaction>
          <Styled.ReactionCount active={reaction.reactedByMe}>
            {reaction.count}
          </Styled.ReactionCount>
        </Styled.ReactionButton>
      ))}
    </Styled.Container>
  );
};

export default MessageReactions;
