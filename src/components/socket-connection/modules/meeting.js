import {
  addMeeting,
  removeMeeting,
  editMeeting,
} from '../../../store/redux/meeting';
import { store } from '../../../store/redux/store';

const meetingTopic = 'meetings';

export class MeetingModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(meetingTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(meetingTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addMeeting({
        meetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeMeeting({
        meetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editMeeting({
        meetingObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
