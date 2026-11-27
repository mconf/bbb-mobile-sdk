// How the plugin host writes its own records and the plugins' records. The app
// passes one in, so that the host's TypeScript files import no React Native code
// and their tests run under plugin-api's vitest.
export type HostLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface HostLogRecord {
  logCode: string;
  extraInfo?: Record<string, unknown>;
}

export type HostLog = (level: HostLogLevel, record: HostLogRecord, message: string) => void;

export const errorInfo = (error: unknown): Record<string, unknown> => ({
  errorName: error instanceof Error ? error.name : typeof error,
  errorMessage: error instanceof Error ? error.message : String(error),
});
