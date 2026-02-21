export const EMPTY_OBJ: any = Object.freeze({});
export const EMPTY_ARR = Object.freeze([]);
export function EMPTY_FUNC() {}

/**
 * vue 调用 react 组件时，带有该前缀的 slot 会立即执行，作为 element prop
 */
export const ELEMENT_SLOT_PREFIX = 'element:';

/**
 * react 调用 vue 组件时，带有该前缀的 prop 会作为 slot
 */
export const SLOT_PROP_PREFIX = 'slot:';

export const REACT_VNODE_PROPS_PROTO = {};
