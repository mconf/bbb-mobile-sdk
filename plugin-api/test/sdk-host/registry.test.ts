import { describe, expect, it, vi } from 'vitest';
import {
  HOST_API_VERSION,
  type DialogAction,
  type MobilePluginDefinition,
  type MobilePluginHost,
  type PluginParts,
} from '@mconf/bbb-mobile-plugin-api';
import { createPluginRegistry } from '../../../src/plugins/registry';
import { selectPlugins } from '../../../src/plugins/definitions';
import { HOST_API_VERSION as SDK_HOST_API_VERSION } from '../../../src/plugins/version';
import type { HostLog, HostLogLevel, HostLogRecord } from '../../../src/plugins/log';

// The app's plugin host (src/plugins/ at the repository root), tested here because
// the app has no test runner. The tests import no React Native code, as the host core imports none.

interface Entry { level: HostLogLevel; record: HostLogRecord }

const recorder = () => {
  const entries: Entry[] = [];
  const log: HostLog = (level, record) => { entries.push({ level, record }); };
  const codes = () => entries.map(({ level, record }) => `${level}:${record.logCode}`);
  return { entries, log, codes };
};

const plugin = (name: string, overrides: Partial<MobilePluginDefinition> = {}): MobilePluginDefinition => ({
  name,
  requiredHostApi: `^${HOST_API_VERSION}`,
  create: vi.fn(() => ({})),
  ...overrides,
});

const load = (list: unknown, isBreakout = false) => {
  const rec = recorder();
  return { registry: createPluginRegistry(list, { isBreakout, log: rec.log }), ...rec };
};

describe('plugin host: loading', () => {
  it('creates each listed plugin once, in the list order', () => {
    const a = plugin('A');
    const b = plugin('B');
    const { registry, entries } = load([a, b]);

    expect(registry.map((p) => p.name)).toEqual(['A', 'B']);
    expect(a.create).toHaveBeenCalledTimes(1);
    expect(b.create).toHaveBeenCalledTimes(1);
    expect(entries).toEqual([]);
  });

  it('keeps what create returns as the plugin parts', () => {
    const parts = { Headless: () => null };
    const { registry } = load([plugin('A', { create: () => parts })]);

    expect(registry[0]?.parts).toBe(parts);
  });

  it('loads nothing, and logs nothing, when the app passes no list', () => {
    expect(load(undefined)).toMatchObject({ registry: [], entries: [] });
    expect(load([])).toMatchObject({ registry: [], entries: [] });
  });

  it('logs and loads nothing when the list is not an array', () => {
    const { registry, codes } = load({ name: 'A' });

    expect(registry).toEqual([]);
    expect(codes()).toEqual(['error:plugin_host_invalid_list']);
  });

  it('drops and logs an entry that is not a plugin definition', () => {
    const b = plugin('B');
    const { registry, codes } = load([{ name: 'A', requiredHostApi: '^0.1.0' }, null, plugin('  '), b]);

    expect(registry.map((p) => p.name)).toEqual(['B']);
    expect(codes()).toEqual([
      'error:plugin_host_invalid_definition',
      'error:plugin_host_invalid_definition',
      'error:plugin_host_invalid_definition',
    ]);
  });
});

describe('plugin host: duplicate names', () => {
  it('creates only the first plugin with a name, and warns once per duplicate', () => {
    const first = plugin('A');
    const second = plugin('A');
    const third = plugin('A');
    const { registry, entries } = load([first, second, third]);

    expect(registry).toHaveLength(1);
    expect(first.create).toHaveBeenCalledTimes(1);
    expect(second.create).not.toHaveBeenCalled();
    expect(third.create).not.toHaveBeenCalled();
    expect(entries).toEqual([
      { level: 'warn', record: { logCode: 'plugin_host_duplicate_name', extraInfo: { pluginName: 'A', index: 1 } } },
      { level: 'warn', record: { logCode: 'plugin_host_duplicate_name', extraInfo: { pluginName: 'A', index: 2 } } },
    ]);
  });

  it('compares names exactly', () => {
    const { registry, entries } = load([plugin('A'), plugin('a'), plugin('A ')]);

    expect(registry.map((p) => p.name)).toEqual(['A', 'a', 'A ']);
    expect(entries).toEqual([]);
  });
});

