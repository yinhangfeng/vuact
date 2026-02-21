import { currentDispatcher } from './current-dispatcher';
import { currentRenderingInstance } from './render-context';

export const currentOwner = {
  get current() {
    return currentRenderingInstance ?? null;
  },
  // XXX react-cache 旧版会读取该字段
  get currentDispatcher() {
    return currentDispatcher.current;
  },
};
