// Tells a mute this client requested from one the server made (a moderator mute, a reconnect).
// A mute can wait in a dead GraphQL socket for a minute, so its stamp outlives an unmute's.
const UNMUTE_COMMAND_LIFETIME_MS = 5000;
const MUTE_COMMAND_CEILING_MS = 120000;

export interface MuteCommand { muted: boolean; at: number; delivered: boolean }

let pendingCommand: MuteCommand | null = null;

const liveCommand = (): MuteCommand | null => {
  if (pendingCommand === null) return null;

  const lifetime = pendingCommand.muted ? MUTE_COMMAND_CEILING_MS : UNMUTE_COMMAND_LIFETIME_MS;

  if (Date.now() - pendingCommand.at >= lifetime) pendingCommand = null;

  return pendingCommand;
};

export const stampMuteCommand = (muted: boolean): MuteCommand => {
  pendingCommand = { muted, at: Date.now(), delivered: false };

  return pendingCommand;
};

// A later command replaces the stamp, so an earlier one resolving late marks nothing.
export const markMuteCommandDelivered = (command: MuteCommand | null): void => {
  if (command !== null && pendingCommand === command) command.delivered = true;
};

export const pendingMuteCommand = (): boolean | null => liveCommand()?.muted ?? null;

export const consumeMuteCommand = (muted: boolean): boolean => {
  const command = liveCommand();

  // Kept on a mismatch, so a check for one direction cannot consume the other's.
  if (command === null || command.muted !== muted) return false;

  // A voice mute seen before the command reaches the server (a reconnect's, say)
  // says nothing about it.
  if (muted && !command.delivered) return true;

  pendingCommand = null;

  return true;
};
