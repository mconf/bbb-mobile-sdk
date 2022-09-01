import Module from './module';
import {
  addVideoStream,
  removeVideoStream,
  editVideoStream,
} from '../../../store/redux/slices/video-streams';
import { store } from '../../../store/redux/store';

const VIDEO_STREAMS_TOPIC = 'video-streams';

export class VideoStreamsModule extends Module {
  constructor(messageSender) {
    super(VIDEO_STREAMS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addVideoStream({
        videoStreamObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeVideoStream({
        videoStreamObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editVideoStream({
        videoStreamObject: msgObj,
      })
    );
  }
}
