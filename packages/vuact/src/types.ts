import type {
  Component,
  ReactElement,
  ReactNode,
  Context,
  RefCallback,
  MutableRefObject,
  ReactPortal,
  Ref as ReactRef,
} from 'react';
import {
  type ComponentInternalInstance,
  type ComponentOptions,
  type ComponentPublicInstance,
  type DefineComponent,
  type DefineSetupFnComponent,
  type FunctionalComponent,
  type ReactiveEffect,
  type SlotsType,
  type VNode,
} from 'vue';
import { type GlobalContext } from './context';
import type { UpdateQueue } from './updater';
import type { RenderContext } from './render-context';
import type { Hook, EffectHook, LayoutEffectHook } from './hooks';

interface MaybeElementInner {
  /**
   * 从 vnode 转过来的 element，对应的原始 vnode，cloneElement 之后不会保留
   */
  _$vue_vnode?: any;
  /**
   * 从 vnode 转过来的 element，对应的原始 vnode，cloneElement 之后会保留
   */
  _$origin_vue_vnode?: any;
}

export interface VuactElement
  extends Omit<ReactElement, 'key'>,
    MaybeElementInner {
  key: string | null;
  type: any;
  props: any;
  ref: VuactRef<any> | null;
  _owner?: VuactOwner | null;
  $$typeof?: symbol;
  _$vue_vnode?: VNode;
  _$origin_vue_vnode?: VNode;
  /**
   * 转换到 vnode 时的 props 缓存
   */
  _$vnode_props?: any;
}

export type MaybeElementArray = MaybeElement[] & MaybeElementInner;

export type MaybeElement =
  | VuactElement
  // | VNode
  | string
  | boolean
  | number
  | null
  | undefined;
export type MaybeElements = MaybeElement | MaybeElementArray;

export interface VuactPortal
  extends Omit<ReactPortal, 'type' | 'key' | 'children' | 'props'>,
    VuactElement {
  containerInfo: any;
  children: any;
}

export interface VuactComponent<P = {}, S = {}, SS = any>
  extends Component<P, S, SS> {
  props: Readonly<P>;
  _$internalInstance?: VuactInternalClassInstance;
  updater: UpdateQueue;
  render(props?: any, context?: any): ReactNode;
  getChildContext?: () => any;
  isMounted(): boolean;
  replaceState(nextState: S, callback?: () => void): void;
  shouldComponentUpdate?(
    nextProps: Readonly<P>,
    nextState?: Readonly<S>,
    nextContext?: any
  ): boolean;
}

export interface VuactInternalInstance extends VuactOwner {
  componentType: any;
  enqueueUpdate: () => void;
  dirty: boolean;
  force?: boolean;
  element?: VuactElement;
  mounted: boolean;
  vInstance: ComponentInternalInstance;
  // 父级组件传递过来的 context
  globalContext: GlobalContext;
  // 当前组件消费的 context ref
  contextRef: { value: any };
  // 是否跳过本次渲染 (scu 返回 false)
  renderSkipped?: boolean;

  renderEffect: ReactiveEffect;

  renderContext: RenderContext;

  init?(element: VuactElement): void;
  // render 之前，vue onBeforeUpdate 中调用
  beforeUpdate(element: VuactElement): void;
  // render skipRender 之前调用
  beforeRender?(): void;
  render(): any;
  // 渲染跳过(scu 返回 false)时调用
  skipRender?(): void;
  // render 成功之后调用
  afterRender(): void;
  // render 失败之后调用
  renderError(): void;
  // render 结束且 dom 更新完成之后调用，如果 enableSyncUpdated 为 false 则会在 onUpdated 中调用
  updated(sync: boolean): void;
  // commit 之前调用
  beforeCommit(): void;
  // currentUpdateRootInstance 的 updated 之后调用，此时 currentUpdateRootInstance 下的 sutTree 的 dom 已经更新完毕，如果 enableSyncUpdated 为 false 则会在 onUpdated 中 updated 之后调用
  commit(): void;
  beforeUnmount(): void;
  errorCaptured?(
    error: any,
    vInstance: ComponentPublicInstance | null,
    info: string
  ): void;

  imperativeHandleRef?(ref: any): void;
  // vue 直接调用的 function react 组件的 handle
  imperativeHandle?: any;

  // dom 被外部修改错误的 error capture
  externalDomModificationErrorCaptured?(
    error: any,
    vInstance: ComponentPublicInstance | null,
    info: string
  ): void;
  externalDomModificationRetryCount?: number;
}

export interface VuactInternalClassInstance extends VuactInternalInstance {
  // 提供给子组件的 context
  globalChildContext?: GlobalContext;
  publicInstance?: VuactComponent;
  nextState?: any;
  /**
   * class component，等待合并的 setState 调用
   */
  pendingStates: any[];
  /**
   * class component，setState 的 callback
   */
  stateCallbacks?: (() => void)[];
  snapshot?: any;

  enqueueUpdateState(callback?: () => void): void;
}

export interface VuactInternalFunctionInstance extends VuactInternalInstance {
  oldElement?: VuactElement;
  props: any;
  // fordwardRef
  propsWithoutRef?: any;
  context: any;
  hooks: Hook[];
  currentHookIndex: number;
  pendingEffects?: EffectHook[];
  pendingLayoutEffects?: LayoutEffectHook[];

  enqueueForceUpdate(): void;
  shouldComponentUpdate?(
    prevProps: any,
    nextProps: any,
    prevRef: any,
    nextRef: any
  ): boolean;
}

