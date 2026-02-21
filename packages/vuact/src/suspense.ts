import {
  createVNode,
  defineComponent,
  KeepAlive,
  onErrorCaptured,
  shallowRef,
  type PropType,
  type ComponentInternalInstance,
  queuePostFlushCb,
  type ComponentPublicInstance,
} from 'vue';
import type React from 'react';
import { REACT_SUSPENSE_TYPE } from './symbols';
import { vueToReact } from './vue-to-react';
import { isThenable } from './thenable';
import { useConfig } from './config';
import { useRenderContext } from './render-context';
import { elementToVNode } from './element-to-vnode';
import type {
  ThenableErrorExtra,
  VuactComponentInternalInstance,
} from './types';
import { Fragment } from './fragment';

const VSuspense = defineComponent({
  name: 'Suspense',
  $$typeof: REACT_SUSPENSE_TYPE,
  props: {
    fallback: {
      type: null as any as PropType<any>,
    },
    suspenseCallback: {
      type: Function,
    },
    /**
     * root 使用的 Suspense，suspense 时渲染内容保持不变
     */
    noFallback: {
      type: Boolean,
    },
  },
  setup(props, { slots }) {
    const renderContext = useRenderContext();
    const config = useConfig();
    const suspended = shallowRef(false);
    const thenableSet = new Set<any>();
    let finishCallbacks: (() => void)[] = [];

    function onError(error: any, instance?: ComponentPublicInstance | null) {
      if (!isThenable(error)) {
        return;
      }

      thenableSet.add(error);
      if (thenableSet.size === 1) {
        queuePostFlushCb(() => {
          if (thenableSet.size) {
            suspended.value = true;
          }
        });
        // 同步设置会导致首次出错时的 keepalive 无法缓存
        // suspended.value = true;
        if (props.suspenseCallback) {
          props.suspenseCallback(thenableSet);
        }
      }

      const errorInstance =
        (error as ThenableErrorExtra)._$vInstance ??
        (instance?.$ as VuactComponentInternalInstance);
      if (errorInstance) {
        let updateInstance: ComponentInternalInstance | null = errorInstance;
        if (errorInstance._$shouldDestroy) {
          updateInstance = errorInstance.parent;
        }
        const internalInstance = (
          updateInstance as VuactComponentInternalInstance
        )?._$vuactInternalInstance;
        const forceUpdate = (updateInstance as any)?._$forceUpdate;
        if (internalInstance || forceUpdate || errorInstance._$shouldDestroy) {
          finishCallbacks.push(() => {
            if (errorInstance._$shouldDestroy) {
              errorInstance.vnode.key = Symbol();
            }

            if (internalInstance) {
              internalInstance.dirty = true;
              internalInstance.force = true;
              internalInstance.enqueueUpdate();
            } else if (forceUpdate) {
              forceUpdate();
            }
          });
        }
      }

      const onFinish = () => {
        thenableSet.delete(error);
        if (thenableSet.size === 0) {
          // TODO 暂停的组件计数？ 一个组件的 error 只使用最后一次的，组件状态：最后一次渲染的错误，如果错误为空或者 thenable error 结束则认为改组件 suspense 结束
          suspended.value = false;

          const callbacks = finishCallbacks;
          finishCallbacks = [];
          for (const callback of callbacks) {
            callback();
          }
        }
      };

      error.then(onFinish, onFinish);
      return false;
    }

    onErrorCaptured(onError);
    return () => {
      if (props.noFallback) {
        // 在 VuactRootComponent 中使用
        suspended.value;
        try {
          const res = slots.default?.();
          if (Array.isArray(res) && res.length === 1) {
            return res[0];
          }
          return res;
        } catch (err) {
          // elementToVnode 中 resolveThenable 发生错误
          if (onError(err) !== false) {
            throw err;
          }
        }
      }
      return [
        createVNode(
          KeepAlive,
          null,
          suspended.value
            ? undefined
            : () => createVNode(KeepAliveRoot, null, slots.default)
        ),
        suspended.value
          ? elementToVNode(props.fallback, renderContext, config)
          : undefined,
      ];
    };
  },
});

const Suspense = vueToReact(VSuspense) as typeof React.Suspense;

const KeepAliveRoot = defineComponent({
  name: 'KeepAliveRoot',
  setup(_, { slots }) {
    return () => {
      // TODO elementToVnode 中 resolveThenable 发生错误处理
      return slots.default?.();
    };
  },
});

// TODO
const SuspenseList = Fragment; //as typeof React.SuspenseList;

/**
 * 可以 vue 中使用的 React Suspense
 */
const VuactSuspense = VSuspense;

export { VuactSuspense, Suspense, SuspenseList };
