// How the plugin host writes its own records and the plugins' records. The app
// passes one in, so that this folder imports no React Native code and its tests
// run under plugin-api's vitest.
export type HostLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface HostLogRecord {
  logCode: string;
  extraInfo?: Record<string, unknown>;
}

export type HostLog = (level: HostLogLevel, record: HostLogRecord, message: string) => void;
