import { getRandomAlphanumericWithCaps } from "../utils";
import Module from '../modules/module';
import { store } from '../../../store/redux/store';

export class StreamExternalVideoModule extends Module {
  constructor(messageSender) {
    super('stream-external-videos-meetingId', messageSender);
  }

  subscribeToCollection() {
    const meetingId = (store.getState().client.meetingData.meetingID);
    this.messageSender.sendMessage({
      msg: 'sub',
      id: getRandomAlphanumericWithCaps(17),
      name: `stream-external-videos-${meetingId}`,
      params: ['play',
        {
          useCollection: false,
          args: []
        }
      ],
    });
    this.messageSender.sendMessage({
      msg: 'sub',
      id: getRandomAlphanumericWithCaps(17),
      name: `stream-external-videos-${meetingId}`,
      params: ['stop',
        {
          useCollection: false,
          args: []
        }
      ],
    });
    this.messageSender.sendMessage({
      msg: 'sub',
      id: getRandomAlphanumericWithCaps(17),
      name: `stream-external-videos-${meetingId}`,
      params: ['presenterReady',
        {
          useCollection: false,
          args: []
        }
      ],
    });
    this.messageSender.sendMessage({
      msg: 'sub',
      id: getRandomAlphanumericWithCaps(17),
      name: `stream-external-videos-${meetingId}`,
      params: ['playerUpdate',
        {
          useCollection: false,
          args: []
        }
      ],
    });
  }

  // TODO FIX THIS
  onConnected() {
    this.subscribeToCollection();
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
  }

  // eslint-disable-next-line class-methods-use-this
  _remove(msgObj) {
    if (!this._ignoreDeletions) {
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
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

