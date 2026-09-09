import { useTranslation } from 'react-i18next';
import { getFirstLine } from '../../../service';
import Styled from './styles';

const RepliedMessage = ({
  authorName,
  authorColor,
  message,
  deletedAt,
  deletedByName,
  onPress,
  onLongPress,
}) => {
  const { t } = useTranslation();
  const isDeleted = !!deletedAt;

  return (
    // A nested pressable takes the touch, so the hold has to be forwarded.
    <Styled.Container
      accentColor={authorColor}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {!!authorName && (
        <Styled.Author numberOfLines={1}>{authorName}</Styled.Author>
      )}
      {isDeleted ? (
        <Styled.DeletedMessage numberOfLines={1}>
          {deletedByName
            ? t('mobileSdk.chat.deletedMessage', { userName: deletedByName })
            : t('mobileSdk.chat.deletedMessageNoAuthor')}
        </Styled.DeletedMessage>
      ) : (
        <Styled.Excerpt numberOfLines={1}>{getFirstLine(message)}</Styled.Excerpt>
      )}
    </Styled.Container>
  );
};

export default RepliedMessage;
