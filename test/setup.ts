import { expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { flushAll } from 'vuact';
import 'vuact/setup-scheduler';
import 'vuact/setup-renderer';
import 'vuact-dom/register-dom-components';
import RectNoop from 'react-noop-renderer';
import reactTestMatchers from './matchers/reactTestMatchers.js';
import toThrow from './matchers/toThrow.js';
import toWarnDev from './matchers/toWarnDev.js';
import { getTestFlags } from './test-flags.js';
import Scheduler from './scheduler-mock.js';

const spyOn = vi.spyOn;
const noop = function () {};

global.spyOn = function () {
  throw new Error(
    'Do not use spyOn(). ' +
      'It can accidentally hide unexpected errors in production builds. ' +
      'Use spyOnDev(), spyOnProd(), or spyOnDevAndProd() instead.'
  );
};

if (process.env.NODE_ENV === 'production') {
  global.spyOnDev = noop;
  global.spyOnProd = spyOn;
  global.spyOnDevAndProd = spyOn;
} else {
  global.spyOnDev = spyOn;
  global.spyOnProd = noop;
  global.spyOnDevAndProd = spyOn;
}

expect.extend({
  ...reactTestMatchers,
  ...toThrow,
  ...toWarnDev,
});

// beforeAll(() => {});

// afterAll(() => {});

beforeEach(() => {
  vi.resetModules();
  RectNoop._reset();
  Scheduler.unstable_clearYields();
});

afterEach(() => {
  Scheduler.unstable_clearYields();
});

global.jest = {
  resetModuleRegistry: vi.resetModules,
  ...vi,
};

global.xit = (...args: any[]) => {
  return it.skip(...args);
};

global.xdescribe = (...args: any[]) => {
  return it.skip(...args);
};

global.gate = (fn) => {
  const flags = getTestFlags();
  if (typeof fn === 'function') {
    return fn(flags);
  }
  return flags[fn];
};

global.nextTick = nextTick;
global.flushAll = flushAll;
