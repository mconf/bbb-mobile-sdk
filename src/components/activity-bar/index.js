import React from 'react';
import Styled from './styles';

const ActivityBar = (props) => {
  const { width, style } = props;

  return (
    <Styled.OutsideBar style={style}>
      <Styled.InsideBar width={width} />
    </Styled.OutsideBar>
  );
};

export default ActivityBar;
