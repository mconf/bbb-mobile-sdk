import React from 'react';
import Styled from './styles';

const Tag = ({ children, style }) => {
  return (
    <Styled.Container style={style}>
      <Styled.Text>{children}</Styled.Text>
    </Styled.Container>
  );
};
export default Tag;
