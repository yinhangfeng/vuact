import version from 'vuact-shared/src/ReactVersion';
import { Children } from './children';
import { createMutableSource } from './mutable-source';
import { createRef } from './create-ref';
import { Component, PureComponent } from './component';
import { createContext, createServerContext } from './context';
import { forwardRef } from './forward-ref';
import { lazy } from './lazy';
import { memo } from './memo';
import {
  useCallback,
  useContext,
  use,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useSyncExternalStore,
  useReducer,
  useRef,
  useState,
  useTransition,
  useDeferredValue,
  useId,
  getCacheForType,
  useCacheRefresh,
  useOptimistic,
  useActionState,
} from './hooks';
import { Fragment } from './fragment';
import { StrictMode } from './strict-mode';
import { Profiler } from './profiler';
import { Suspense, SuspenseList } from './suspense';
import {
  createElement,
  cloneElement,
  isValidElement,
  createFactory,
} from './element';
import { startTransition } from './transition';
import { act } from './act';
import { ReactSharedInternals } from './shared-internals';
import { captureOwnerStack } from './capture-owner-stack';

const vuactVersion =
  typeof __PACKAGE_VERSION__ !== 'undefined' ? __PACKAGE_VERSION__ : '0.0.0';

export {
  Children,
  createMutableSource,
  createRef,
  Component,
  PureComponent,
  createContext,
  createServerContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  use,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useSyncExternalStore,
  useReducer,
  useRef,
  useState,
  getCacheForType as unstable_getCacheForType,
  useCacheRefresh as unstable_useCacheRefresh,
  Fragment,
  Profiler,
  StrictMode,
  // unstable_DebugTracingMode,
  Suspense,
  createElement,
  cloneElement,
  isValidElement,
  version,
  vuactVersion,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // Deprecated behind disableCreateFactory
  createFactory,
  // Concurrent Mode
  useTransition,
  startTransition,
  useDeferredValue,
  useOptimistic,
  useActionState,
  SuspenseList,
  // unstable_LegacyHidden,
  // unstable_Offscreen,
  // unstable_getCacheSignal,
  // unstable_getCacheForType,
  // unstable_useCacheRefresh,
  // unstable_Cache,
  // // enableScopeAPI
  // unstable_Scope,
  // // enableTransitionTracing
  // unstable_TracingMarker,
  useId,
  act,
  act as unstable_act,
  captureOwnerStack,
};
