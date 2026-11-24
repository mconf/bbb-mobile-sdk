// The host API version this host implements. It is the host's own value, not the
// contract package's. A host app may install a newer contract next to this SDK, and
// this host must not then accept plugins that need what it lacks. A test in
// plugin-api/test/sdk-host keeps it equal to the contract this repository ships.
export const HOST_API_VERSION = '0.1.0';
