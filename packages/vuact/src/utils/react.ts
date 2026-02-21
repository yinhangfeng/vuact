import type { VuactComponentClass } from '../types';

export function isReactClassComponent(
  component: any
): component is VuactComponentClass {
  return typeof component === 'function' && !!component.prototype?.render;
}
