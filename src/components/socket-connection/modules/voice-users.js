import Module from './module';
import {
  addVoiceUser,
  removeVoiceUser,
  editVoiceUser,
  readyStateChanged,
} from '../../../store/redux/slices/voice-users';
import { store } from '../../../store/redux/store';

const VOICE_USERS_TOPIC = 'voiceUsers';

export class VoiceUsersModule extends Module {
  constructor(messageSender) {
    super(VOICE_USERS_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addVoiceUser({
        voiceUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeVoiceUser({
          voiceUserObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editVoiceUser({
        voiceUserObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _subscriptionStateChanged(newState) {
    return store.dispatch(readyStateChanged(newState));
  }
}
