import { useSelector } from 'react-redux';
import Styled from './styles';

const DebugWindow = (props) => {
  const { onPress } = props;
  const debugIsShow = useSelector((state) => state.debug.isShow);

  const data = [
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',
    'voiceUsers/readyStateChanged',

  ];

  const renderItem = ({ item }) => {
    return (
      <Styled.UserMessage numberOfLines={1}>{item}</Styled.UserMessage>
    );
  };

  if (!debugIsShow) {
    return null;
  }

  return (
    <Styled.ContainerView>
      <Styled.ContainerInside onPress={onPress}>
        <Styled.TextContainer>
          <Styled.FlatList data={data} renderItem={renderItem} />
        </Styled.TextContainer>
      </Styled.ContainerInside>
    </Styled.ContainerView>

  );
};

export default DebugWindow;
