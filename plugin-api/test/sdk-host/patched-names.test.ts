import { describe, expect, it } from 'vitest';
import { withoutPatchedNames } from '../../../src/plugins/patched-names';

// Documents as graphql's parse() gives them, cut to the fields the function reads.
const operation = (operationType: string, name?: string) => ({
  kind: 'OperationDefinition',
  operation: operationType,
  ...(name === undefined ? {} : { name: { kind: 'Name', value: name } }),
  selectionSet: { kind: 'SelectionSet', selections: [] },
});
const fragment = { kind: 'FragmentDefinition', name: { kind: 'Name', value: 'Patched_U' } };
const doc = (...definitions: { kind: string }[]) => ({ kind: 'Document', definitions });

describe('plugin host: Patched_ operation names', () => {
  it('drops the prefix from a subscription, wherever it is in the document', () => {
    const result = withoutPatchedNames(doc(fragment, operation('subscription', 'Patched_Users')));
    expect(result.definitions).toEqual([fragment, operation('subscription', 'Users')]);
  });

  it('drops it from any operation type, since the middleware checks the name only', () => {
    expect(withoutPatchedNames(doc(operation('query', 'Patched_X'))).definitions)
      .toEqual([operation('query', 'X')]);
  });

  it('returns the same document when no operation name has the prefix', () => {
    const plain = doc(fragment, operation('subscription', 'Users'), operation('subscription'));
    expect(withoutPatchedNames(plain)).toBe(plain);
  });
});