export interface VuactContext<T = any> extends Context<T> {
  $$typeof: symbol;
  _id: string;
  _defaultValue: T;
  _defaultValueProvider: {
    value: T;
  };
}

export interface VuactOwner {
  stateNode: VuactComponent;
}

export type VuactRef<T> = (RefCallback<T> | MutableRefObject<T>) & {
  _$v_ref?: any;
  _$cleanup?: () => void;
  // _$pending_set_null?: boolean;
};

export interface VuactComponentInternalInstance
  extends ComponentInternalInstance {
  _$vuactInternalInstance?: VuactInternalInstance;
  _$shouldDestroy?: boolean;
}

/**
 * react 组件上的额外属性
 */
export interface VuactComponentTypeInner {
  contextTypes?: any;

  /**
   * 转换为 vue 组件的缓存，只缓存没有 options 参数的情况
   */
  _$vue_component?: any;
  /**
   * 组件对应的原始 vue 组件，也代表组件是由 vue 转换而来
   * 但其实组件本身还是一个 vue 组件，参考 `vueToReact`
   */
  _$origin_vue_component?: any;
}

export type VuactFunctionComponent<P = {}> = React.FunctionComponent<P> &
  VuactComponentTypeInner & {
    contextType?: VuactContext<any> | undefined;
  };

export type VuactComponentClass<
  P = {},
  S = React.ComponentState,
> = React.ComponentClass<P, S> & VuactComponentTypeInner;

/**
 * vue 组件上的额外属性
 */
export interface VuactVueComponentTypeInner {
  /**
   * 转换为 react 组件的缓存
   */
  _$react_component?: any;
  /**
   * 组件对应的原始 react 组件，代表组件是由 react 转换而来
   */
  _$origin_react_component?: any;
}

export type VuactDefineComponent<
  P extends Record<string, any>,
  RawBindings = {},
> = DefineComponent<P, RawBindings> & {
  new (): {
    $slots: ExtractSlotsFromProps;
  };
} & VuactVueComponentTypeInner;

type ModifyFunctionReturn<T, NewReturn> = T extends (...args: infer Args) => any
  ? (...args: Args) => NewReturn
  : never;

type ModifyOptionalFunctionReturn<T, NewReturn = any> = T extends undefined
  ? undefined
  : ModifyFunctionReturn<T, NewReturn>;

type ExtractSlotsFromProps =
  // {
  //   // TODO
  //   [K in keyof P as K extends `render${string}`
  //     ? K
  //     : never]: ModifyOptionalFunctionReturn<P[K], any>;
  // } &
  {
    default?: (...args: any[]) => any;
  } & SlotsType;

export type ToVuactDefineComponent<
  C extends VuactFunctionComponent<any> | VuactComponentClass<any>,
  P extends Record<string, any> = Omit<
    C extends VuactFunctionComponent<infer Props>
      ? Props
      : C extends VuactComponentClass<infer Props>
        ? Props
        : never,
    'ref'
  >,
> = VuactDefineComponent<P, ExtractComponentExposed<C>>;

type ExtractClassComponentInstance<T> =
  T extends VuactComponentClass<any, any> ? InstanceType<T> : never;

type ExtractFunctionComponentRef<T> =
  T extends VuactFunctionComponent<infer P>
    ? P extends { ref?: infer R }
      ? R extends { current: infer Handle }
        ? Handle
        : never
      : never
    : never;

export type ExtractComponentExposed<T> = (T extends VuactComponentClass<
  any,
  any
>
  ? { instance: ExtractClassComponentInstance<T> }
  : T extends VuactFunctionComponent<any>
    ? { instance?: ExtractFunctionComponentRef<T> }
    : never) & {
  internalInstance: VuactInternalInstance;
};

export type VuactVueComponent = (
  | DefineComponent
  | DefineSetupFnComponent<any>
  | ComponentOptions
  | FunctionalComponent
  | {
      new (...args: any[]): ComponentPublicInstance;
    }
) &
  VuactVueComponentTypeInner;

export type ExtractVueComponentProps<T extends VuactVueComponent> =
  T extends DefineComponent<infer P, any>
    ? P
    : T extends DefineSetupFnComponent<infer P>
      ? P
      : T extends ComponentOptions<infer P>
        ? P
        : T extends FunctionalComponent<infer P>
          ? P
          : T extends new () => { $props: infer P }
            ? P
            : never;

type ExtractVueComponentSlots<T> = T extends new () => { $slots: infer S }
  ? {
      [K in keyof S as K extends 'default'
        ? 'children'
        : `slot:${string & K}`]: ModifyOptionalFunctionReturn<S[K], any> | {};
    } & {
      children?: {};
    }
  : { children?: {} };

export type ExtractVueComponentRef<T> = T extends { new (): infer Instance }
  ? ReactRef<Instance>
  : // TODO
    ReactRef<any>;

export type ToVuactFunctionComponent<T extends VuactVueComponent> =
  VuactFunctionComponent<
    React.HTMLAttributes<any> &
      ExtractVueComponentProps<T> &
      ExtractVueComponentSlots<T> & { ref?: ExtractVueComponentRef<T> }
  >;

export type ThenableErrorExtra = {
  _$vInstance?: VuactComponentInternalInstance | null;
};

export type ReactComponentRefType<C extends React.ComponentType> =
  C extends React.FunctionComponent<infer P>
    ? P extends { ref?: infer R }
      ? R extends React.RefCallback<infer T>
        ? NonNullable<T>
        : R extends React.RefObject<infer T>
          ? NonNullable<T>
          : never
      : never
    : C;
// React.ComponentPropsWithRef<C>['ref'] extends ReactRef<infer T> ? T : number;
