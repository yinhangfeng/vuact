import type React from 'react';
import { REACT_ELEMENT_TYPE } from './symbols';
import type { VuactElement, VuactOwner } from './types';
import { currentOwner } from './current-owner';
import { globalConfig } from './config';

export const createElement: typeof React.createElement = function createElement(
  type: any,
  props: any,
  children: any
) {
  const normalizedProps: any = {};
  let key: any;
  let ref: any;
  for (const k in props) {
    if (k === 'key') {
      key = props.key;
    } else if (k === 'ref') {
      ref = props.ref;
    } else {
      normalizedProps[k] = props[k];
    }
  }

  if (arguments.length > 2) {
    normalizedProps.children =
      arguments.length > 3
        ? Array.prototype.slice.call(arguments, 2)
        : children;
  }

  if (typeof type === 'function' && type.defaultProps) {
    const defaultProps = type.defaultProps;
    processDefaultProps(normalizedProps, defaultProps);
  }

  if (key === undefined) {
    key = null;
  } else {
    key = '' + key;
  }

  return createBaseElement(type, normalizedProps, key, ref);
};

/**
 * NOTE: ref 不为 null 且 refAsProp 为 true 切 setRefToProps !== false 时，会修改 props `props.ref = ref`
 */
export function createBaseElement(
  type: any,
  props: any,
  key: VuactElement['key'] | number | symbol,
  ref: VuactElement['ref'] = null,
  owner: VuactOwner | null = currentOwner.current,
  setRefToProps?: boolean
): VuactElement {
  if (ref != null && globalConfig.refAsProp && setRefToProps !== false) {
    props.ref = ref;
  }
  return {
    type,
    props,
    key: key as any,
    ref,
    $$typeof: REACT_ELEMENT_TYPE,
    _owner: owner,
  };
}

export function isValidElement<P>(
  object: {} | null | undefined
): object is React.ReactElement<P> {
  return (object as any)?.$$typeof === REACT_ELEMENT_TYPE;
}

export const cloneElement: typeof React.cloneElement = function cloneElement(
  element: any,
  props: any,
  children: any
) {
  if (element == null) {
    throw new Error(
      `React.cloneElement(...): The argument must be a React element, but you passed ${element}.`
    );
  }

  const normalizedProps = Object.assign({}, element.props);
  let key: any = element.key;
  let ref: any = element.ref;
  let owner = element._owner;

  const defaultProps = element.type?.defaultProps;

  for (const k in props) {
    const v = props[k];
    if (k === 'key') {
      if (v !== undefined) {
        key = '' + v;
      }
    } else if (k === 'ref') {
      if (v !== undefined) {
        ref = v;
        owner = currentOwner.current;
      }
    } else if (props[k] === undefined && defaultProps) {
      normalizedProps[k] = defaultProps[k];
    } else {
      normalizedProps[k] = props[k];
    }
  }

  if (arguments.length > 2) {
    normalizedProps.children =
      arguments.length > 3
        ? Array.prototype.slice.call(arguments, 2)
        : children;
  }

  const cloned = createBaseElement(
    element.type,
    normalizedProps,
    key,
    ref,
    owner
  );
  if (element._$origin_vue_vnode) {
    cloned._$origin_vue_vnode = element._$origin_vue_vnode;
  }
  return cloned;
};

export function cloneAndReplaceKey(element: any, newKey: any) {
  const cloned = createBaseElement(
    element.type,
    element.props,
    newKey,
    element.ref,
    element._owner,
    false
  );

  if (element._$origin_vue_vnode) {
    cloned._$origin_vue_vnode = element._$origin_vue_vnode;
  }
  return cloned;
}

/**
 * @deprecated
 */
export function createFactory(type: any): any {
  const factory: any = createElement.bind(null, type);
  factory.type = type;
  return factory;
}

export function createBaseElementWithDefaultProps(
  type: any,
  props: any,
  key: VuactElement['key'] | number | symbol,
  ref: VuactElement['ref'] = null,
  owner?: VuactOwner | null,
  setRefToProps?: boolean,
  propsMutable?: boolean
) {
  if (typeof type === 'function' && type.defaultProps) {
    if (!propsMutable) {
      props = { ...props };
    }
    const defaultProps = type.defaultProps;
    processDefaultProps(props, defaultProps);
  }
  return createBaseElement(type, props, key, ref, owner, setRefToProps);
}

export function processDefaultProps(props: any, defaultProps: any) {
  for (const k in defaultProps) {
    if (props[k] === undefined) {
      props[k] = defaultProps[k];
    }
  }
}
