import {
  nextTick,
  queuePostFlushCb,
  type ComponentInternalInstance,
} from 'vue';
import type { VuactInternalInstance } from './types';

export interface SchedulerJob extends Function {
  instance?: VuactInternalInstance;
  vInstance?: ComponentInternalInstance;
}

const RAF_TIMEOUT = 50;
const HAS_RAF = typeof requestAnimationFrame == 'function';

let nextFrameCallbacks: SchedulerJob[] = undefined as any;
if (__TEST_SCHEDULER__) {
  nextFrameCallbacks = [];
}

/**
 * Schedule a callback to be invoked after the browser has a chance to paint a new frame.
 * Do this by combining requestAnimationFrame (rAF) + setTimeout to invoke a callback after
 * the next browser frame.
 *
 * Also, schedule a timeout in parallel to the the rAF to ensure the callback is invoked
 * even if RAF doesn't fire (for example if the browser tab is not visible)
 */
export function scheduleEffectCallback(callback: () => void) {
  const job = () => {
    cancel();
    callback();
  };

  const cancel = () => {
    clearTimeout(timeout);
    if (raf != null) {
      cancelAnimationFrame(raf);
    }
    if (__TEST_SCHEDULER__) {
      const index = nextFrameCallbacks.indexOf(job);
      if (index >= 0) {
        nextFrameCallbacks.splice(index, 1);
      }
    }
  };

  const timeout = setTimeout(job, RAF_TIMEOUT);
  let raf: number | undefined;
  if (HAS_RAF) {
    raf = requestAnimationFrame(job);
  }

  if (__TEST_SCHEDULER__) {
    nextFrameCallbacks.push(job);
  }

  return cancel;
}

export function cancelEffectCallback(job: any) {
  job?.();
}

let vueFlushJobs: (() => void) | undefined;

/**
 * hack 获取 vue flushJobs 函数实例
 */
export function setupScheduler() {
  const queuePromise = nextTick();
  const originThen: any = queuePromise.then;
  queuePromise.then = (onfulfilled, onrejected) => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    vueFlushJobs = onfulfilled!;
    queuePromise.then = originThen;
    return originThen.call(queuePromise, onfulfilled, onrejected);
  };
  // @private queuePostFlushCb 会调用 queuePromise.then(flushJobs) 以此获取 flushJobs 函数
  queuePostFlushCb(() => {});

  if (typeof vueFlushJobs !== 'function') {
    throw new Error('[Vuact] failed to setup scheduler');
  }
}

export function flushJobs() {
  // render(null) 也可以达到 flushJobs 的效果?
  vueFlushJobs?.();
}

export function flushEffectJobs() {
  if (!nextFrameCallbacks) {
    return;
  }
  while (nextFrameCallbacks.length) {
    nextFrameCallbacks[0]();
  }
}

export function flushAll() {
  flushJobs();
  flushEffectJobs();
}
