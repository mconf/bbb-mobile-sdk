import { describe, expect, it, vi } from 'vitest';
import { HOST_API_VERSION, type MobilePluginDefinition } from '@mconf/bbb-mobile-plugin-api';
import { createPluginRegistry, type PluginRegistry } from '../../../src/plugins/registry';
import { selectActivePlugins, type PluginListRead } from '../../../src/plugins/activation';
import { createPluginActivationState } from '../../../src/plugins/activation-state';
import type { HostLog, HostLogLevel, HostLogRecord } from '../../../src/plugins/log';

interface Entry { level: HostLogLevel; record: HostLogRecord; message: string }

const recorder = () => {
  const entries: Entry[] = [];
  const log: HostLog = (level, record, message) => { entries.push({ level, record, message }); };
  const codes = () => entries.map(({ level, record }) => `${level}:${record.logCode}`);
  return { entries, log, codes };
};

const definition = (name: string): MobilePluginDefinition => ({
  name,
  requiredHostApi: `^${HOST_API_VERSION}`,
  create: () => ({}),
});

const registry = (...names: string[]): PluginRegistry => createPluginRegistry(
  names.map(definition),
  { isBreakout: false, log: () => {} },
);

// The meeting's plugin list as the reader receives it: rows of the `plugin` view.
const listed = (...rows: [string, string | null, string?][]): PluginListRead => ({
  kind: 'data',
  data: { plugin: rows.map(([name, reason, source]) => ({ name, loadFailureReason: reason, loadFailureSource: source ?? '' })) },
});

// The meeting's client settings, with one public.plugins entry per name.
const settings = (byName: Record<string, unknown>) => ({
  public: { plugins: Object.entries(byName).map(([name, s]) => ({ name, settings: s })) },
});

const MOBILE_ON = { mobile: { enabled: true } };

const select = (plugins: PluginRegistry, read: PluginListRead, clientSettings: unknown) => {
  const rec = recorder();
  const active = selectActivePlugins(plugins, read, clientSettings, rec.log);
  return { active, names: active.map((p) => p.name), ...rec };
};

