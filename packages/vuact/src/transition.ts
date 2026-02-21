import type React from 'react';
import { isThenable } from './thenable';
import { reportGlobalError } from './utils/utils';

export let _isInTransition = false;
let runningCount = 0;
let transitionCallbacks: (() => void)[] = [];

function onTransitionFinish() {
  --runningCount;
  if (runningCount === 0) {
    const callbacks = transitionCallbacks;
    transitionCallbacks = [];
    for (const callback of callbacks) {
      callback();
    }
  }
}

function onTransitionError(error?: any) {
  onTransitionFinish();
}

export function startTransitionWithCallback(
  scope: React.TransitionFunction,
  callback?: (error?: any) => void
) {
  _isInTransition = true;
  ++runningCount;

  let _onTransitionFinish = onTransitionFinish;
  let _onTransitionError = onTransitionError;
  if (callback) {
    _onTransitionFinish = () => {
      transitionCallbacks.push(callback);
      onTransitionFinish();
    };
    _onTransitionError = (error: any) => {
      transitionCallbacks.push(() => {
        callback(error);
      });
      onTransitionError(error);
    };
  }

  try {
    const scopeResult = scope();
    _isInTransition = false;
    if (isThenable(scopeResult)) {
      scopeResult.then(_onTransitionFinish, _onTransitionError);
    } else {
      _onTransitionFinish();
    }
  } catch (err: any) {
    _isInTransition = false;
    _onTransitionError(err);
    if (!callback) {
      reportGlobalError(err);
    }
  }
}

export function startTransition(scope: React.TransitionFunction) {
  startTransitionWithCallback(scope);
}

export function isInTransition() {
  return _isInTransition;
}

export function getTransitionRunningCount() {
  return runningCount;
}

export function addTransitionEndCallback(callback: () => void) {
  if (runningCount > 0) {
    transitionCallbacks.push(callback);
    return true;
  }
  return false;
}

/**
 * 如果在 transition 中，则等待 transition 结束后执行，否则立即执行
 */
export function deferInTransition(func: () => void) {
  if (_isInTransition) {
    addTransitionEndCallback(func);
  } else {
    func();
  }
}