describe('plugin host: host API range', () => {
  it('loads a plugin whose range, in npm\'s full grammar, includes the host version', () => {
    const ranges = [`>=${HOST_API_VERSION} <9.0.0`, `0.0.1 - ${HOST_API_VERSION}`, '0.x', `~${HOST_API_VERSION}`,
      HOST_API_VERSION, `1.0.0 || ${HOST_API_VERSION}`];
    const { registry, entries } = load(ranges.map((range, i) => plugin(`P${i}`, { requiredHostApi: range })));

    expect(registry).toHaveLength(ranges.length);
    expect(entries).toEqual([]);
  });

  it('skips and warns about a plugin whose range does not include the host version', () => {
    const skipped = plugin('A', { requiredHostApi: '^99.0.0' });
    const { registry, entries } = load([skipped]);

    expect(registry).toEqual([]);
    expect(skipped.create).not.toHaveBeenCalled();
    expect(entries).toEqual([{
      level: 'warn',
      record: {
        logCode: 'plugin_host_incompatible',
        extraInfo: { pluginName: 'A', requiredHostApi: '^99.0.0', hostApiVersion: HOST_API_VERSION },
      },
    }]);
  });

  it('skips and logs a plugin whose range is not a semver range', () => {
    const skipped = plugin('A', { requiredHostApi: 'latest' });
    const { registry, codes } = load([skipped]);

    expect(registry).toEqual([]);
    expect(skipped.create).not.toHaveBeenCalled();
    expect(codes()).toEqual(['error:plugin_host_invalid_range']);
  });

  it("applies npm's pre-release rule to a pre-release host version", () => {
    const rec = recorder();
    const ranges = ['0.2.0-beta.1', '^0.2.0-beta.1', '>=0.2.0-beta.0 <0.3.0', '^0.1.0', '>=0.1.0', '0.2.x'];
    const selected = selectPlugins(ranges.map((range, i) => plugin(`P${i}`, { requiredHostApi: range })), rec.log, '0.2.0-beta.1');

    expect(selected.map((p) => p.requiredHostApi)).toEqual(['0.2.0-beta.1', '^0.2.0-beta.1', '>=0.2.0-beta.0 <0.3.0']);
    expect(rec.codes()).toEqual(Array(3).fill('warn:plugin_host_incompatible'));
  });

  it('keeps the first plugin with a name even when only a later one has a matching range', () => {
    const { registry, codes } = load([plugin('A', { requiredHostApi: '^99.0.0' }), plugin('A')]);

    expect(registry).toEqual([]);
    expect(codes()).toEqual(['warn:plugin_host_duplicate_name', 'warn:plugin_host_incompatible']);
  });
});

describe('plugin host: failures in create', () => {
  it('drops a plugin whose create throws, logs it, and still loads the others', () => {
    const { registry, entries } = load([plugin('A', { create: () => { throw new TypeError('boom'); } }), plugin('B')]);

    expect(registry.map((p) => p.name)).toEqual(['B']);
    expect(entries).toEqual([{
      level: 'error',
      record: {
        logCode: 'plugin_host_create_failed',
        extraInfo: { pluginName: 'A', errorName: 'TypeError', errorMessage: 'boom' },
      },
    }]);
  });

  it('drops and logs a plugin whose create returns a promise, and catches its rejection', async () => {
    const create = (async () => { throw new Error('later'); }) as unknown as MobilePluginDefinition['create'];
    const { registry, entries } = load([plugin('A', { create })]);
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    expect(registry).toEqual([]);
    expect(entries).toEqual([{
      level: 'error',
      record: { logCode: 'plugin_host_create_failed', extraInfo: { pluginName: 'A', returned: 'promise' } },
    }]);
  });

  it('drops and logs a plugin whose parts throw when read', () => {
    const hostile = {};
    Object.defineProperty(hostile, 'then', { get() { throw new Error('hostile'); } });
    const { registry, entries } = load([plugin('A', { create: () => hostile }), plugin('B')]);

    expect(registry.map((p) => p.name)).toEqual(['B']);
    expect(entries).toEqual([{
      level: 'error',
      record: {
        logCode: 'plugin_host_create_failed',
        extraInfo: { pluginName: 'A', errorName: 'Error', errorMessage: 'hostile' },
      },
    }]);
  });

  it('drops and logs a plugin whose create returns no object', () => {
    const { registry, codes } = load([plugin('A', { create: (() => undefined) as unknown as MobilePluginDefinition['create'] })]);

    expect(registry).toEqual([]);
    expect(codes()).toEqual(['error:plugin_host_create_failed']);
  });
});

