import Module from './module';
import {
  addRecordMeeting,
  removeRecordMeeting,
  editRecordMeeting,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/record-meetings';
import { store } from '../../../store/redux/store';

const RECORD_MEETING_TOPIC = 'record-meetings';

export class RecordMeetingsModule extends Module {
  constructor(messageSender) {
    super(RECORD_MEETING_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addRecordMeeting({
        meetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeRecordMeeting({
          meetingObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editRecordMeeting({
        meetingObject: msgObj,
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
