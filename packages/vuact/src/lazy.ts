import type React from 'react';
import {
  createVNode,
  defineComponent,
  getCurrentInstance,
  shallowRef,
  triggerRef,
} from 'vue';
import type { ComponentType } from 'react';
import { REACT_LAZY_TYPE } from './symbols';
import {
  createBaseElementWithDefaultProps,
  processDefaultProps,
} from './element';
import type { VuactComponentTypeInner, VuactElement } from './types';
import { resolveThenable, type Thenable } from './thenable';
import { reactToVue } from './react-to-vue';

export const lazy: typeof React.lazy = function lazy(load) {
  let thenable:
    | Thenable<{
        default: any;
      }>
    | undefined;
  const Lazy = defineComponent({
    $$typeof: REACT_LAZY_TYPE,
    inheritAttrs: false,
    _result: null,
    setup(_, { attrs }) {
      if (!thenable || thenable.status === 'rejected') {
        thenable = load();
        thenable.then((res) => {
          Lazy._result = res?.default;
        });
      }
      const instance = getCurrentInstance()!;
      const updateRef = shallowRef(0);
      (instance as any)._$forceUpdate = () => {
        triggerRef(updateRef);
      };

      return () => {
        updateRef.value;
        const component = resolveThenable(thenable!).default;
        const lazyElement = attrs.$element as VuactElement;

        const element = createBaseElementWithDefaultProps(
          component,
          lazyElement.props,
          null,
          lazyElement.ref,
          undefined,
          false
        );

        if (Lazy.defaultProps) {
          if (!component.defaultProps) {
            element.props = {
              ...element.props,
            };
          }
          processDefaultProps(element.props, Lazy.defaultProps);
        }

        return createVNode(reactToVue(component), {
          $element: element,
        });
      };
    },
  });

  // 伪装成 react-to-vue 转换过的
  (Lazy as VuactComponentTypeInner)._$vue_component = Lazy;

  return Lazy as any;
};

/**
 * 等价于 reactToVue(lazy(load))
 */
export function lazyReactToVue<T extends ComponentType<any>>(
  load: () => Promise<{ default: T }>
) {
  return reactToVue(lazy(load));
}
