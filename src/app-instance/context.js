import { createContext, useContext } from 'react';

// React access to the per-App instance object built by createAppInstance().
// Provided once at the top of App.js; every component of that App (and of no
// other App) sees the same object.
const AppInstanceContext = createContext(null);

export const AppInstanceProvider = AppInstanceContext.Provider;

// The root `App` component itself, provided by App.js so that
// inside-breakout-room-screen can render a nested App without importing
// App.js (which would be an import cycle: App.js -> navigators -> drawer ->
// inside-breakout-room-screen -> App.js).
export const NestedAppContext = createContext(null);

/** @returns {import('./types').AppInstance} */
export const useAppInstance = () => {
  const instance = useContext(AppInstanceContext);

  if (!instance) {
    throw new Error('useAppInstance must be used inside an <App>');
  }

  return instance;
};

// True when this whole SDK instance IS a breakout room, i.e. it was mounted by
// another instance of this same app with the `isBreakout` prop. Unlike the
// server-side `meeting.isBreakout` flag this is available before Apollo is up
// and after the session is torn down, so it can gate the join flow, the
// end-session screen and subscriptions that must be skipped from the first
// render. Safe to call outside an App (returns false).
export const useIsBreakoutInstance = () => useContext(AppInstanceContext)?.isBreakout ?? false;

export const useLiveKitRoom = () => useAppInstance().liveKitRoom;

export const useMediaManagers = () => {
  const { audioManager, videoManager, screenshareManager } = useAppInstance();

  return { audioManager, videoManager, screenshareManager };
};
