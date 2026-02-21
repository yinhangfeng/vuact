import { inject, provide, type InjectionKey } from 'vue';
import type { VuactInternalInstance } from './types';
import type { SchedulerJob } from './scheduler';

export let currentRenderingInstance: VuactInternalInstance | undefined;

export function getCurrentRenderingInstance() {
  return currentRenderingInstance;
}

export function setCurrentRenderingInstance(
  component: VuactInternalInstance | undefined
) {
  currentRenderingInstance = component;
}

export interface RenderContext {
  currentUpdateRootInstance?: VuactInternalInstance;
  beforeCommitQueue: SchedulerJob[];
  commitQueue: SchedulerJob[];
  currentUnmountRootInstance?: VuactInternalInstance;
  unmountQueue: SchedulerJob[];
}

const RenderInjectionKey: InjectionKey<RenderContext> = Symbol.for(
  'vuact.render-context'
);

export function createRenderContext() {
  return {
    beforeCommitQueue: [],
    commitQueue: [],
    unmountQueue: [],
  };
}

export function useRenderContext() {
  let context = inject(RenderInjectionKey, undefined);
  if (context == null) {
    context = createRenderContext();
    provide(RenderInjectionKey, context);
  }
  return context;
}

export function provideRendereContext() {
  const context = createRenderContext();
  provide(RenderInjectionKey, context);
  return context;
}
