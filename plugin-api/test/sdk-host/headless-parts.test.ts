import { act, cleanup, render } from '@testing-library/react';
import { createElement, useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  HOST_API_VERSION,
  type Capabilities,
  type MobilePluginDefinition,
  type MobilePluginHost,
  type PluginParts,
} from '@mconf/bbb-mobile-plugin-api';
import { createPluginRegistry, type PluginRegistry } from '../../../src/plugins/registry';
import { createPluginActivationState } from '../../../src/plugins/activation-state';
import { PluginHeadlessParts } from '../../../src/plugins/headless-parts';
import {
  capabilitiesFrom,
  createPluginCapabilitiesState,
  type CapabilityInputs,
} from '../../../src/plugins/capabilities';
import type { HostLog, HostLogLevel, HostLogRecord } from '../../../src/plugins/log';

interface Entry { level: HostLogLevel; record: HostLogRecord; message: string }

const recorder = () => {
  const entries: Entry[] = [];
  const log: HostLog = (level, record, message) => { entries.push({ level, record, message }); };
  return { entries, log };
};

// A plugin whose Headless part counts its renders, mounts and unmounts.
const counting = (name: string, parts: 'headless' | 'none' = 'headless') => {
  const calls = { mounts: 0, unmounts: 0, renders: 0 };
  const Headless = () => {
    calls.renders += 1;
    useEffect(() => {
      calls.mounts += 1;
      return () => { calls.unmounts += 1; };
    }, []);
    return null;
  };
  const definition: MobilePluginDefinition = {
    name,
    requiredHostApi: HOST_API_VERSION,
    create: (): PluginParts => (parts === 'headless' ? { Headless } : {}),
  };
  return { definition, calls };
};

const setup = (definitions: MobilePluginDefinition[], options: { isBreakout?: boolean } = {}) => {
  const { entries, log } = recorder();
  const registry = createPluginRegistry(definitions, { isBreakout: options.isBreakout ?? false, log });
  const activation = createPluginActivationState();
  const element = (enabled: boolean) => createElement(PluginHeadlessParts, { activation, enabled, log });
  const mount = (enabled = true) => render(element(enabled));
  const settle = (active: PluginRegistry) => act(() => activation.settle(() => active));
  const partRecords = () => entries.filter((entry) => entry.record.logCode.startsWith('plugin_host_part_'));
  return { registry, element, mount, settle, partRecords };
};

afterEach(cleanup);

