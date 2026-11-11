import { describe, expect, it } from 'vitest';
import { HOST_API_VERSION, definePlugin } from '../src/index.js';
import type { MobilePluginDefinition } from '../src/index.js';
import packageJson from '../package.json' with { type: 'json' };

const valid: MobilePluginDefinition = {
  name: 'example-plugin',
  requiredHostApi: '^0.1.0',
  create: () => ({}),
};

describe('definePlugin', () => {
  it('returns the definition unchanged', () => {
    expect(definePlugin(valid)).toBe(valid);
  });

  it('accepts aliases', () => {
    const definition = { ...valid, aliases: ['older-name'] };
    expect(definePlugin(definition)).toBe(definition);
  });

  it.each([
    ['an empty name', { ...valid, name: ' ' }],
    ['an empty host API range', { ...valid, requiredHostApi: '' }],
    ['an empty alias', { ...valid, aliases: [''] }],
    ['a missing create', { ...valid, create: undefined as unknown as MobilePluginDefinition['create'] }],
  ])('rejects %s', (_case, definition) => {
    expect(() => definePlugin(definition)).toThrow(TypeError);
  });
});

describe('HOST_API_VERSION', () => {
  it('equals the package version', () => {
    expect(HOST_API_VERSION).toBe(packageJson.version);
  });
});
