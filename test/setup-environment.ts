const NODE_ENV = process.env.NODE_ENV;
global.__DEV__ = NODE_ENV === 'development';
global.__EXTENSION__ = false;
global.__TEST__ = NODE_ENV === 'test';
global.__PROFILE__ = NODE_ENV === 'development';
global.__UMD__ = false;
global.__TEST_SCHEDULER__ = true;
global.__EXPERIMENTAL__ = false;

global.__VARIANT__ = !!process.env.VARIANT;

global.__VUACT_SKIP_TEST__ = process.env.__VUACT_SKIP_TEST__ !== 'false';
global.__VUACT_SKIP_TEST2__ =
  (process.env.__VUACT_SKIP_TEST2__ ?? process.env.__VUACT_SKIP_TEST__) !==
  'false';

if (typeof window !== 'undefined') {
  (global as any).requestIdleCallback = function (callback: any) {
    return setTimeout(() => {
      callback({
        timeRemaining() {
          return Infinity;
        },
      });
    });
  };

  global.cancelIdleCallback = function (callbackID) {
    clearTimeout(callbackID);
  };
}