describe('plugin host: Headless parts', () => {
  it('mounts nothing before the meeting plugin list is read', () => {
    const a = counting('PluginA');
    const { mount } = setup([a.definition]);
    mount();
    expect(a.calls.renders).toBe(0);
  });

  it('mounts the part of each active plugin once the list is read', () => {
    const a = counting('PluginA');
    const b = counting('PluginB');
    const { registry, mount, settle } = setup([a.definition, b.definition]);
    mount();
    settle(registry);
    expect(a.calls.mounts).toBe(1);
    expect(b.calls.mounts).toBe(1);
  });

  it('does not mount a plugin that the gate left inactive', () => {
    const a = counting('PluginA');
    const b = counting('PluginB');
    const { registry, mount, settle } = setup([a.definition, b.definition]);
    mount();
    settle(registry.filter((plugin) => plugin.name === 'PluginB'));
    expect(a.calls.renders).toBe(0);
    expect(b.calls.mounts).toBe(1);
  });

  it('skips an active plugin with no Headless part', () => {
    const a = counting('PluginA', 'none');
    const b = counting('PluginB');
    const { registry, mount, settle, partRecords } = setup([a.definition, b.definition]);
    mount();
    settle(registry);
    expect(b.calls.mounts).toBe(1);
    expect(partRecords().map((entry) => entry.record.extraInfo?.pluginName)).toEqual(['PluginB']);
  });

  it('mounts nothing in a breakout room, whose registry is empty', () => {
    const a = counting('PluginA');
    const { registry, mount, settle } = setup([a.definition], { isBreakout: true });
    mount();
    settle(registry);
    expect(registry).toHaveLength(0);
    expect(a.calls.renders).toBe(0);
  });

  it('keeps the parts mounted across re-renders', () => {
    const a = counting('PluginA');
    const { registry, element, mount, settle, partRecords } = setup([a.definition]);
    const view = mount();
    settle(registry);
    view.rerender(element(true));
    view.rerender(element(true));
    expect(a.calls.mounts).toBe(1);
    expect(a.calls.unmounts).toBe(0);
    expect(partRecords().map((entry) => entry.record.logCode)).toEqual(['plugin_host_part_mounted']);
  });

  it('unmounts the parts when it is turned off, as on leave, and mounts none while off', () => {
    const a = counting('PluginA');
    const { registry, element, mount, settle, partRecords } = setup([a.definition]);
    const view = mount();
    settle(registry);
    expect(a.calls.mounts).toBe(1);

    view.rerender(element(false));
    expect(a.calls.unmounts).toBe(1);
    expect(partRecords().map((entry) => [entry.level, entry.record.logCode])).toEqual([
      ['debug', 'plugin_host_part_mounted'],
      ['debug', 'plugin_host_part_unmounted'],
    ]);

    const b = counting('PluginB');
    const other = setup([b.definition]);
    other.mount(false);
    other.settle(other.registry);
    expect(b.calls.renders).toBe(0);
  });

  it('logs one debug record per part when it mounts and when it unmounts', () => {
    const a = counting('PluginA');
    const { registry, mount, settle, partRecords } = setup([a.definition]);
    const view = mount();
    settle(registry);
    view.unmount();
    expect(partRecords().map(({ level, record }) => [level, record])).toEqual([
      ['debug', { logCode: 'plugin_host_part_mounted', extraInfo: { pluginName: 'PluginA' } }],
      ['debug', { logCode: 'plugin_host_part_unmounted', extraInfo: { pluginName: 'PluginA' } }],
    ]);
  });
});

describe('plugin host: capabilities through the host', () => {
  // A test plugin that shows something only where audio is routed per listener, and
  // reads no other member while it is off.
  const gated = () => {
    const seen: Capabilities[] = [];
    const shown = vi.fn();
    const definition: MobilePluginDefinition = {
      name: 'PluginA',
      requiredHostApi: HOST_API_VERSION,
      create: (given) => {
        const Shown = () => { shown(); return null; };
        const Headless = () => {
          const capabilities = given.useCapabilities();
          seen.push(capabilities);
          if (!capabilities.mediaGroupAudioRouting) return null;
          return createElement(Shown);
        };
        return { Headless };
      },
    };
    return { definition, seen, shown };
  };

  const run = (inputs: CapabilityInputs) => {
    const plugin = gated();
    const { log } = recorder();
    const state = createPluginCapabilitiesState();
    state.set(inputs);
    const registry = createPluginRegistry([plugin.definition], {
      isBreakout: false,
      log,
      useCapabilities: state.useCapabilities,
    });
    const activation = createPluginActivationState();
    render(createElement(PluginHeadlessParts, { activation, enabled: true, log }));
    act(() => activation.settle(() => registry));
    return plugin;
  };

  it('gives the part the current capabilities from its first render', () => {
    const plugin = run({ audioBridge: 'livekit' });
    expect(plugin.seen[0]).toEqual(capabilitiesFrom({ audioBridge: 'livekit' }));
    expect(plugin.shown).toHaveBeenCalled();
  });

  it('lets a plugin show nothing when audio routing is off', () => {
    const plugin = run({ audioBridge: 'bbb-webrtc-sfu' });
    expect(plugin.seen.length).toBeGreaterThan(0);
    expect(plugin.seen.every((capabilities) => !capabilities.mediaGroupAudioRouting)).toBe(true);
    expect(plugin.shown).not.toHaveBeenCalled();
  });

});

