import { createContext, useContext } from 'react';

// True when this whole SDK instance IS a breakout room — i.e. it was mounted by
// another instance of this same app (inside-breakout-room-screen) with the
// `isBreakout` prop. Unlike the server-side `meeting.isBreakout` flag, this is
// available before Apollo is up and after the session is torn down, so it can
// gate the join flow and the end-session screen.
const BreakoutInstanceContext = createContext(false);

export const BreakoutInstanceProvider = BreakoutInstanceContext.Provider;

export const useIsBreakoutInstance = () => useContext(BreakoutInstanceContext);