describe('plugin host: meetings', () => {
  it('creates no plugin for a breakout room', () => {
    const a = plugin('A');
    const { registry, entries } = load([a], true);

    expect(registry).toEqual([]);
    expect(a.create).not.toHaveBeenCalled();
    expect(entries).toEqual([]);
  });

  it('gives each meeting its own create call and its own state', () => {
    const create = vi.fn((): PluginParts => ({ Headless: () => null }));
    const a = plugin('A', { create });
    const first = load([a]).registry;
    const second = load([a]).registry;

    expect(create).toHaveBeenCalledTimes(2);
    expect(second[0]?.parts).not.toBe(first[0]?.parts);
    expect(second[0]?.host).not.toBe(first[0]?.host);
  });
});

describe('plugin host: the host object', () => {
  const hostOf = (name = 'A'): { host: MobilePluginHost; entries: Entry[] } => {
    let host: MobilePluginHost | undefined;
    const { entries } = load([plugin(name, { create: (h) => { host = h; return {}; } })]);
    if (!host) throw new Error('create was not called');
    return { host, entries };
  };

  it("gives the plugin the definition's name and the host API version", () => {
    const { host } = hostOf('SomePlugin');

    expect(host.pluginName).toBe('SomePlugin');
    expect(host.hostApiVersion).toBe(SDK_HOST_API_VERSION);
  });

  it('implements the host API version of the contract this repository ships', () => {
    expect(SDK_HOST_API_VERSION).toBe(HOST_API_VERSION);
  });

  it("keeps the plugin's own name on its records, whatever extraInfo says", () => {
    const { host, entries } = hostOf('SomePlugin');
    host.logger.info({ logCode: 'some_code', extraInfo: { pluginName: 'Other' } }, 'message');

    expect(entries).toEqual([
      { level: 'info', record: { logCode: 'some_code', extraInfo: { pluginName: 'SomePlugin' } } },
    ]);
  });

  it('adds the plugin name to the records of its logger', () => {
    const { host, entries } = hostOf('SomePlugin');
    host.logger.warn({ logCode: 'some_code', extraInfo: { detail: 1 } }, 'message');
    host.logger.debug({ logCode: 'other_code' }, 'message');

    expect(entries).toEqual([
      { level: 'warn', record: { logCode: 'some_code', extraInfo: { detail: 1, pluginName: 'SomePlugin' } } },
      { level: 'debug', record: { logCode: 'other_code', extraInfo: { pluginName: 'SomePlugin' } } },
    ]);
  });

  it('throws from each member this host version does not provide', () => {
    const { host } = hostOf();
    const ok: DialogAction = { label: 'OK', kind: 'primary', onPress: () => {} };
    const calls: [string, () => unknown][] = [
      ['useCurrentUser', () => host.useCurrentUser()],
      ['useUsersBasicInfo', () => host.useUsersBasicInfo()],
      ['useCustomSubscription', () => host.useCustomSubscription('subscription { x }')],
      ['useCustomMutation', () => host.useCustomMutation('mutation { x }')],
      ['useDataChannel', () => host.useDataChannel('channel')],
      ['usePluginSettings', () => host.usePluginSettings()],
      ['useLocale', () => host.useLocale()],
      ['useCapabilities', () => host.useCapabilities()],
      ['setActionsSheetItems', () => host.setActionsSheetItems([])],
      ['openSelector', () => host.openSelector('id')],
      ['dialogs.confirm', () => host.dialogs.confirm({ id: 'd', title: 't', body: [], actions: [ok] })],
      ['dialogs.info', () => host.dialogs.info({ id: 'd', title: 't', body: 'b' })],
      ['dialogs.close', () => host.dialogs.close('d')],
      ['notify', () => host.notify({ message: 'm' })],
    ];
    calls.forEach(([member, call]) => {
      expect(call, member).toThrow(`${member} is not available in this host version`);
    });
  });
});
