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
  add(msgObj) {
    return store.dispatch(
      addExternalVideoMeeting({
        externalVideoMeetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeExternalVideoMeeting({
        externalVideoMeetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editExternalVideoMeeting({
        externalVideoMeetingObject: msgObj,
      })
    );
  }
}
