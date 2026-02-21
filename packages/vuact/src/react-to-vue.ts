import {
  callWithErrorHandling,
  computed,
  createVNode,
  defineComponent,
  ErrorCodes,
  getCurrentInstance,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onErrorCaptured,
  onMounted,
  onUpdated,
  ReactiveEffect,
  shallowRef,
  triggerRef,
  Fragment as VFragment,
} from 'vue';
import { isReactClassComponent } from './utils/react';
import { isContext, useGlobalContext } from './context';
import type {
  VuactComponentClass,
  VuactComponentInternalInstance,
  VuactElement,
  VuactFunctionComponent,
  ToVuactDefineComponent,
  ThenableErrorExtra,
  VuactInternalClassInstance,
  VuactInternalFunctionInstance,
} from './types';
import {
  componentToElement,
  type SlotTransformConfig,
} from './vnode-to-element';
import { elementToVNode } from './element-to-vnode';
import {
  useRenderContext,
  currentRenderingInstance,
  setCurrentRenderingInstance,
} from './render-context';
import { setupClassInternalInstance } from './class-internal-instance';
import { setupFunctionInternalInstance } from './function-internal-instance';
import { fixExternalDomModification } from './fix-external-dom-modification';
import { useConfig as _useConfig, type VuactConfig } from './config';
import { EMPTY_OBJ } from './constants';
import { isThenable } from './thenable';

export interface ReactToVueOptions {
  useConfig?: () => VuactConfig;
  slotsTransformConfig?: Record<string, SlotTransformConfig>;
}

/**
 * react 组件转为 vue 组件
 */
export function reactToVue<
  C extends VuactFunctionComponent<any> | VuactComponentClass<any>,
