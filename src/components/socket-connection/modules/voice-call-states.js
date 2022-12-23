import Module from './module';
import {
  addVoiceCallState,
  removeVoiceCallState,
  editVoiceCallState,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/voice-call-states';
import { store } from '../../../store/redux/store';

const VOICE_CALL_STATES_TOPIC = 'voice-call-states';

export class VoiceCallStatesModule extends Module {
  constructor(messageSender) {
    super(VOICE_CALL_STATES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    return store.dispatch(
      addVoiceCallState({
        voiceCallStateObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeVoiceCallState({
          voiceCallStateObject: msgObj,
        })
      );
    }

    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editVoiceCallState({
        voiceCallStateObject: msgObj,
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
