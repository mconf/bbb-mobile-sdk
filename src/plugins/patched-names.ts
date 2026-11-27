// The GraphQL middleware sends JSON patches for an operation whose name starts with
// Patched_, and only the web client applies them. Without the prefix it sends whole
// results. It reads the name Apollo sends, so this renames the parsed document, not
// the text.
const PREFIX = 'Patched_';

interface Definition {
  readonly kind: string;
  readonly name?: { readonly value: string };
}

export function withoutPatchedNames<D extends { readonly definitions: readonly Definition[] }>(
  document: D,
): D {
  const patched = (definition: Definition) => (
    definition.kind === 'OperationDefinition' && definition.name?.value.startsWith(PREFIX)
  );
  if (!document.definitions.some(patched)) return document;
  return {
    ...document,
    definitions: document.definitions.map((definition) => (
      patched(definition) && definition.name
        ? {
          ...definition,
          name: { ...definition.name, value: definition.name.value.slice(PREFIX.length) },
        }
        : definition
    )),
  };
}
