const stopTrack = (track) => {
  if (track && typeof track.stop === 'function' && track.readyState !== 'ended') {
    track.stop();
  }
};

const stopStream = (stream) => {
  stream.getTracks().forEach(stopTrack);
};

const silentConsole = {
  log: () => {},
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
  assert: () => {},
};

export {
  stopStream,
  stopTrack,
  silentConsole,
};
