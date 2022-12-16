import Module from './module';
import {
  addExternalVideoMeeting,
  removeExternalVideoMeeting,
  editExternalVideoMeeting,
} from '../../../store/redux/slices/external-video-meetings';
import { store } from '../../../store/redux/store';

const EXTERNAL_VIDEO_TOPIC = 'external-video-meetings';

export class ExternalVideoMeetingsModule extends Module {
  constructor(messageSender) {
    super(EXTERNAL_VIDEO_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addExternalVideoMeeting({
        externalVideoMeetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeExternalVideoMeeting({
          externalVideoMeetingObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editExternalVideoMeeting({
        externalVideoMeetingObject: msgObj,
      })
    );
  }
}
