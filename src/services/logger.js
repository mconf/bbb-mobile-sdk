/* eslint max-classes-per-file: 0 */
import Constants from 'expo-constants';
import { createLogger, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';
import { ServerStream } from '@browser-bunyan/server-stream';
import { nameFromLevel } from '@browser-bunyan/levels';

const APP_VERSION = Constants.manifest.version;

// TODO this is not good - refactor out later - prlanzarin
let getAuthInfo = () => { return {}; };
let makeCall = () => {};
let getCurrentSessionId = () => {};
const injectMakeCall = (func) => {
  makeCall = func;
};
const injectAuthInfoFetcher = (func) => {
  getAuthInfo = func;
};
const injectSessionIdFetcher = (func) => {
  getCurrentSessionId = func;
};

// TODO pull configuration from server
const LOG_CONFIG = {
  console: { enabled: true, level: 'debug' },
  server: { enabled: true, level: 'debug' },
};

// Custom stream that logs to an end-point
class ServerLoggerStream extends ServerStream {
  constructor(params) {
    super(params);

    if (params.logTag) {
      this.logTagString = params.logTag;
    }
  }

  write(rec) {
    const fullInfo = getAuthInfo();

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      this.rec.userInfo = fullInfo;
    }
    this.rec.clientBuild = APP_VERSION;
    this.rec.connectionId = getCurrentSessionId();
    if (this.logTagString) {
      this.rec.logTag = this.logTagString;
    }
    return super.write(this.rec);
  }
}

// Custom stream to log to the meteor server
class MeteorStream {
  write(rec) {
    const fullInfo = getAuthInfo();

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      if (!this.rec.extraInfo) {
        this.rec.extraInfo = {};
      }

      makeCall(
        'logClient',
        nameFromLevel[this.rec.level],
        this.rec.msg,
        this.rec.logCode,
        this.rec.extraInfo,
        fullInfo,
      );
    } else {
      makeCall(
        'logClient',
        nameFromLevel[this.rec.level],
        this.rec.msg,
        this.rec.logCode,
        this.rec.extraInfo,
      );
    }
  }
}

function createStreamForTarget(target, options) {
  const TARGET_EXTERNAL = 'external';
  const TARGET_CONSOLE = 'console';
  const TARGET_SERVER = 'server';

  let Stream = ConsoleRawStream;
  switch (target) {
    case TARGET_EXTERNAL:
      Stream = ServerLoggerStream;
      break;
    case TARGET_CONSOLE:
      Stream = ConsoleFormattedStream;
      break;
    case TARGET_SERVER:
      Stream = MeteorStream;
      break;
    default:
      Stream = ConsoleFormattedStream;
  }

  return new Stream(options);
}

function generateLoggerStreams(config) {
  let result = [];
  Object.keys(config).forEach((key) => {
    const logOption = config[key];
    if (logOption && logOption.enabled) {
      const { level, ...streamOptions } = logOption;
      result = result.concat({ level, stream: createStreamForTarget(key, streamOptions) });
    }
  });
  return result;
}

// Creates the logger with the array of streams of the chosen targets
const logger = createLogger({
  name: 'clientLogger',
  streams: generateLoggerStreams(LOG_CONFIG),
  serializers: stdSerializers,
  src: true,
});

export {
  injectMakeCall,
  injectAuthInfoFetcher,
  injectSessionIdFetcher,
};

export default logger;
