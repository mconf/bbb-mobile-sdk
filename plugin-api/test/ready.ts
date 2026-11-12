import type { DataChannel, MutationState, MutationTrigger } from '../src/index.js';

/** The trigger of a mutation hook. Throws if the host has not set it yet. */
export const triggerOf = <V>(
  [trigger]: readonly [MutationTrigger<V> | null, MutationState],
): MutationTrigger<V> => {
  if (trigger === null) throw new Error('the mutation trigger is not set yet');
  return trigger;
};

/** The `pushEntry` of a data channel. Throws if the host has not set it yet. */
export const pushOf = <T>(channel: DataChannel<T>): NonNullable<DataChannel<T>['pushEntry']> => {
  if (channel.pushEntry === undefined) throw new Error('pushEntry is not set yet');
  return channel.pushEntry;
};
