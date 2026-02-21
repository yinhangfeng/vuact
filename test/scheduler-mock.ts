import { queuePostFlushCb } from 'vue';
import { flushJobs, flushAll, flushEffectJobs } from 'vuact';

let yieldedValues: any[] | undefined;

export function unstable_yieldValue(value: any) {
  if (yieldedValues == null) {
    yieldedValues = [value];
  } else {
    yieldedValues.push(value);
  }
}

export function unstable_clearYields(): any[] {
  if (yieldedValues == null) {
    return [];
  }
  const values = yieldedValues;
  yieldedValues = undefined;
  return values;
}

export const unstable_flushAllWithoutAsserting = () => {
  flushAll();
  flushAll();
};
export const unstable_flushAll = () => {
  flushAll();
  flushAll();
};

export function unstable_flushUntilNextPaint() {
  flushJobs();
  queuePostFlushCb(flushEffectJobs);
}

export function unstable_scheduleCallback(priority: any, callback: any) {
  queuePostFlushCb(callback);
}

export function log() {}

export default {
  log,
  unstable_yieldValue,
  unstable_clearYields,
  unstable_flushAllWithoutAsserting,
  unstable_flushAll,
  unstable_flushUntilNextPaint,
  unstable_scheduleCallback,
};