>(componentType: C, options?: ReactToVueOptions): ToVuactDefineComponent<C> {
  if (!options) {
    if (componentType._$vue_component) {
      return componentType._$vue_component;
    }
    options = EMPTY_OBJ as ReactToVueOptions;
  }

  const isClassComponent = isReactClassComponent(componentType);
  const setupInternalInstance = isClassComponent
    ? setupClassInternalInstance
    : setupFunctionInternalInstance;
  const useConfig = options.useConfig ?? _useConfig;

  const component = defineComponent({
    name: componentType.displayName ?? componentType.name,
    inheritAttrs: false,
    setup(_, { attrs, slots, expose }) {
      const vInstance: VuactComponentInternalInstance = getCurrentInstance();
      const renderContext = useRenderContext();
      const config = useConfig();

      const updateRef = shallowRef(0);
      function enqueueUpdate() {
        const effect = vInstance.effect;
        if (
          effect &&
          !effect.dirty &&
          currentRenderingInstance !== internalInstance
        ) {
          triggerRef(updateRef);
          // effect.trigger();
        }
      }

      // attrs 中 有 $element 说明是 react 调用
      const hasElementProp = '$element' in vInstance.attrs;

      const renderEffect = new ReactiveEffect(render);
      // @private 依赖 vue 3.5+  ReactiveEffect 是内部 api 可能会变?
      renderEffect.scheduler = enqueueUpdate;

      const internalInstance = {
        componentType,
        enqueueUpdate: enqueueUpdate,
        dirty: true,
        mounted: false,
        vInstance: vInstance,
        globalContext: useGlobalContext(),
        renderEffect,
        renderContext,
      } as VuactInternalClassInstance & VuactInternalFunctionInstance;
      vInstance._$vuactInternalInstance = internalInstance;
      let lastRenderError = false;

      if (isContext(componentType.contextType)) {
        internalInstance.contextRef =
          internalInstance.globalContext.providers[
            componentType.contextType._id
          ] ?? componentType.contextType._defaultValueProvider;
      } else if (componentType.contextTypes) {
        internalInstance.contextRef = computed(() => {
          const context = internalInstance.globalContext.context?.value;
          const componentContext: Record<string, any> = {};
          if (context) {
            for (const key of Object.keys(componentType.contextTypes)) {
              componentContext[key] = context[key];
            }
          }
          return componentContext;
        });
      } else {
        internalInstance.contextRef = { value: {} };
      }

      setupInternalInstance(internalInstance);

      // elementRef 触发计算的时机
      // 1. attrs 改变
      // 2. 被 immediate slot trigger
      // TODO 有可能组件没有传 props，但 slots 变了，此时 elementRef 不会重新计算
      const elementRef = computed(() => {
        // 存在 $element 代表组件由 react 调用
        let element = attrs.$element as VuactElement;
        if (!element) {
          // 使用 vueInstance.attrs 不使用 attrsProxy 避免不必要的 track 开销
          // 已经调用过 attrs.$element，attrs 的任何改变都会导致 computed 重新计算，所以这里可以不需要使用 attrsProxy
          element = componentToElement(
            componentType,
            vInstance.attrs,
            slots,
            internalInstance.imperativeHandleRef,
            options.slotsTransformConfig
          );
        }

        return element;
      });

      // 构造函数报错(比如 Lazy)会导致当前 vue 组件没有 render 函数，报出不符合预期的 warning，所以放到 beforeMount 中 throw
      let initError: any;
      if (isClassComponent) {
        try {
          internalInstance.init!(elementRef.value);
        } catch (err) {
          // 组件初始化失败，标记组件无效，如果存在 Suspense active 时需要重新初始化
          initError = err;
          onError(err, true);
        }
      }

      function beforeUpdate() {
        internalInstance.renderSkipped = false;
        internalInstance.beforeUpdate(elementRef.value);
        internalInstance.force = false;
      }

      function render() {
        // 在 render 内 track 的 reactive 会在更新时跳过 shouldComponentUpdate
        // track context
        // 按 react 规范，provider context 改变需要跳过 scu，所以放在这里 track
        if (componentType.contextType) {
          internalInstance.contextRef.value;
        }
        return internalInstance.render();
      }

      function syncUpdated() {
        internalInstance.updated(true);
        renderContext.commitQueue.push(commit);
      }

      function asyncUpdated() {
        if (!lastRenderError) {
          internalInstance.updated(false);
          commit();
        }
      }

      function commit() {
        internalInstance.mounted = true;
        internalInstance.commit();
      }
      commit.instance = internalInstance;
      commit.vInstance = vInstance;

      function unmount() {
        internalInstance.beforeUnmount();
        internalInstance.mounted = false;
        internalInstance.element = undefined;

        // if (!renderContext.currentUnmountRootInstance) {
        //   renderContext.currentUnmountRootInstance = internalInstance;
        // }
        // try {
        //   internalInstance.beforeUnmount();
        //   internalInstance.mounted = false;
        //   internalInstance.element = undefined;

        //   if (renderContext.currentUnmountRootInstance === internalInstance) {
        //     renderContext.currentUnmountRootInstance = undefined;

        //     const unmountQueue = renderContext.unmountQueue;
        //     if (unmountQueue.length) {
        //       renderContext.unmountQueue = [];
        //       for (const job of unmountQueue) {
        //         callWithErrorHandling(
        //           job,
        //           job.vInstance,
        //           ErrorCodes.RENDER_FUNCTION
        //         );
        //       }
        //     }
        //   }
        // } finally {
        //   if (renderContext.currentUnmountRootInstance === internalInstance) {
        //     renderContext.currentUnmountRootInstance = undefined;
        //     renderContext.unmountQueue.length = 0;
        //   }
        // }
      }

      /**
       * @returns 该错误是否有可能恢复
       */
      function onError(error: any, destroy: boolean) {
        vInstance._$shouldDestroy = destroy;
        if (isThenable(error)) {
          (error as ThenableErrorExtra)._$vInstance = vInstance;
          return !destroy;
        }
        return false;
      }

      if (config.isSSR) {
        if (initError !== undefined) {
          throw initError;
        }
        beforeUpdate();
      } else {
        if (initError !== undefined) {
          onBeforeMount(() => {
            throw initError;
          });

          return () => {};
        }

        onBeforeMount(beforeUpdate);
      }

      onBeforeUpdate(beforeUpdate);
      onBeforeUnmount(unmount);
      if (internalInstance.errorCaptured) {
        onErrorCaptured(internalInstance.errorCaptured);
      }

      if (config.enableSyncUpdated) {
        Object.defineProperty(vInstance, 'effect', {
          configurable: true,
          set(effect: ReactiveEffect) {
            // 在 compoinentUpdateFn 执行结束时同步执行 updated 代替 onMounted onUpdated
            // @private vInstance.effect effect.fn 为内部 api，可能有兼容性问题
            const originComponentUpdateFn = effect.fn;
            effect.fn = function vuactComponentUpdateFn() {
              if (!renderContext.currentUpdateRootInstance) {
                renderContext.currentUpdateRootInstance = internalInstance;
              }
              try {
                originComponentUpdateFn();
                if (!lastRenderError) {
                  syncUpdated();
                  if (
                    renderContext.currentUpdateRootInstance === internalInstance
                  ) {
                    renderContext.currentUpdateRootInstance = undefined;
                    const beforeCommitQueue = renderContext.beforeCommitQueue;
                    if (beforeCommitQueue.length) {
                      renderContext.beforeCommitQueue = [];
                      for (const job of beforeCommitQueue) {
                        callWithErrorHandling(
                          job,
                          job.vInstance,
                          ErrorCodes.RENDER_FUNCTION
                        );
                      }
                    }

                    const commitQueue = renderContext.commitQueue;
                    if (commitQueue.length) {
                      renderContext.commitQueue = [];
                      for (const job of commitQueue) {
                        callWithErrorHandling(
                          job,
                          job.vInstance,
                          ErrorCodes.RENDER_FUNCTION
                        );
                      }
                    }
                  }
                }
              } finally {
                if (
                  renderContext.currentUpdateRootInstance === internalInstance
                ) {
                  renderContext.currentUpdateRootInstance = undefined;
                  renderContext.beforeCommitQueue.length = 0;
                  renderContext.commitQueue.length = 0;
                }
              }
            };
            Object.defineProperty(vInstance, 'effect', {
              configurable: true,
              writable: true,
              value: effect,
            });
          },
        });
        commit.instance = internalInstance;
        commit.vInstance = vInstance;
      } else {
        onMounted(asyncUpdated);
        // XXX onUpdated 是异步的，在 child.setState parent.setState 时会出现 child.render1 parnet.render1 child.render2 child.updated1 child.updated2
        onUpdated(asyncUpdated);
      }

      const exposed = isClassComponent
        ? {
            instance: (internalInstance as VuactInternalClassInstance)
              .publicInstance,
            internalInstance,
          }
        : {
            get instance() {
              return internalInstance.imperativeHandle;
            },
            internalInstance,
          };
      expose(exposed);

      return () => {
        updateRef.value;
        lastRenderError = false;
        // track immediate slot trigger
        if (!hasElementProp) {
          elementRef.value;
        }

        internalInstance.beforeRender?.();

        if (internalInstance.renderSkipped) {
          internalInstance.skipRender?.();
          internalInstance.dirty = false;
          // shouldComponentUpdate 为 false 的情况
          // 返回之前的 renderResult 可以让 vue 组件不更新
          return vInstance.subTree;
        }

        setCurrentRenderingInstance(internalInstance);
        let result: any;
        try {
          result = elementToVNode(renderEffect.run(), renderContext, config);
        } catch (err) {
          lastRenderError = true;
          internalInstance.renderError();
          // subTree 为空代表首次渲染，首次渲染失败直接丢弃
          if (onError(err, vInstance.subTree == null)) {
            callWithErrorHandling(
              () => {
                throw err;
              },
              vInstance,
              ErrorCodes.RENDER_FUNCTION
            );
            // 对于 thenable 错误有可能被 suspense 恢复，只需要丢弃本次渲染结果，仍旧返回上次的 subTree
            return vInstance.subTree;
          }
          throw err;
        } finally {
          setCurrentRenderingInstance(undefined);
        }

        internalInstance.afterRender();

        if (Array.isArray(result)) {
          // vue 内部 normalizeVNode 对 render 返回数组的情况会包裹 Fragment，直接在外部处理可以避免不必要的数组拷贝
          result = createVNode(VFragment, null, result);
        }

        if (config.fixExternalDomModification) {
          fixExternalDomModification(vInstance, result);
        }

        // TODO vue render 从返回 A 变为 [A, B] 或者 [A, B] 变为 A 时，会触发 A 的 unmount 再 mount
        // 因为 normalizeVNode 中对 array 会包裹一层 Fragment
        // 可以统一返回 array 解决该问题，但是会导致多一层 Fragment
        return result;
      };
    },
  }) as any;
  component._$origin_react_component = componentType;
  if (options === EMPTY_OBJ) {
    componentType._$vue_component = component;
  }
  return component;
}
