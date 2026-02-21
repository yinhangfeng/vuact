import type { ReactNode } from 'react';
import { cloneAndReplaceKey, isValidElement } from './element';
import {
  getIteratorFn,
  REACT_ELEMENT_TYPE,
  REACT_LAZY_TYPE,
  REACT_PORTAL_TYPE,
} from './symbols';
import { isThenable, resolveThenable } from './thenable';
import { readContext, isContext } from './context';

const SEPARATOR = '.';
const SUBSEPARATOR = ':';

/**
 * Escape and wrap key so it is safe to use as a reactid
 *
 * @param {string} key to be escaped.
 * @return {string} the escaped key.
 */
function escape(key: string): string {
  const escapeRegex = /[=:]/g;
  const escaperLookup: Record<string, string> = {
    '=': '=0',
    ':': '=2',
  };
  const escapedString = key.replace(escapeRegex, function (match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

const userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text: string): string {
  return text.replace(userProvidedKeyEscapeRegex, '$&/');
}

/**
 * Generate a key string that identifies a element within a set.
 *
 * @param {*} element A element that could contain a manual key.
 * @param {number} index Index that is used if a manual key is not provided.
 * @return {string}
 */
function getElementKey(element: any, index: number): string {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (typeof element === 'object' && element !== null && element.key != null) {
    // Explicit key
    return escape('' + element.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

function mapIntoArray(
  children: any,
  array: ReactNode[],
  escapedPrefix: string,
  nameSoFar: string,
  callback: (node: ReactNode) => ReactNode | undefined | void
): number {
  const type = typeof children;

  if (type === 'undefined' || type === 'boolean') {
    // All of the above are perceived as null.
    children = null;
  }

  let invokeCallback = false;

  if (children === null) {
    invokeCallback = true;
  } else {
    switch (type) {
      case 'bigint':
      case 'string':
      case 'number':
        invokeCallback = true;
        break;
      case 'object':
        switch (children.$$typeof) {
          case REACT_ELEMENT_TYPE:
          case REACT_PORTAL_TYPE:
            invokeCallback = true;
            break;
          case REACT_LAZY_TYPE: {
            // XXX 为什么会有 REACT_LAZY_TYPE？
            const payload = children._payload;
            const init = children._init;
            return mapIntoArray(
              init(payload),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          }
        }
    }
  }

  if (invokeCallback) {
    const child = children;
    let mappedChild = callback(child);
    if (mappedChild != null) {
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows:
      const childKey =
        nameSoFar === '' ? SEPARATOR + getElementKey(child, 0) : nameSoFar;
      if (Array.isArray(mappedChild)) {
        let escapedChildKey = '';
        if (childKey != null) {
          escapedChildKey = escapeUserProvidedKey(childKey) + '/';
        }
        mapIntoArray(mappedChild, array, escapedChildKey, '', (c) => c);
      } else {
        if (isValidElement(mappedChild)) {
          const newChild = cloneAndReplaceKey(
            mappedChild,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            escapedPrefix +
              (mappedChild.key != null &&
              (!child || child.key !== mappedChild.key)
                ? escapeUserProvidedKey('' + mappedChild.key) + '/'
                : '') +
              childKey
          );
          mappedChild = newChild;
        }
        array.push(mappedChild);
      }
    }
    return 1;
  }

  let child;
  let nextName;
  let subtreeCount = 0; // Count of children found in the current subtree.
  const nextNamePrefix =
    nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      nextName = nextNamePrefix + getElementKey(child, i);
      subtreeCount += mapIntoArray(
        child,
        array,
        escapedPrefix,
        nextName,
        callback
      );
    }
  } else {
    const iteratorFn = getIteratorFn(children);
    if (iteratorFn) {
      const iterableChildren: Iterable<ReactNode> & {
        entries: any;
      } = children;

      const iterator = iteratorFn.call(iterableChildren);
      let step;
      let ii = 0;
      while (!(step = iterator.next()).done) {
        child = step.value;
        nextName = nextNamePrefix + getElementKey(child, ii++);
        subtreeCount += mapIntoArray(
          child,
          array,
          escapedPrefix,
          nextName,
          callback
        );
      }
    } else if (type === 'object') {
      if (isThenable(children)) {
        return mapIntoArray(
          resolveThenable(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      }

      if (isContext(children)) {
        return mapIntoArray(
          readContext(children),
          array,
          escapedPrefix,
          nameSoFar,
          callback
        );
      }

      const childrenString = String(children);

      throw new Error(
        `Objects are not valid as a React child (found: ${
          childrenString === '[object Object]'
            ? 'object with keys {' + Object.keys(children).join(', ') + '}'
            : childrenString
        }). ` +
          'If you meant to render a collection of children, use an array ' +
          'instead.'
      );
    }
  }

  return subtreeCount;
}

type MapFunc = (
  child: ReactNode,
  index: number
) => ReactNode | undefined | void;

/**
 * Maps children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
 *
 * The provided mapFunction(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} func The map function.
 * @param {*} context Context for mapFunction.
 * @return {object} Object containing the ordered map of results.
 */
function mapChildren(children: any, func: MapFunc, context?: any): ReactNode[] {
  if (children == null) {
    return children;
  }
  const result: ReactNode[] = [];
  let count = 0;
  mapIntoArray(children, result, '', '', (child) => {
    return func.call(context, child, count++);
  });
  return result;
}

/**
 * Count the number of children that are typically specified as
 * `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrencount
 *
 * @param {?*} children Children tree container.
 * @return {number} The number of children.
 */
function countChildren(children?: any): number {
  let n = 0;
  mapChildren(children, () => {
    n++;
    // Don't return anything
  });
  return n;
}

type ForEachFunc = (child: ReactNode) => void;

/**
 * Iterates through children that are typically specified as `props.children`.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
 *
 * The provided forEachFunc(child, index) will be called for each
 * leaf child.
 *
 * @param {?*} children Children tree container.
 * @param {function(*, int)} forEachFunc
 * @param {*} forEachContext Context for forEachContext.
 */
function forEachChildren(
  children: any,
  forEachFunc: ForEachFunc,
  forEachContext?: any
): void {
  mapChildren(
    children,
    function (this: any) {
      forEachFunc.apply(this, arguments as any);
      // Don't return anything.
    },
    forEachContext
  );
}

/**
 * Flatten a children object (typically specified as `props.children`) and
 * return an array with appropriately re-keyed children.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
 */
function toArray(children?: any): ReactNode[] {
  return mapChildren(children, (child) => child) || [];
}

/**
 * Returns the first child in a collection of children and verifies that there
 * is only one child in the collection.
 *
 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
 *
 * The current implementation of this function assumes that a single child gets
 * passed without a wrapper, but the purpose of this helper function is to
 * abstract away the particular structure of children.
 *
 * @param {?object} children Child collection structure.
 * @return {ReactElement} The first and only `ReactElement` contained in the
 * structure.
 */
function onlyChild<T>(children: T): T {
  if (!isValidElement(children)) {
    throw new Error(
      'React.Children.only expected to receive a single React element child.'
    );
  }

  return children;
}

export {
  forEachChildren as forEach,
  mapChildren as map,
  countChildren as count,
  onlyChild as only,
  toArray,
};

export const Children = {
  forEach: forEachChildren,
  map: mapChildren,
  count: countChildren,
  only: onlyChild,
  toArray,
};
