// The cases the mock host skips. Its TSDoc says why: it returns a custom subscription's
// result by query text alone, with no loading step after its arguments change. It is
// also ready from the first render.
export const MOCK_SKIPS: readonly string[] = [
  'returns the previous result, then loading with no data, then the new data after its arguments change',
  'goes straight to the new data when another hook already holds the new arguments',
  'sets the trigger only once it can send the mutation',
];
