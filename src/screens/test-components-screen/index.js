import React from 'react';

import SocketConnection from '../../components/socket-connection';

const TestComponentsScreen = (props) => {
  const { jUrl } = props;
  return (
    <SocketConnection jUrl={jUrl}/>
  );
};

export default TestComponentsScreen;
