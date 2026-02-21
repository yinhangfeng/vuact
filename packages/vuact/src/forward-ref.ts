import type React from 'react';
import { REACT_FORWARD_REF_TYPE } from './symbols';
import { globalConfig } from './config';
import type { VuactInternalFunctionInstance } from './types';
import { propsWithoutRef } from './utils/props-without-ref';

// TODO 是否需要支持 render.defaultProps
export const forwardRef: typeof React.forwardRef = function forwardRef(render) {
  function Forwarded(this: VuactInternalFunctionInstance, props: any) {
    if (globalConfig.refAsProp) {
      if (this.element !== this.oldElement) {
        if ('ref' in props) {
          props = propsWithoutRef(props);
        }
        this.propsWithoutRef = props;
      } else {
        props = this.propsWithoutRef;
      }
    }
    return render?.(props, this.element!.ref);
  }

  Forwarded.$$typeof = REACT_FORWARD_REF_TYPE;
  Forwarded.render = render;
  Forwarded.displayName = `ForwardRef(${render?.displayName || render?.name})`;
  Forwarded._$forwarded = true;

  return Forwarded;
};
