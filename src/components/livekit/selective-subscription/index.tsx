import React, { useEffect } from 'react';
import { useConnectionState } from '@livekit/react-native';
import { ConnectionState } from 'livekit-client';
import { useLiveKitRoom } from '../../../app-instance/context';
import { useMediaSubscriptions } from './hooks';

const SelectiveSubscription: React.FC = () => {
  const liveKitRoom = useLiveKitRoom();
  const connectionState = useConnectionState(liveKitRoom);
  const { handleSubscriptionChanges } = useMediaSubscriptions();

  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;

    handleSubscriptionChanges();
  }, [connectionState, handleSubscriptionChanges]);

  return null;
};

export default React.memo(SelectiveSubscription);
