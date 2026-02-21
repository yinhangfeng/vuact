import type ReactDOM from 'react-dom';
import { flushAll, flushJobs } from 'vuact';
import version from 'vuact-shared/src/ReactVersion';
import type { PreloadOptions } from 'react-dom';
import { createRoot, hydrateRoot } from './root';
import { createPortal } from './portal';
import { findDOMNode } from './find-dom-node';
import { render, hydrate, unmountComponentAtNode } from './render';
import { Internals } from './internals';
import { useFormStatus } from './components/form/use-form-status';

const flushSync: typeof ReactDOM.flushSync = function flushSync<R>(
  fn?: () => R
): R {
  const result = fn?.();
  flushAll();
  return result!;
};

const unstable_batchedUpdates: typeof ReactDOM.unstable_batchedUpdates =
  function unstable_batchedUpdates(callback: any, arg?: any) {
    const result = callback(arg);
    // TODO react19 batchedUpdates 没有实际作用
    flushJobs();
    return result;
  };

const prefetchDNS: typeof ReactDOM.prefetchDNS = function prefetchDNS(
  href: string
) {
  // TODO
};

const preconnect: typeof ReactDOM.preconnect = function preconnect(
  href: string,
  options?: ReactDOM.PreconnectOptions
) {
  // TODO
};

const preload: typeof ReactDOM.preload = function preload(
  href: string,
  options?: PreloadOptions
) {
  // TODO
};

const preloadModule: typeof ReactDOM.preloadModule = function preloadModule() {
  // TODO
};

const preinit: typeof ReactDOM.preinit = function preinit() {
  // TODO
};

const preinitModule: typeof ReactDOM.preinitModule = function preinitModule() {
  // TODO
};

const requestFormReset: typeof ReactDOM.requestFormReset =
  function requestFormReset() {
    // TODO
  };

function unstable_createEventHandle() {
  return null;
}

export {
  Internals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createPortal,
  createRoot,
  hydrateRoot,
  findDOMNode,
  flushSync,
  hydrate,
  render,
  unmountComponentAtNode,
  prefetchDNS,
  preconnect,
  preload,
  preloadModule,
  preinit,
  preinitModule,
  requestFormReset,
  unstable_batchedUpdates,
  unstable_createEventHandle,
  useFormStatus,
  version,
};
