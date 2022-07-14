import React from 'react';
import Styled from './styles';

const Presentation = (props) => {
  const { source, style } = props;

  return <Styled.PresentationImage source={source} style={style} />;
};

export default Presentation;
