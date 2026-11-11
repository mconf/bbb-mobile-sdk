import { createMockHost } from '../src/testing/index.js';
import { describeHostConformance } from './conformance/suite.js';

describeHostConformance('mock host', () => {
  const { host, controller } = createMockHost();
  return {
    host,
    setLocale: (locale) => controller.setLocale(locale),
    failMutation: (mutation, error) => controller.setMutationError(mutation, error),
    errorLogCount: () => controller.logs.filter((entry) => entry.level === 'error').length,
    dialogIds: () => controller.dialogs.map((entry) => entry.dialog.id),
  };
});
