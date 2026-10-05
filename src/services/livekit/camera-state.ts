// Cameras this client asked to stop. A stop that is not in here came from the
// server or the transport, and is the only kind the user has to be told about.
const expectedStreamStops = new Set<string>();

// A session teardown's stream ids are not known up front, so the whole teardown is
// covered by this flag instead.
let allStreamStopsExpected = false;

export const expectStreamStop = (stream: string): void => {
  expectedStreamStops.add(stream);
};

export const expectAllStreamStops = (): void => {
  allStreamStopsExpected = true;
};

export const clearExpectedStreamStops = (): void => {
  allStreamStopsExpected = false;
  expectedStreamStops.clear();
};

// The entry is dropped even when the teardown flag already answers for it, so a
// marking left over from a teardown cannot swallow a real stop in the next session.
export const consumeExpectedStreamStop = (stream: string): boolean => {
  const expected = expectedStreamStops.delete(stream);

  return allStreamStopsExpected || expected;
};
