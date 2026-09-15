import { getActiveInstance } from '../../app-instance/active-instance';

// Compatibility shim for the LEGACY plane only (src/components/socket-connection/**
// DDP collection mirrors and poll-screen/service.js), which read/write the
// store from plain module code. It delegates to the store of the currently
// active App instance (the innermost mounted App - the breakout while one is
// open, the main room otherwise). Nothing in the new (GraphQL/LiveKit) plane may
// import this: React code uses the nearest <Provider>, services receive the
// AppInstance by constructor.
//
// No `subscribe`: nothing in the repo subscribes to the store imperatively.
export const store = {
  getState: () => getActiveInstance().store.getState(),
  dispatch: (action) => getActiveInstance().store.dispatch(action),
};

export default store;
