const shimmedLogger = (level, msg, metadata = {}) => {
  console[level](msg, metadata);
};

const logger = {
  info: (metadata, msg) => shimmedLogger('info', msg, metadata),
  log: (metadata, msg) => shimmedLogger('log', msg, metadata),
  warn: (metadata, msg) => shimmedLogger('warn', msg, metadata),
  debug: (metadata, msg) => shimmedLogger('debug', msg, metadata),
  error: (metadata, msg) => shimmedLogger('error', msg, metadata),
};

export default logger;
