import {
  addExternalVideoMeeting,
  removeExternalVideoMeeting,
  editExternalVideoMeeting,
} from '../../../store/redux/external-video-meetings';
import { store } from '../../../store/redux/store';

const externalVideoMeetingsTopic = 'external-video-meetings';

export class ExternalVideoMeetingsModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(externalVideoMeetingsTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(externalVideoMeetingsTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
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

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
