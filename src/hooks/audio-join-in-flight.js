// Kept out of use-audio-join so services can clear it without importing the
// hook's dependencies, which import those services back.
let joinInFlight = null;

export const getInFlightAudioJoin = () => joinInFlight;

export const setInFlightAudioJoin = (join) => {
  joinInFlight = join;
};

export const invalidateInFlightAudioJoin = () => {
  joinInFlight = null;
};
