/* eslint max-classes-per-file: 0 */
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application';
import * as Device from 'expo-device';
import NetInfo from '@react-native-community/netinfo';
import { createLogger, stdSerializers } from 'browser-bunyan';
import { ConsoleFormattedStream } from '@browser-bunyan/console-formatted-stream';
import { ConsoleRawStream } from '@browser-bunyan/console-raw-stream';
import { nameFromLevel } from '@browser-bunyan/levels';
import { ServerStream } from './server-stream';
import Settings from '../../../settings.json';

const APP_VERSION = nativeApplicationVersion;
const BUILD_NUMBER = parseInt(nativeBuildVersion, 10) || 0;
const DEVICE_INFORMATION = {
  brand: Device.brand,
  designName: Device.designName,
  name: Device.deviceName,
  yearClass: Device.deviceYearClass,
  manufacturer: Device.manufacturer,
  modelId: Device.modelId,
  modelName: Device.modelName,
  osBuildId: Device.osBuildId,
  osInternalBuildId: Device.osInternalBuildId,
  osName: Device.osName,
  osVersion: Device.osVersion,
  platformApiLevel: Device.platformApiLevel,
  productName: Device.productName,
  suppCpuArch: Device.supportedCpuArchitectures,
  totalMemory: Device.totalMemory
};

// TODO pull configuration from server
const LOG_CONFIG = Settings.clientLog || {
  console: { enabled: true, level: 'debug' },
  server: { enabled: false, level: 'debug' },
};

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

// Custom stream that logs to an end-point
class ServerLoggerStream extends ServerStream {
  static getRemoteLogEndpointURL(host, route) {
    return `https://${host}/${route}`;
  }

  constructor({
    flushOnClose,
    logTag,
    method,
    throttleInterval,
    route,
  }) {
    super({
      flushOnClose,
      method,
      throttleInterval,
      route,
    });

    if (logTag) this.logTagString = logTag;
    if (route) this.route = route;

    this.writeCondition = this._writeCondition.bind(this);
    this._connected = false;
    this._trackConnectivityState();
  }

  _trackConnectivityState() {
    NetInfo.addEventListener(({ isConnected }) => {
      this._connected = isConnected;
    });
  }

  _writeCondition() {
    return this._connected;
  }

  write(rec) {
    const fullInfo = getAuthInfo();
    if (fullInfo?.host) {
      const remoteEndpointURL = ServerLoggerStream.getRemoteLogEndpointURL(
        fullInfo?.host,
        this.route
      );
      if (this.url !== remoteEndpointURL) this.url = remoteEndpointURL;
    }

    this.rec = rec;
    if (fullInfo.meetingId != null) {
      this.rec.userInfo = fullInfo;
    }
    this.rec.appVersion = APP_VERSION;
    this.rec.clientBuild = BUILD_NUMBER;
    this.rec.deviceInformation = DEVICE_INFORMATION;
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

      try {
        makeCall(
          'logClient',
          nameFromLevel[this.rec.level],
          this.rec.msg,
          this.rec.logCode,
          this.rec.extraInfo,
          fullInfo,
        );
      } catch (error) {
        console.debug('Logger makeCall failed', error);
      }
    } else {
      try {
        makeCall(
          'logClient',
          nameFromLevel[this.rec.level],
          this.rec.msg,
          this.rec.logCode,
          this.rec.extraInfo,
        );
      } catch (error) {
        console.debug('Logger makeCall failed', error);
      }
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