describe('plugin host: a Headless part that fails', () => {
  // React reports an error a boundary caught on the console; the tests check the
  // host's own record instead.
  const quiet = () => vi.spyOn(console, 'error').mockImplementation(() => {});

  const failing = (fail: (host: MobilePluginHost) => void, when: 'render' | 'effect' | 'cleanup') => {
    const definition: MobilePluginDefinition = {
      name: 'PluginA',
      requiredHostApi: HOST_API_VERSION,
      create: (host) => {
        const Headless = () => {
          if (when === 'render') fail(host);
          useEffect(() => {
            if (when === 'effect') fail(host);
            return () => { if (when === 'cleanup') fail(host); };
          }, []);
          return null;
        };
        return { Headless };
      },
    };
    return definition;
  };

  const runBeside = (definitions: MobilePluginDefinition[]) => {
    const { entries, log } = recorder();
    const registry = createPluginRegistry(definitions, { isBreakout: false, log });
    const activation = createPluginActivationState();
    const meeting = { mounts: 0, unmounts: 0 };
    const Meeting = () => {
      useEffect(() => {
        meeting.mounts += 1;
        return () => { meeting.unmounts += 1; };
      }, []);
      return null;
    };
    const view = (enabled: boolean) => createElement(
      'div',
      null,
      createElement(Meeting),
      createElement(PluginHeadlessParts, { activation, enabled, log }),
    );
    const { rerender } = render(view(true));
    act(() => activation.settle(() => registry));
    // A leave turns the parts off: a cleanup that throws runs then.
    const leave = () => rerender(view(false));
    return { entries, meeting, leave };
  };

  const cases: [string, (host: MobilePluginHost) => void, 'render' | 'effect' | 'cleanup'][] = [
    ['throws while it renders', () => { throw new Error('broken'); }, 'render'],
    ['calls a host member this host does not provide', (host) => { host.useCurrentUser(); }, 'render'],
    ['throws in an effect', () => { throw new Error('broken'); }, 'effect'],
    ['throws in an effect cleanup when the parts are turned off', () => { throw new Error('broken'); }, 'cleanup'],
  ];

  cases.forEach(([what, fail, when]) => {
    it(`stops only that plugin when its part ${what}`, () => {
      const spy = quiet();
      const b = counting('PluginB');
      const { entries, meeting, leave } = runBeside([failing(fail, when), b.definition]);
      if (when === 'cleanup') {
        leave();
        expect(b.calls.unmounts).toBe(1);
        expect(entries.filter((entry) => entry.record.logCode === 'plugin_host_part_unmounted')
          .map((entry) => entry.record.extraInfo?.pluginName)).toContain('PluginB');
      } else {
        expect(b.calls.mounts).toBe(1);
        expect(b.calls.unmounts).toBe(0);
      }
      spy.mockRestore();

      expect(meeting.mounts).toBe(1);
      expect(meeting.unmounts).toBe(0);
      expect(b.calls.mounts).toBe(1);
      const failed = entries.filter((entry) => entry.record.logCode === 'plugin_host_part_failed');
      expect(failed).toHaveLength(1);
      expect(failed[0].level).toBe('error');
      expect(failed[0].record.extraInfo).toMatchObject({ pluginName: 'PluginA', errorName: 'Error' });
    });
  });
});

describe('plugin host: re-renders around the parts', () => {
  it('does not re-render a part when the screen around it re-renders', () => {
    const a = counting('PluginA');
    const { log } = recorder();
    const registry = createPluginRegistry([a.definition], { isBreakout: false, log });
    const activation = createPluginActivationState();
    let rerender = () => {};
    const Screen = () => {
      const [, setCount] = useState(0);
      rerender = () => setCount((count) => count + 1);
      return createElement(PluginHeadlessParts, { activation, enabled: true, log });
    };
    render(createElement(Screen));
    act(() => activation.settle(() => registry));
    const renders = a.calls.renders;
    act(() => rerender());
    act(() => rerender());
    expect(a.calls.renders).toBe(renders);
    expect(a.calls.mounts).toBe(1);
  });
});

