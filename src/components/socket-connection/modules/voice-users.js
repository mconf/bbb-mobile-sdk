import Module from './module';
import {
  addVoiceUser,
  removeVoiceUser,
  editVoiceUser,
} from '../../../store/redux/slices/voice-users';
import { store } from '../../../store/redux/store';

const VOICE_USERS_TOPIC = 'voiceUsers';

export class VoiceUsersModule extends Module {
  constructor(messageSender) {
    super(VOICE_USERS_TOPIC, messageSender);
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
}
