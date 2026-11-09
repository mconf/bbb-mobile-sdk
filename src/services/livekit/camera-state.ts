// Per App instance (instance.cameraStops): a breakout's teardown must not mark
// the main room's cameras as expected stops, nor the other way around.
export interface CameraStopTracker {
  expectStreamStop: (stream: string) => void;
  expectAllStreamStops: () => void;
  clearExpectedStreamStops: () => void;
  consumeExpectedStreamStop: (stream: string) => boolean;
}

export const createCameraStopTracker = (): CameraStopTracker => {
  // Cameras this client asked to stop. A stop that is not in here came from the
  // server or the transport, and is the only kind the user has to be told about.
  const expectedStreamStops = new Set<string>();

  // A session teardown's stream ids are not known up front, so the whole teardown
  // is covered by this flag instead.
  let allStreamStopsExpected = false;

  return {
    expectStreamStop: (stream) => {
      expectedStreamStops.add(stream);
    },

    expectAllStreamStops: () => {
      allStreamStopsExpected = true;
    },

    clearExpectedStreamStops: () => {
      allStreamStopsExpected = false;
      expectedStreamStops.clear();
    },

    // The entry is dropped even when the teardown flag already answers for it, so
    // a marking left over from a teardown cannot swallow a real stop in the next
    // session.
    consumeExpectedStreamStop: (stream) => {
      const expected = expectedStreamStops.delete(stream);

      return allStreamStopsExpected || expected;
    },
  };
};
