import { useSelector } from 'react-redux';
import { useState } from 'react';
import ReduxDebug from '../../services/logger/redux-debug';
import Styled from './styles';

const DebugWindow = (props) => {
  const { onPress } = props;
  const debugIsShow = useSelector((state) => state.debug.isShow);
  const reduxLog = ReduxDebug.getReduxLog();

  const renderItem = ({ item }) => {
    return (
      <>
        <Styled.TypeMessage numberOfLines={1}>{item.type}</Styled.TypeMessage>
        <Styled.PayloadMessage>
          {JSON.stringify(item.payload)}
        </Styled.PayloadMessage>
      </>
    );
  };

  if (!debugIsShow) {
    return null;
  }

  return (
    <Styled.ContainerView>
      <Styled.ContainerInside onPress={onPress}>
        <Styled.TextContainer>
          <Styled.FlatList data={reduxLog} renderItem={renderItem} />
        </Styled.TextContainer>
      </Styled.ContainerInside>
    </Styled.ContainerView>

  );
};

export default DebugWindow;
