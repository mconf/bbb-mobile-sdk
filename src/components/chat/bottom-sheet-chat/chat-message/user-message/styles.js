import styled, { css } from 'styled-components/native';
import userAvatar from '../../../../user-avatar';
import Pressable from '../../../../pressable';
import Colors from '../../../../../constants/colors';

// Press and hold opens the message actions, so the message text is not
// selectable: on Android a selectable Text swallows the long press.
const Card = styled(Pressable).attrs(() => ({
  pressStyle: {
    opacity: 0.7,
  },
}))`
  ${({ highlighted }) => css`
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    /* the transparent border is always there so nothing shifts when it shows */
    border-width: 1px;
    border-color: ${highlighted ? Colors.lightBlue : 'transparent'};
    background-color: ${highlighted ? Colors.pollInfoBackground : 'transparent'};
  `}
`;

const OrangeCard = styled.View`
  padding: 8px;
  background-color: ${Colors.orange}20;
  border-radius: 8px;
`;

const ContainerItem = styled.View`
  display: flex;
  flex-direction: row;
  width: 90%;
  padding: 12px;
`;

const MessageTopContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

// The only part of the header allowed to shrink, so a long name ellipsizes
// instead of pushing the timestamp out of the message.
const MessageAuthor = styled.Text`
  flex-shrink: 1;
  color: ${Colors.lightGray400};
  font-weight: 500;
`;

const MessageTimestamp = styled.Text`
  flex-shrink: 0;
  color: ${({ moderator }) => (moderator ? Colors.lightGray300 : Colors.lightGray200)};
  padding-left: 8px;
  font-style: italic;
`;

const MessageContent = styled.Text`
  color: ${Colors.lightGray300};
`;

const UserAvatar = styled(userAvatar)`
  padding-top: 30px;
`;

export default {
  Card,
  OrangeCard,
  ContainerItem,
  MessageTopContainer,
  MessageAuthor,
  MessageTimestamp,
  MessageContent,
  UserAvatar,
};
