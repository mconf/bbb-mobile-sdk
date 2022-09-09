import Module from './module';
import {
  addVoiceCallState,
  removeVoiceCallState,
  editVoiceCallState,
} from '../../../store/redux/slices/voice-call-states';
import { store } from '../../../store/redux/store';

const VOICE_CALL_STATES_TOPIC = 'voice-call-states';

export class VoiceCallStatesModule extends Module {
  constructor(messageSender) {
    super(VOICE_CALL_STATES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    console.log("QUE... de la mancha", msgObj);
    return store.dispatch(
      addVoiceCallState({
        voiceCallStateObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeVoiceCallState({
        voiceCallStateObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editVoiceCallState({
        voiceCallStateObject: msgObj,
      })
    );
  }
}
