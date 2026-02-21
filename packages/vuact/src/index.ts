import { nextTick } from 'vue';
import * as React from './react';
export * from './react';
export * from './react-to-vue';
export { reactToVue as r2v } from './react-to-vue';
export * from './vue-to-react';
export { vueToReact as v2r } from './vue-to-react';
export * from './symbols';
export { createBaseElement, cloneAndReplaceKey } from './element';
export { elementToVNode } from './element-to-vnode';
export { vNodeToElement } from './vnode-to-element';
export { isVuactComponentInstance } from './utils/vuact';
export { useRenderContext, provideRendereContext } from './render-context';
export { nextTick };
export { VuactSuspense } from './suspense';
export * from './scheduler';
export {
  type VuactConfig,
  globalConfig,
  useConfig,
  useConfigProvider,
} from './config';
export { setupRenderer } from './renderer';
export {
  isInTransition,
  getTransitionRunningCount,
  startTransitionWithCallback,
  addTransitionEndCallback,
  deferInTransition,
} from './transition';
export { provideContext, injectContext, VueContextProvider } from './context';
export { lazyReactToVue } from './lazy';
export * from './use-vue-effect-scope';
export { domComponentsRegistry } from './dom-components';
export type { ReactComponentRefType } from './types';

export default React;
