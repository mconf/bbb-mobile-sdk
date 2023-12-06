import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addUploadedFile,
  editUploadedFile,
  removeUploadedFile,
  readyStateChanged,
  cleanupStaleData,
} from '../../../store/redux/slices/uploaded-file';

const UPLOADED_FILE_TOPIC = 'uploaded-file';

export class UploadedFileModule extends Module {
  constructor(messageSender) {
    super(UPLOADED_FILE_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  _add(msgObj) {
    console.log(msgObj);
    store.dispatch(
      addUploadedFile({
        uploadedFileObj: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  _remove() {
    if (!this._ignoreDeletions) {
      return store.dispatch(
        removeUploadedFile({
          uploadedFileObj: msgObj,
        })
      );
    }
    return false;
  }

  // eslint-disable-next-line class-methods-use-this
  _update(msgObj) {
    return store.dispatch(
      editUploadedFile({
        uploadedFileObj: msgObj,
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
