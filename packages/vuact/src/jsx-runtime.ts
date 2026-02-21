import type ReactJSXRuntime from 'react/jsx-runtime';
import { createBaseElement } from './element';
import {
  disableDefaultPropsExceptForClasses,
  // disableStringRefs,
} from './feature-flags';
import { globalConfig } from './config';

export { Fragment } from './fragment';

// const enableFastJSXWithoutStringRefs =
//   globalConfig.refAsProp && disableStringRefs;

export const jsx: typeof ReactJSXRuntime.jsx = function jsx(
  type: any,
  config: any,
  maybeKey?: any
) {
  let key = null;
  let ref = null;

  if (config.key !== undefined) {
    key = '' + config.key;
  } else if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }

  if (config.ref != null) {
    ref = config.ref;
    // TODO
    // if (!disableStringRefs) {
    //   ref = coerceStringRef(ref, getOwner(), type);
    // }
  }

  let props: any;
  if (!('key' in config) && (globalConfig.refAsProp || !('ref' in config))) {
    props = config;
  } else {
    props = {};
    for (const propName in config) {
      if (
        propName !== 'key' &&
        (globalConfig.refAsProp || propName !== 'ref')
      ) {
        props[propName] = config[propName];
      }
    }
  }

  if (!disableDefaultPropsExceptForClasses) {
    if (type && type.defaultProps) {
      const defaultProps = type.defaultProps;
      for (const propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }
  }

  return createBaseElement(type, props, key, ref);
};

export const jsxs = jsx;
