import type { VuactComponent } from './types';

export class UpdateQueue {
  isMounted(publicInstance: VuactComponent<any, any, any>) {
    return publicInstance?.isMounted ?? false;
  }

  enqueueForceUpdate(
    publicInstance: VuactComponent<any, any, any>,
    callback?: () => void,
    callerName?: string
  ) {
    publicInstance?.forceUpdate(callback);
  }

  enqueueReplaceState(
    publicInstance: VuactComponent<any, any, any>,
    completeState: any,
    callback?: () => void,
    callerName?: string
  ) {
    publicInstance?.replaceState(completeState, callback);
  }

  enqueueSetState(
    publicInstance: VuactComponent<any, any, any>,
    partialState: any,
    callback?: () => void,
    callerName?: string
  ) {
    publicInstance?.setState(partialState, callback);
  }
}

export const updateQueue = new UpdateQueue();
