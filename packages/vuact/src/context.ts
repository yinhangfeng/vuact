import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  provide,
  toRef,
  watch,
  type InjectionKey,
  type MaybeRefOrGetter,
  type PropType,
  type Ref,
  type ShallowRef,
} from 'vue';
import type { Context } from 'react';
import type {
  VuactComponent,
  VuactComponentInternalInstance,
  VuactContext,
} from './types';
import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE } from './symbols';
import { vueToReact } from './vue-to-react';
import { currentRenderingInstance } from './render-context';

export interface GlobalContext {
  // legacy context
  context?: ShallowRef<any>;
  // Provider context
  providers: Record<string, Ref<any>>;
}

const globalContextKey: InjectionKey<GlobalContext> = '_$vuact_context' as any;

export function useGlobalContext() {
  return inject(globalContextKey, {
    providers: {},
  });
}

export function useGlobalChildContext(
  globalContext: GlobalContext,
  isContextProvider?: boolean
) {
  let globalChildContext = globalContext;
  if (isContextProvider) {
    globalChildContext = {
      context: globalContext.context,
      providers: globalContext.providers,
    };
    provide(globalContextKey, globalChildContext);
  } else if (!('context' in globalContext)) {
    // root component
    provide(globalContextKey, globalContext);
  }

  return globalChildContext;
}

let contextIndex = 0;

export function createContext<T>(defaultValue: T): Context<T> {
  const contextId = '$c_' + contextIndex++;

  const Provider: any = vueToReact(
    defineComponent({
      name: 'Provider',
      inheritAttrs: false,
      props: {
        value: {
          type: null as any as PropType<any>,
        },
      },
      setup: (props, { slots }) => {
        provideContext(context, () => props.value);

        return () => {
          return slots.default?.();
        };
      },
    })
  );

  const Consumer: any = class Consumer {
    render(this: VuactComponent<React.ConsumerProps<T>>) {
      return this.props.children?.(
        this._$internalInstance!.globalContext.providers[contextId]?.value ??
          defaultValue
      );
    }
  };

  const context = { ...Provider } as VuactContext<T>;
  context.$$typeof = REACT_CONTEXT_TYPE;
  context._id = contextId;
  context._defaultValue = defaultValue;
  context._defaultValueProvider = {
    value: defaultValue,
  };
  context.Consumer = Consumer;
  context.Provider = Provider;

  Provider.$$typeof = REACT_PROVIDER_TYPE;
  Provider._context = context;
  Consumer.$$typeof = REACT_CONTEXT_TYPE;
  Consumer._context = context;
  return context;
}

export function readContext<T = any>(context: VuactContext<T>) {
  let instance = currentRenderingInstance;
  if (!instance) {
    // elementToVnode readContext 时 currentRenderingInstance 为 null
    instance = (getCurrentInstance() as VuactComponentInternalInstance)
      ._$vuactInternalInstance;
  }
  return (
    instance!.globalContext.providers[context._id]?.value ??
    context._defaultValue
  );
}

export function isContext(obj: any): obj is VuactContext<any> {
  return obj && obj.$$typeof === REACT_CONTEXT_TYPE;
}

export function createServerContext() {
  throw new Error('Not implemented');
}

/**
 * vue 给 react 提供 context
 * @param context react context
 * @param value context 值的 ref 或 getter
 */
export function provideContext<T>(
  context: Context<T>,
  value: MaybeRefOrGetter<T>
) {
  const globalContext = useGlobalContext();
  const globalChildContext = useGlobalChildContext(globalContext, true);
  const contextId = (context as VuactContext)._id;
  globalChildContext.providers = {
    ...globalContext.providers,
    [contextId]: toRef(value),
  };
}

/**
 * vue 获取 react context
 */
export function injectContext<T>(context: Context<T>) {
  const globalContext = useGlobalContext();

  return computed(() => {
    return (globalContext.providers[(context as VuactContext<T>)._id]?.value ??
      (context as VuactContext<T>)._defaultValue) as T;
  });
}

/**
 * react 向 vue 提供 context
 */
export const VueContextProvider = vueToReact(
  defineComponent({
    name: 'VueContextProvider',
    props: {
      contextKey: {
        type: [String, Symbol],
        required: true,
      },
      value: {
        type: null as any as PropType<any>,
      },
    },
    setup(props, { slots }) {
      provide(props.contextKey, props.value);
      const instance = getCurrentInstance()!;
      // @private providers 是私有属性
      const providers = (instance as any).providers;
      watch(
        () => props.value,
        (value) => {
          // XXX 不应该允许 vue context 修改
          providers[props.contextKey] = value;
        }
      );
      return () => {
        return slots.default?.();
      };
    },
  })
);
