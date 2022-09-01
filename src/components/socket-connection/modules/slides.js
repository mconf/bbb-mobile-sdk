import Module from './module';
import { store } from '../../../store/redux/store';
import {
  addSlide,
  removeSlide,
  editSlide,
} from '../../../store/redux/slices/slides';

const SLIDES_TOPIC = 'slides';

export class SlidesModule extends Module{
  constructor(messageSender) {
    super(SLIDES_TOPIC, messageSender);
  }

  // eslint-disable-next-line class-methods-use-this
  add(msgObj) {
    return store.dispatch(
      addSlide({
        slideObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  remove(msgObj) {
    return store.dispatch(
      removeSlide({
        slideObject: msgObj,
      })
    );
  }

  // eslint-disable-next-line class-methods-use-this
  update(msgObj) {
    return store.dispatch(
      editSlide({
        slideObject: msgObj,
      })
    );
  }
}
