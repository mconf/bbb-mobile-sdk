import { createMockHost } from '../src/testing/index.js';
import { CONFORMANCE_GROUPS, describeHostConformance } from './conformance/suite.js';
import { MOCK_SKIPS } from './conformance/mock-skips.js';

describeHostConformance('mock host', () => {
  const { host, controller } = createMockHost();
  return {
    host,
    setLocale: (locale) => controller.setLocale(locale),
    failMutation: (mutation, error) => controller.setMutationError(mutation, error),
    errorLogCount: () => controller.logs.filter((entry) => entry.level === 'error').length,
    dialogIds: () => controller.dialogs.map((entry) => entry.dialog.id),
    pressDialogAction: (id, actionIndex) => controller.pressDialogAction(id, actionIndex),
    setSubscriptionResult: (query, _variables, result) => controller.setSubscriptionResult(query, result),
    subscriptionCount: (query) => controller.subscriptions.filter((entry) => entry.query === query).length,
    // A second mock: each serves one plugin, so they share nothing.
    otherPluginHost: () => createMockHost().host,
  };
}, CONFORMANCE_GROUPS, MOCK_SKIPS);
