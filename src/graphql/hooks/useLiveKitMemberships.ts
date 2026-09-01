import { useMemo } from 'react';
import useCurrentUser from './useCurrentUser';

export interface LiveKitRoomMembership {
  // LK room.name: the internal meeting ID that owns the room.
  roomName: string;
  // 'primary', 'breakout-listen', ...
  purpose: string;
  token: string | null;
}

const PRIMARY_PURPOSE = 'primary';

const EMPTY: LiveKitRoomMembership[] = [];

// Rows are written on join and only get a token once the SFU answers with it
// so tokenless rows are filtered out rather than handed to a connect.
const useLiveKitMemberships = (): LiveKitRoomMembership[] => {
  const { data: currentUserData } = useCurrentUser();
  const rooms = currentUserData?.user_current?.[0]?.livekitRooms;

  return useMemo(() => {
    if (!rooms) return EMPTY;

    const active = rooms.filter(
      (room: LiveKitRoomMembership) => typeof room.token === 'string' && room.token.length > 0,
    );

    return active.length > 0 ? active : EMPTY;
  }, [rooms]);
};

// Unordered array relationship - pick by purpose, never by index.
export const usePrimaryLiveKitMembership = (): LiveKitRoomMembership | undefined => {
  const memberships = useLiveKitMemberships();

  return useMemo(
    () => memberships.find((membership) => membership.purpose === PRIMARY_PURPOSE),
    [memberships],
  );
};

export default usePrimaryLiveKitMembership;
