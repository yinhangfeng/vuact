import type React from 'react';
import { EMPTY_OBJ } from './constants';
import { shallowEqual } from './utils/shallow-equal';
import type { VuactComponent } from './types';
import { updateQueue, type UpdateQueue } from './updater';
import { deferInTransition } from './transition';

export const BaseComponent: any = function BaseComponent<
  P = {},
  S = {},
  SS = any,
>(
  this: VuactComponent<P, S, SS>,
  props: P,
  context?: any,
  updater?: UpdateQueue
) {
  this.props = props;
  this.context = context;
  this.refs = EMPTY_OBJ;
  this.updater = updater ?? updateQueue;
} as any;

const baseComponentProtoType = BaseComponent.prototype;

baseComponentProtoType.isReactComponent = {};

baseComponentProtoType.render = function render() {
  return null;
};

Object.defineProperty(baseComponentProtoType, 'isMounted', {
  get(this: VuactComponent) {
    return this._$internalInstance?.mounted ?? false;
  },
});

baseComponentProtoType.setState = function setState<
  P = {},
  S = {},
  K extends keyof S = any,
>(
  this: VuactComponent,
  state:
    | S
    | ((prevState: Readonly<S>, props: Readonly<P>) => S | Pick<S, K> | null)
    | Pick<S, K>
    | null,
  callback?: () => void
): void {
  const internalInstance = this._$internalInstance;
  if (internalInstance?.element) {
    internalInstance.pendingStates.push(state);
    deferInTransition(() => {
      internalInstance.enqueueUpdateState(callback);
    });
  }
};

baseComponentProtoType.forceUpdate = function forceUpdate(
  this: VuactComponent,
  callback?: () => void
): void {
  const internalInstance = this._$internalInstance;
  if (internalInstance?.element) {
    internalInstance.force = true;
    internalInstance.enqueueUpdateState(callback);
  }
};

baseComponentProtoType.replaceState = function replaceState(
  this: VuactComponent,
  state: any,
  callback?: () => void
): void {
  const internalInstance = this._$internalInstance;
  if (internalInstance?.element) {
    const replace = () => state;
    replace._$replace = true;
    internalInstance.pendingStates.push(replace);
    internalInstance.enqueueUpdateState(callback);
  }
};

[
  'componentWillMount',
  'componentWillReceiveProps',
  'componentWillUpdate',
].forEach((key) => {
  Object.defineProperty(baseComponentProtoType, key, {
    configurable: true,
    get() {
      return this['UNSAFE_' + key];
    },
    set(v) {
      Object.defineProperty(this, key, {
        configurable: true,
        writable: true,
        value: v,
      });
    },
  });
});

function ComponentDummy() {}
ComponentDummy.prototype = BaseComponent.prototype;

function PureComponent<P = {}, S = {}, SS = any>(
  this: VuactComponent<P, S, SS>,
  props: P,
  context?: any,
  updater?: UpdateQueue
) {
  this.props = props;
  this.context = context;
  this.refs = EMPTY_OBJ;
  this.updater = updater || updateQueue;
}

const pureComponentPrototype = (PureComponent.prototype =
  new (ComponentDummy as any)());
pureComponentPrototype.constructor = PureComponent;
Object.assign(pureComponentPrototype, BaseComponent.prototype);
pureComponentPrototype.isPureReactComponent = true;

pureComponentPrototype.shouldComponentUpdate = function shouldComponentUpdate(
  nextProps: any,
  nextState: any
): boolean {
  return (
    !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
  );
};

export const Component = BaseComponent as unknown as typeof React.Component;
const ReactPureComponent =
  PureComponent as unknown as typeof React.PureComponent;

export { ReactPureComponent as PureComponent };
