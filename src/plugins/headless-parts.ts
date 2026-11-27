import {
  Fragment,
  PureComponent,
  createElement,
  useEffect,
  useSyncExternalStore,
  type ComponentType,
  type ReactElement,
} from 'react';
import type { PluginActivationState } from './activation-state';
import type { HostLog } from './log';
import { errorInfo } from './registry';

interface PartProps {
  name: string;
  Headless: ComponentType;
  log: HostLog;
}

const MountedPart = ({ name, Headless, log }: PartProps): ReactElement => {
  useEffect(() => {
    const extraInfo = { pluginName: name };
    log('debug', { logCode: 'plugin_host_part_mounted', extraInfo }, `Plugin ${name}: Headless part mounted`);
    return () => {
      log('debug', { logCode: 'plugin_host_part_unmounted', extraInfo }, `Plugin ${name}: Headless part unmounted`);
    };
  }, [name, log]);
  return createElement(Headless);
};

// Keeps a part's error inside its plugin, as with a create() that throws. It
// stays mounted while the part is off, so a cleanup that throws on a leave
// reaches it. Being pure, it skips re-renders of the screen around it.
class HeadlessPart extends PureComponent<PartProps & { enabled: boolean }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    const { name, log } = this.props;
    log(
      'error',
      { logCode: 'plugin_host_part_failed', extraInfo: { pluginName: name, ...errorInfo(error) } },
      `Plugin ${name}: its Headless part threw; the part is stopped`,
    );
  }

  render() {
    const { failed } = this.state;
    const {
      name,
      Headless,
      log,
      enabled,
    } = this.props;
    return failed || !enabled ? null : createElement(MountedPart, { name, Headless, log });
  }
}

// Mounts the Headless part of each active plugin. No plugin is active until the
// meeting's plugin list is read. The parts are unmounted while `enabled` is
// false: the app turns it off when the user leaves, so no part acts after that.
export const PluginHeadlessParts = ({ activation, enabled, log }: {
  activation: PluginActivationState;
  enabled: boolean;
  log: HostLog;
}): ReactElement | null => {
  const { active } = useSyncExternalStore(activation.subscribe, activation.get);
  const parts = active.flatMap(({ name, parts: { Headless } }) => (
    Headless ? [createElement(HeadlessPart, {
      key: name,
      name,
      Headless,
      log,
      enabled,
    })] : []
  ));
  if (parts.length === 0) return null;
  return createElement(Fragment, null, ...parts);
};
