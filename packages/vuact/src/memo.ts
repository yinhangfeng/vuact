import type React from 'react';
import { shallowEqual } from './utils/shallow-equal';
import { createBaseElementWithDefaultProps } from './element';
import { REACT_MEMO_TYPE } from './symbols';
import type { VuactInternalFunctionInstance } from './types';
import { isReactClassComponent } from './utils/react';

export const memo: typeof React.memo = function memo(
  type: any,
  compare: any = null
) {
  const nested =
    type == null ||
    isReactClassComponent(type) ||
    type.prototype?.shouldComponentUpdate != null ||
    type.defaultProps != null;

  function Memoed(this: VuactInternalFunctionInstance, props: any) {
    if (nested) {
      return createBaseElementWithDefaultProps(
        type,
        props,
        null,
        this.element!.ref,
        undefined,
        false
      );
    }
    return type.call(this, props);
  }

  Memoed.prototype.shouldComponentUpdate = function shouldComponentUpdate(
    prevProps: any,
    nextProps: any,
    prevRef: any,
    nextRef: any
  ) {
    if (prevRef !== nextRef) {
      return true;
    }
    if (compare) {
      return !compare(prevProps, nextProps);
    }

    return !shallowEqual(prevProps, nextProps);
  };

  Memoed.$$typeof = REACT_MEMO_TYPE;
  Memoed.type = type;
  Memoed.compare = compare;
  Memoed.displayName = `Memo(${type?.displayName || type?.name})`;
  Memoed._$forwarded = true;

  return Memoed as any;
};
