import { describe, expect, it } from 'vitest';
import { createDeferredLog } from '../../../src/plugins/deferred-log';
import { isLoggerReady } from '../../../src/plugins/log-ready';

// A store whose state the test sets, with the subscribe contract of Redux.
const fakeStore = () => {
  let state = { ready: false };
  const listeners = new Set<() => void>();
  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setReady: () => { state = { ready: true }; listeners.forEach((l) => l()); },
    listenerCount: () => listeners.size,
  };
};

const setup = () => {
  const store = fakeStore();
  const sent: string[] = [];
  const log = createDeferredLog(store, (s) => (s as { ready: boolean }).ready, ({ record }) => { sent.push(record.logCode); });
  return { store, sent, log };
};

describe('plugin host: deferred log', () => {
  it('holds records until the store is ready, then sends them in order', () => {
    const { store, sent, log } = setup();
    log.write('warn', { logCode: 'first' }, 'm');
    log.write('error', { logCode: 'second' }, 'm');

    expect(sent).toEqual([]);
    store.setReady();
    expect(sent).toEqual(['first', 'second']);
  });

  it('sends records straight through once the store is ready', () => {
    const { store, sent, log } = setup();
    log.write('info', { logCode: 'early' }, 'm');
    store.setReady();
    log.write('info', { logCode: 'late' }, 'm');

    expect(sent).toEqual(['early', 'late']);
  });

  it('sends a record at once when the store is ready before the first record', () => {
    const { store, sent, log } = setup();
    store.setReady();
    log.write('info', { logCode: 'only' }, 'm');

    expect(sent).toEqual(['only']);
    expect(store.listenerCount()).toBe(0);
  });

  it('stops listening to the store once it has sent the held records', () => {
    const { store, log } = setup();
    log.write('info', { logCode: 'a' }, 'm');

    expect(store.listenerCount()).toBe(1);
    store.setReady();
    expect(store.listenerCount()).toBe(0);
  });

  it('drops the held records on dispose, and stops listening', () => {
    const { store, sent, log } = setup();
    log.write('warn', { logCode: 'a' }, 'm');
    log.dispose();
    store.setReady();

    expect(sent).toEqual([]);
    expect(store.listenerCount()).toBe(0);
  });

  it('drops records written after dispose', () => {
    const { store, sent, log } = setup();
    store.setReady();
    log.dispose();
    log.write('warn', { logCode: 'late' }, 'm');

    expect(sent).toEqual([]);
  });

  it('keeps sending the held records when one fails to send, and does not throw', () => {
    const store = fakeStore();
    const sent: string[] = [];
    const log = createDeferredLog(store, (s) => (s as { ready: boolean }).ready, ({ record }) => {
      if (record.logCode === 'bad') throw new Error('logger failed');
      sent.push(record.logCode);
    });
    log.write('warn', { logCode: 'bad' }, 'm');
    log.write('warn', { logCode: 'good' }, 'm');

    expect(() => store.setReady()).not.toThrow();
    expect(sent).toEqual(['good']);
  });

  it('does not throw into the caller when a record fails to send after the release', () => {
    const store = fakeStore();
    const sent: string[] = [];
    const log = createDeferredLog(store, (s) => (s as { ready: boolean }).ready, ({ record }) => {
      if (record.logCode === 'bad') throw new Error('logger failed');
      sent.push(record.logCode);
    });
    log.write('info', { logCode: 'held' }, 'm');
    store.setReady();

    expect(sent).toEqual(['held']);
    expect(() => log.write('warn', { logCode: 'bad' }, 'm')).not.toThrow();
  });

  it('waits for a state that two dispatches complete', () => {
    let state: { host?: string; meetingID?: string } = {};
    const listeners = new Set<() => void>();
    const store = {
      getState: () => state,
      subscribe: (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
    };
    const dispatch = (patch: typeof state) => { state = { ...state, ...patch }; listeners.forEach((l) => l()); };
    const sent: string[] = [];
    const log = createDeferredLog(store, (s) => {
      const { host, meetingID } = s as typeof state;
      return !!host && meetingID != null;
    }, ({ record }) => { sent.push(record.logCode); });
    log.write('warn', { logCode: 'a' }, 'm');

    dispatch({ host: 'h' });
    expect(sent).toEqual([]);
    dispatch({ meetingID: 'm1' });
    expect(sent).toEqual(['a']);
  });
});

describe('plugin host: when the app logger is ready', () => {
  const state = (meetingData: Record<string, unknown>) => ({ client: { meetingData } });

  it('waits for the server and the meeting id', () => {
    expect(isLoggerReady(state({ host: null, directHost: null, meetingID: null }))).toBe(false);
    expect(isLoggerReady(state({ host: 'h', directHost: null, meetingID: null }))).toBe(false);
    expect(isLoggerReady(state({ host: 'h', directHost: 'd', meetingID: null }))).toBe(false);
    expect(isLoggerReady(state({ host: null, directHost: null, meetingID: 'm' }))).toBe(false);
  });

  it('is ready once the meeting id and either server are set', () => {
    expect(isLoggerReady(state({ host: 'h', directHost: null, meetingID: 'm' }))).toBe(true);
    expect(isLoggerReady(state({ host: null, directHost: 'd', meetingID: 'm' }))).toBe(true);
  });

  it('is not ready for a state with no meeting data', () => {
    expect(isLoggerReady(undefined)).toBe(false);
    expect(isLoggerReady({})).toBe(false);
  });
});
