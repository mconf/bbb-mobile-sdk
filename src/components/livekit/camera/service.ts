import { VideoPreset, type TrackPublishOptions, type VideoResolution } from 'livekit-client';
import logger from '../../../services/logger';
import { getMeetingSettings } from '../../../graphql/local-states/useMeetingSettings';
import { type CameraProfile, type LiveKitPresetConfig } from '../../../types/meetingClientSettings';
import {
  assemblePresetFromConfig,
  deduplicatePresets,
  type PresetDefaults,
} from '../../../services/livekit/presets';

// Match @livekit/react-native's default video capture (VideoPresets.h720 =
// 1280x720). setCameraEnabled requests no explicit resolution, so constraint-less
// profiles must derive their simulcast layers from the REAL capture dimensions,
// otherwise the lower layers are scaled off-proportion vs the captured track.
const DEFAULT_CAM_WIDTH = 1280;
const DEFAULT_CAM_HEIGHT = 720;
const DEFAULT_CAM_FPS = 30;
const DEFAULT_CAM_BITRATE = 500_000;
const MAX_SIMULCAST_LAYERS = 3;

interface CaptureSettings {
  width: number;
  height: number;
  frameRate: number | undefined;
}

const getCameraProfiles = (): CameraProfile[] => (
  getMeetingSettings()?.public?.kurento?.cameraProfiles ?? []
);

// Mobile has no camera-profile selection UI, so the "selected" profile is the
// configured default (falling back to the highest visible profile / first).
const getSelectedCameraProfile = (): CameraProfile | undefined => {
  const profiles = getCameraProfiles();
  const visible = profiles.filter((p) => !p.hidden);

  return profiles.find((p) => p.default) ?? visible[visible.length - 1] ?? profiles[0];
};

const getVisibleProfiles = (): CameraProfile[] => getCameraProfiles().filter((p) => !p.hidden);

// Mobile has no pre-publish MediaStream to inspect (setCameraEnabled creates the
// track internally), so capture settings come from the selected profile's
// constraints or the defaults.
const getCameraCaptureSettings = (profile?: CameraProfile): CaptureSettings => ({
  width: profile?.constraints?.width ?? DEFAULT_CAM_WIDTH,
  height: profile?.constraints?.height ?? DEFAULT_CAM_HEIGHT,
  frameRate: profile?.constraints?.frameRate ?? DEFAULT_CAM_FPS,
});

// Maps a BBB CameraProfile to a VideoPreset (LiveKit's encoding descriptor).
// Profiles with explicit constraints use them directly; profiles without
// constraints derive resolution proportionally from the capture dimensions and
// the bitrate ratio to the top (selected) profile.
const profileToPreset = (
  profile: CameraProfile,
  captureWidth: number,
  captureHeight: number,
  topBitrate: number,
): VideoPreset => {
  const bitrate = profile?.bitrate || 0;
  const bitrateInBps = bitrate * 1000 || DEFAULT_CAM_BITRATE;
  const fps = profile.constraints?.frameRate;

  // We have constraints with the required fields, map directly
  if (profile.constraints?.width && profile.constraints?.height) {
    return new VideoPreset(
      profile.constraints.width,
      profile.constraints.height,
      bitrateInBps,
      fps,
      'medium',
    );
  }

  if (!bitrate || bitrate <= 0 || !topBitrate || topBitrate <= 0) {
    logger.warn({
      logCode: 'livekit_camera_profile_misconfigured',
      extraInfo: {
        profileId: profile?.id,
        profileBitrate: profile?.bitrate,
        topBitrate,
      },
    }, `LiveKit: camera profile "${profile?.id}" has invalid bitrate (${profile?.bitrate}), using defaults`);

    return new VideoPreset(captureWidth, captureHeight, bitrateInBps, fps, 'medium');
  }

  // Incomplete or undefined constraints: derive resolution from bitrate ratio
  const scale = Math.sqrt(profile.bitrate / topBitrate);
  const w = Math.max(2, Math.round(captureWidth * scale));
  const h = Math.max(2, Math.round(captureHeight * scale));

  return new VideoPreset(
    w - (w % 2), // even width
    h - (h % 2), // even height
    bitrateInBps,
    fps,
    'medium',
  );
};

const getDefaultCameraPresets = (): VideoPreset[] => {
  const { width, height, frameRate } = getCameraCaptureSettings(getSelectedCameraProfile());

  return [new VideoPreset(width, height, DEFAULT_CAM_BITRATE, frameRate ?? DEFAULT_CAM_FPS, 'medium')];
};

