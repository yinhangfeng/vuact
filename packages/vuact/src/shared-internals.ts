import { currentDispatcher } from './current-dispatcher';
import { currentOwner } from './current-owner';

export const ReactSharedInternals = {
  _$vuact: true,
  ReactCurrentDispatcher: currentDispatcher,
  // ReactCurrentBatchConfig,
  ReactCurrentOwner: currentOwner,
  ReactDebugCurrentFrame: {
    setExtraStackFrame() {},
    getStackAddendum() {
      return '';
    },
  },
};