describe('plugin host: activation', () => {
  it('runs a plugin the meeting loaded when its settings turn mobile on', () => {
    const plugins = registry('PluginA');
    const { active, codes } = select(plugins, listed(['PluginA', '']), settings({ PluginA: MOBILE_ON }));

    expect(active).toEqual([plugins[0]]);
    expect(codes()).toEqual(['info:plugin_host_activation']);
  });

  it('keeps a plugin the meeting does not list inactive, with a warning', () => {
    const { names, entries } = select(registry('PluginA'), listed(['PluginB', '']), settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual([]);
    expect(entries[0]).toMatchObject({
      level: 'warn',
      record: { logCode: 'plugin_host_not_listed', extraInfo: { pluginName: 'PluginA' } },
    });
    expect(entries[0]?.message).toContain('PluginA');
  });

  it('keeps every plugin inactive when the list cannot be read', () => {
    const failures: PluginListRead[] = [
      { kind: 'error', error: new Error('socket closed') },
      { kind: 'data', data: null },
      { kind: 'data', data: undefined },
      { kind: 'data', data: {} },
      { kind: 'data', data: { plugin: 'not a list' } },
    ];
    failures.forEach((read) => {
      const { names, codes } = select(registry('PluginA', 'PluginB'), read, settings({ PluginA: MOBILE_ON, PluginB: MOBILE_ON }));

      expect(names).toEqual([]);
      expect(codes()).toEqual(['warn:plugin_host_list_unavailable', 'info:plugin_host_activation']);
    });
  });

  it('names the error of a failed read', () => {
    const { entries } = select(registry('PluginA'), { kind: 'error', error: new TypeError('bad field') }, {});

    expect(entries[0]?.record.extraInfo).toMatchObject({ errorName: 'TypeError', errorMessage: 'bad field' });
  });

  it('runs a plugin only when mobile.enabled is the boolean true', () => {
    const values: unknown[] = [true, 'true', 1, false, null, {}];
    values.forEach((enabled) => {
      const { names } = select(registry('PluginA'), listed(['PluginA', '']), settings({ PluginA: { mobile: { enabled } } }));

      expect(names).toEqual(enabled === true ? ['PluginA'] : []);
    });
  });

  it('keeps a plugin off when its mobile setting is missing', () => {
    const missing: unknown[] = [
      settings({}),
      settings({ PluginA: undefined }),
      settings({ PluginA: {} }),
      settings({ PluginA: { mobile: {} } }),
      settings({ PluginA: { mobile: true } }),
      settings({ PluginA: 'on' }),
      {},
      { public: {} },
      { public: { plugins: 'not a list' } },
      null,
    ];
    missing.forEach((clientSettings) => {
      const { names, entries } = select(registry('PluginA'), listed(['PluginA', '']), clientSettings);

      expect(names).toEqual([]);
      expect(entries[0]).toMatchObject({
        level: 'info',
        record: { logCode: 'plugin_host_mobile_disabled', extraInfo: { pluginName: 'PluginA' } },
      });
    });
  });

  it('keeps a plugin the server failed to load inactive, with the server reason', () => {
    const reason = 'Cannot load plugin [PluginA]: system SDK version [1.0.0] does not satisfy plugin requirement [~0.1.5].';
    const { names, entries } = select(registry('PluginA'), listed(['PluginA', reason, 'bbb-apps-akka']), settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual([]);
    expect(entries[0]).toMatchObject({
      level: 'warn',
      record: {
        logCode: 'plugin_host_load_failed',
        extraInfo: { pluginName: 'PluginA', failureReason: reason, failureSource: 'bbb-apps-akka' },
      },
    });
  });

  it('counts only an empty load failure reason as loaded', () => {
    const { names, codes } = select(registry('PluginA'), listed(['PluginA', null]), settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual([]);
    expect(codes()).toEqual(['warn:plugin_host_load_failed', 'info:plugin_host_activation']);
  });

  it('applies the same rule to every plugin', () => {
    const { names, codes } = select(
      registry('PluginA', 'PluginB', 'PluginC', 'PluginD'),
      listed(['PluginA', ''], ['PluginB', ''], ['PluginC', 'failed']),
      settings({ PluginA: MOBILE_ON, PluginB: {}, PluginC: MOBILE_ON, PluginD: MOBILE_ON }),
    );

    expect(names).toEqual(['PluginA']);
    expect(codes()).toEqual([
      'info:plugin_host_mobile_disabled',
      'warn:plugin_host_load_failed',
      'warn:plugin_host_not_listed',
      'info:plugin_host_activation',
    ]);
  });

  it('matches names exactly', () => {
    const { names } = select(registry('PluginA'), listed(['plugina', ''], ['PluginA ', '']), settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual([]);
  });

  it('keeps the order of the created plugins', () => {
    const plugins = registry('PluginB', 'PluginA');
    const { active } = select(plugins, listed(['PluginA', ''], ['PluginB', '']), settings({ PluginA: MOBILE_ON, PluginB: MOBILE_ON }));

    expect(active).toEqual([plugins[0], plugins[1]]);
    expect(Object.isFrozen(active)).toBe(true);
  });

  it('reads the first settings entry with the plugin name', () => {
    const clientSettings = { public: { plugins: [{ name: 'PluginA', settings: MOBILE_ON }, { name: 'PluginA', settings: {} }] } };
    const { names } = select(registry('PluginA'), listed(['PluginA', '']), clientSettings);

    expect(names).toEqual(['PluginA']);
  });

  it('counts a plugin listed twice as loaded when one of its rows has no failure', () => {
    const { names } = select(registry('PluginA'), listed(['PluginA', 'failed'], ['PluginA', '']), settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual(['PluginA']);
  });

  it('ignores rows it cannot read', () => {
    const read: PluginListRead = {
      kind: 'data',
      data: { plugin: [null, 7, { name: 3, loadFailureReason: '' }, { loadFailureReason: '' }, { name: 'PluginA', loadFailureReason: '' }] },
    };
    const { names } = select(registry('PluginA'), read, settings({ PluginA: MOBILE_ON }));

    expect(names).toEqual(['PluginA']);
  });

  it('sums up the active plugins in one record', () => {
    const { entries } = select(registry('PluginA', 'PluginB'), listed(['PluginA', ''], ['PluginB', '']), settings({ PluginA: MOBILE_ON }));

    expect(entries.at(-1)).toMatchObject({
      level: 'info',
      record: { logCode: 'plugin_host_activation', extraInfo: { activePlugins: ['PluginA'], total: 2 } },
    });
  });

  it('logs nothing when the app has no plugins', () => {
    const { names, entries } = select(registry(), { kind: 'error', error: new Error('unused') }, {});

    expect(names).toEqual([]);
    expect(entries).toEqual([]);
  });
});

describe('plugin host: activation state', () => {
  it('starts with no active plugin, before the list is read', () => {
    expect(createPluginActivationState().get()).toEqual({ settled: false, active: [] });
  });

  it('settles once, and tells its subscribers', () => {
    const state = createPluginActivationState();
    const plugins = registry('PluginA');
    const seen: unknown[] = [];
    state.subscribe(() => { seen.push(state.get()); });
    const compute = vi.fn(() => plugins);

    state.settle(compute);
    state.settle(compute);

    expect(compute).toHaveBeenCalledTimes(1);
    expect(seen).toEqual([{ settled: true, active: plugins }]);
    expect(state.get()).toEqual({ settled: true, active: plugins });
  });

  it('keeps the same snapshot until it settles', () => {
    const state = createPluginActivationState();
    const before = state.get();

    expect(state.get()).toBe(before);
    state.settle(() => registry());
    expect(state.get()).not.toBe(before);
    expect(state.get()).toBe(state.get());
  });

  it('stops telling a subscriber that unsubscribed', () => {
    const state = createPluginActivationState();
    const listener = vi.fn();
    const unsubscribe = state.subscribe(listener);
    unsubscribe();
    state.settle(() => registry());

    expect(listener).not.toHaveBeenCalled();
  });
});
