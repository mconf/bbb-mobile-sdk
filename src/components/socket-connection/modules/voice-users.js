import {
  addVoiceUser,
  removeVoiceUser,
  editVoiceUser,
} from '../../../store/redux/slices/voice-users';
import { store } from '../../../store/redux/store';

const voiceUsersTopic = 'voiceUsers';

export class VoiceUsersModule {
  constructor(messageSender) {
    this.messageSender = messageSender;
    this.subId = null;
  }

  onConnected() {
    this.subId = this.messageSender.subscribeMsg(voiceUsersTopic);
  }

  onDisconnected() {
    this.messageSender.unsubscribeMsg(voiceUsersTopic, this.subId);
  }

  // eslint-disable-next-line class-methods-use-this
  onDisconnectedBeforeWebsocketClose() {
    // TODO
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addVoiceUser({
        voiceUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeVoiceUser({
        voiceUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editVoiceUser({
        voiceUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  processMessage() {
    // TODO
  }
}
