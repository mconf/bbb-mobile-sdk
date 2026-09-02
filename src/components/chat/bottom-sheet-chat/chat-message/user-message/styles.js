import styled from 'styled-components/native';
import userAvatar from '../../../../user-avatar';
import Colors from '../../../../../constants/colors';
import { Text } from '../../../../typography';

const Card = styled.View`
  padding: 8px;
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
`;

const MessageAuthor = styled(Text)`
  color: ${Colors.lightGray400};
  font-weight: 500;
`;

const MessageTimestamp = styled(Text)`
  color: ${Colors.lightGray200};
  padding-left: 8px;
  font-style: italic;
`;

const MessageContent = styled(Text)`
  color: ${Colors.lightGray300};
`;

MessageContent.defaultProps = {
  selectable: true,
};

const UserAvatar = styled(userAvatar)`
  padding-top: 30px;
`;

export default {
  Card,
  ContainerItem,
  MessageTopContainer,
  MessageAuthor,
  MessageTimestamp,
  MessageContent,
  UserAvatar,
};