// Derives simulcast presets from camera quality profiles. The selected profile
// is the TOP layer; lower visible profiles become lower simulcast layers.
const getProfileBasedPresets = (): VideoPreset[] => {
  const visibleProfiles = getVisibleProfiles();
  const selectedProfile = getSelectedCameraProfile();

  if (!selectedProfile || visibleProfiles.length === 0) {
    return getDefaultCameraPresets();
  }

  const selectedIndex = visibleProfiles.findIndex((p) => p.id === selectedProfile.id);
  const { width, height, frameRate } = getCameraCaptureSettings(selectedProfile);

  // Hidden/threshold profile — single layer.
  if (selectedIndex < 0) {
    return [profileToPreset(selectedProfile, width, height, selectedProfile.bitrate)];
  }

  const start = Math.max(0, selectedIndex - (MAX_SIMULCAST_LAYERS - 1));
  const layerProfiles = visibleProfiles.slice(start, selectedIndex + 1);
  const topBitrate = selectedProfile.bitrate;
  const presets = layerProfiles.map(
    (p) => profileToPreset(p, width, height, topBitrate),
  );

  return deduplicatePresets(presets, frameRate);
};

// Override mode: when livekit.camera.presets is explicitly configured, bypass
// profile-based mapping. Partially-specified presets are filled via linear
// interpolation between the auto-generated profile-based defaults.
const resolveExplicitPresets = (
  configPresets: LiveKitPresetConfig[],
): VideoPreset[] => {
  const defaults = getProfileBasedPresets();
  const first = defaults[0];
  const last = defaults[defaults.length - 1];
  const firstFps = first.encoding.maxFramerate;
  const lastFps = last.encoding.maxFramerate;

  const interpolateFps = (t: number): number | undefined => {
    if (firstFps != null && lastFps != null) {
      return Math.round(firstFps + t * (lastFps - firstFps));
    }

    return firstFps ?? lastFps;
  };

  const resolved = configPresets.map((config, index) => {
    const t = configPresets.length > 1 ? index / (configPresets.length - 1) : 1;
    const positionalDefaults: PresetDefaults = {
      width: last.width,
      height: last.height,
      maxBitrate: Math.round(
        first.encoding.maxBitrate + t * (last.encoding.maxBitrate - first.encoding.maxBitrate),
      ),
      maxFramerate: interpolateFps(t),
      priority: 'medium',
    };

    return assemblePresetFromConfig(config, positionalDefaults);
  });

  const { frameRate } = getCameraCaptureSettings(getSelectedCameraProfile());

  return deduplicatePresets(resolved, frameRate);
};

// The capture resolution to request from @livekit/react-native. The idea is to
// try and converge capture resolution with the configured default profile
// (settings.yml provided) Without this, mobile captures at RN's default (h720 = 1280x720).
// Profiles without explict constraints will fallback to the original default.
export const getCameraCaptureResolution = (): VideoResolution => {
  const { width, height, frameRate } = getCameraCaptureSettings(getSelectedCameraProfile());

  return { width, height, frameRate: frameRate ?? DEFAULT_CAM_FPS };
};

export const getCameraPublishOptions = (): Partial<TrackPublishOptions> => {
  const configPresets = getMeetingSettings()?.public?.media?.livekit?.camera?.presets;

  const presets = configPresets?.length
    ? resolveExplicitPresets(configPresets)
    : getProfileBasedPresets();

  const layers = presets.length > 1 ? presets.slice(0, -1) : [];
  const topEncoding = presets[presets.length - 1]?.encoding;

  logger.debug({
    logCode: 'livekit_camera_presets',
    extraInfo: {
      selectedProfile: getSelectedCameraProfile()?.id,
      presetCount: presets.length,
      simulcastLayerCount: layers.length,
      presets: presets.map((p) => ({
        width: p.width,
        height: p.height,
        maxBitrate: p.encoding.maxBitrate,
        maxFramerate: p.encoding.maxFramerate,
      })),
    },
  }, `LiveKit: resolved camera presets (p=${presets.length}, l=${layers.length})`);

  return {
    simulcast: presets.length > 1,
    videoEncoding: topEncoding,
    videoSimulcastLayers: layers.length > 0 ? layers : undefined,
  };
};
