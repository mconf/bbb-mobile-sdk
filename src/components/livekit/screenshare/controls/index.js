import {
  RoomContext,
  useLocalParticipant,
  useTracks
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import useDebounce from '../../../../hooks/use-debounce';
import { liveKitRoom } from '../../../../services/livekit';
import logger from '../../../../services/logger';
import {
  setCurrentUserScreenshare,
  setIsConnected,
  setIsConnecting,
} from '../../../../store/redux/slices/wide-app/screenshare';
import Styled from '../../../screenshare/screenshare-controls/styles';

const LKScreenshareControls = ({
  disabled,
  isConnecting,
  fireDisabledScreenshareAlert,
  fireBetaWarning,
  fireIosWarning,
  handleScreensharePublishError,
  isPresenter,
}) => {
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.ScreenShare]);
  const dispatch = useDispatch();
  const isActive = localParticipant.isScreenShareEnabled || isConnecting;
  const constraints = { video: true };

  const publishScreenshare = useCallback(async () => {
    const newScreenshareId = `${localParticipant.identity}_app_${Date.now()}`;
    const publishOptions = {
      videoCodec: 'vp8',
      simulcast: true,
      source: Track.Source.ScreenShare,
      name: `${localParticipant.identity}-screenshare-video`
    }

    try {
      if (localParticipant.isScreenShareEnabled) await unpublishScreenshare();

      dispatch(setIsConnecting(true));
      const localPub = await localParticipant.setScreenShareEnabled(true, constraints, publishOptions)

      if (!localPub) throw new Error('Local track publication failed');

      dispatch(setLocalScreeenshareId(newScreenshareId));
      dispatch(setIsConnected(true));
    } catch (error) {
      handleScreensharePublishError(error, publishScreenshare);
    } finally {
      dispatch(setIsConnecting(false));
      dispatch(setCurrentUserScreenshare(true));
    }
  }, [
    localParticipant,
    unpublishScreenshare,
    handleScreensharePublishError,
  ]);

  const unpublishScreenshare = useCallback(async () => {
    dispatch(setCurrentUserScreenshare(false));
    const publications = tracks.map((trackReference) => trackReference.publication);
    const localPublications = publications.filter(publication => publication?.isLocal)
    const handleUnpublishError = (error) => {
      logger.error({
        logCode: 'livekit_screenshare_unpublish_error',
        extraInfo: {
          errorMessage: error.message,
          errorStack: error.stack,
        },
      }, `LiveKit: screenshare unpublish error ${error.message}`);
    };

    try {
      await Promise.all(localPublications
        .map((publication) => localParticipant.unpublishTrack(publication?.track)
          .then((trackPublication) => {
            logger.info({
              logCode: 'livekit_screenshare_unpublished',
              extraInfo: { screenshareId: trackPublication.trackName },
            }, `LiveKit: Screenshare unpublished ${trackPublication.trackName}`);
            return trackPublication;
          })
          .catch(handleUnpublishError)
          .finally(() => {
            // keep this?
          })));
    } catch (error) {
      handleUnpublishError(error);
    } finally {
      if (localParticipant.isScreenShareEnabled) {
        await localParticipant.setScreenShareEnabled(false);
      };
      dispatch(setLocalScreeenshareId(null));
      dispatch(setIsConnected(false));
    }
  }, [localParticipant, tracks]);

  const onButtonPress = useDebounce(useCallback(() => {
    if (!disabled) {
      if (isActive) {
        unpublishScreenshare();
      } else {
        if (Platform.OS !== 'android') {
          fireIosWarning()
          return
        };
        fireBetaWarning(() => publishScreenshare());
      }
    } else {
      fireDisabledScreenshareAlert();
    }
  }, [disabled, isActive, publishScreenshare, unpublishScreenshare, fireBetaWarning, fireIosWarning]), 1000);

  return (
    <Styled.ScreenshareButton
      isActive={isActive}
      onPress={onButtonPress}
      isConnecting={isConnecting}
      isPresenter={isPresenter}
    />
  );
};

const LKScreenshareControlsContainer = (props) => {
  return (
    <RoomContext.Provider value={liveKitRoom}>
      <LKScreenshareControls {...props} />
    </RoomContext.Provider>
  );
};

export default LKScreenshareControlsContainer;
