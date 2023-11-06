import React from 'react';
import Styled from './styles';

const ActivityBar = (props) => {
  const { width } = props;

  return (
    <Styled.OutsideBar>
      <Styled.InsideBar width={width} />
    </Styled.OutsideBar>
  );
};

export default ActivityBar;
