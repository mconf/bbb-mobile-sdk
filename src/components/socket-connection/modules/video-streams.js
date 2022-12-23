import Module from './module';
import {
  addVideoStream,
  removeVideoStream,
  editVideoStream,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/video-streams';
import { store } from '../../../store/redux/store';

const VIDEO_STREAMS_TOPIC = 'video-streams';

export class VideoStreamsModule extends Module {
  constructor(messageSender) {
    super(VIDEO_STREAMS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addVideoStream({
        videoStreamObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeVideoStream({
          videoStreamObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editVideoStream({
        videoStreamObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }

  // eslint-disable-next-line class-methods-use-this
  _cleanupStaleData(subscriptionId) {
    return store.dispatch(cleanupStaleData(subscriptionId));
  }
}
