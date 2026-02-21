import type {
  ToVuactFunctionComponent,
  VuactComponentTypeInner,
  VuactVueComponent,
} from './types';

/**
 * vue 组件转为 react 组件
 * 1. react 中调用 vue 组件
 * 2. vue 调用 react 通过 slot 传入了 vue 组件，转成 react element
 * 返回的组件其实还是 vue 组件只是在类型上伪装成为 react class 组件，且带有 _$origin_vue_component 标记
 * 比如
 * ```
 * VueComponent1
 *
 * const RVueComponent1 = vueToReact(VueComponent1)
 *
 * RVueComponent1 其实就是 VueComponent1 的一个 clone
 * ```
 */
export function vueToReact<C extends VuactVueComponent>(
  component: C
): ToVuactFunctionComponent<C> {
  let result = component._$react_component;
  if (!result) {
    if (typeof component === 'function') {
      result = (...args: any) => (component as any)(...args);
    } else {
      result = {
        ...component,
      };
    }
    component._$react_component = result;
    (result as VuactComponentTypeInner)._$origin_vue_component = component;
  }

  return result;
}
