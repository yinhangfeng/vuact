import {
  Fragment as VFragment,
  Text as VText,
  Comment as VComment,
  type VNodeChild,
  type VNode,
} from 'vue';
import {
  createBaseElement,
  createBaseElementWithDefaultProps,
} from './element';
import { vueStyleToReactStyle } from './style';
import { vueToReact } from './vue-to-react';
import type {
  MaybeElementArray,
  VuactComponentClass,
  VuactElement,
  VuactFunctionComponent,
  VuactRef,
  VuactVueComponentTypeInner,
} from './types';
import { setRawRef } from './utils/vue';
import { ELEMENT_SLOT_PREFIX } from './constants';
import { Fragment } from './fragment';

/**
 * vue vnode 转 react element
 * vue 调 react 组件时传递的 slots 内容
 * TODO 可以简单处理转成一个 mock element，之后再转回来，但这样会失去 react 组件对传入的 element 进行处理的能力
 * TODO 可配置简单转换或完全转换
 */
export function vNodeToElement(vnode: VNodeChild): any {
  if (typeof vnode === 'object' && vnode) {
    let element: VuactElement | MaybeElementArray;
    if (Array.isArray(vnode)) {
      element = vnode.map(vNodeToElement);
    } else {
      const type = vnode.type;
      if (typeof type === 'string' || !type) {
        // native tag
        element = nativeVNodeToElement(vnode);
      } else if (
        (type as VuactVueComponentTypeInner)._$origin_react_component
      ) {
        // react-to-vue 转过来的组件，比如在 vue 中调用 react 组件传入了 react-to-vue 转换的 vnode
        element = reactComponentVNodeToElement(vnode);
      } else if (type === VText) {
        return vnode.children;
      } else if (type === VFragment) {
        element = fragmentVNodeToElement(vnode);
      } else if (type === VComment) {
        return null;
      } else {
        // vue component
        element = vueComponentVNodeToElement(vnode);
      }
      // TODO 是否需要处理 Teleport
    }

    // 在 clone 时丢掉
    element._$vue_vnode = vnode;
    // 需要在 clone 时保留
    element._$origin_vue_vnode = vnode;
    return element;
  }
  // string | number | boolean | null | undefined
  // XXX 暂不处理非法 vnode
  return vnode;
}

function nativeVNodeToElement(vnode: VNode) {
  // TODO props 转换可以 lazy
  const props: Record<string, any> = {};
  for (const key in vnode.props) {
    const prop = props[key];
    if (key === 'class') {
      props.className = prop;
    } else if (key === 'style') {
      props.style = vueStyleToReactStyle(prop);
    } else if (key === 'innerHTML') {
      props.dangerouslySetInnerHTML = {
        __html: prop,
      };
    } else {
      props[key] = prop;
    }
  }

  // TODO children 暂时不转换了，也就是 react 组件内无法获取到 children

  return createBaseElement(
    vnode.type,
    props,
    vnode.key,
    vueRefToReactRef(vnode.ref)
  );
}

function fragmentVNodeToElement(vnode: VNode) {
  return createBaseElement(
    Fragment,
    null,
    vnode.key,
    vNodeToElement(vnode.children as any)
  );
}

function reactComponentVNodeToElement(vnode: VNode) {
  const props = vuePropsToReactProps(vnode.props);

  return createBaseElement(
    (vnode.type as VuactVueComponentTypeInner)._$origin_react_component,
    props,
    vnode.key,
    vueRefToReactRef(vnode.ref)
  );
}

function vueComponentVNodeToElement(vnode: VNode) {
  const props = vuePropsToReactProps(vnode.props);

  return createBaseElement(
    vueToReact(vnode.type as any),
    props,
    vnode.key,
    vueRefToReactRef(vnode.ref)
  );
}

function vueRefToReactRef(ref: any) {
  if (!ref) {
    return ref;
  }

  let rRef: VuactRef<any> = ref._$r_ref;
  if (!rRef) {
    rRef = (v: any) => {
      // v 可能是
      // 1. 原始的 vue component instance expose，直接使用
      // 2. vue component instance expose 包装的 react ref value，需要转为原始的 expose
      setRawRef(ref, v);
    };
    ref._$r_ref = rRef;
    rRef._$v_ref = ref;
  }

  return rRef;
}

export function vuePropsToReactProps(props: any) {
  const reactProps: Record<string, any> = {};
  for (const key in props) {
    const prop = props[key];
    if (key === 'class') {
      reactProps.className = prop;
    } else if (key === 'style') {
      reactProps.style = vueStyleToReactStyle(prop);
    } else {
      reactProps[key] = prop;
    }
  }

  return reactProps;
}

/**
 * vue slot 转为 react prop 的配置
 */
export interface SlotTransformConfig {
  /**
   * 是否将 slot 转为 element prop，立即执行 slot
   * 默认值
   * default slot: 默认为 true，默认会作为 children element prop
   * 其它默认为 false
   * 也可以在 slot name 名字前加上 ELEMENT_SLOT_PREFIX 前缀开启
   */
  elementProp?: boolean;
  /**
   * 是否将 slot 结果转为 element
   * 默认 false
   * 当 react 组件内部需要对 element 进行处理时需要开启，比如 react 组件内部使用 React.Children 或 React.cloneElement 等
   */
  transformVNode?: boolean;
}

export function componentToElement(
  componentType: VuactFunctionComponent<any> | VuactComponentClass<any>,
  attrs: Record<string, unknown>,
  slots: Record<string, any>,
  ref?: VuactElement['ref'],
  slotsTransformConfig?: Record<string, SlotTransformConfig>
) {
  const props = vuePropsToReactProps(attrs);

  // 处理 slots
  // TODO 延迟计算?
  // TODO 使用 vnode.children 避免 warning?
  for (const key in slots) {
    const slot = slots[key];
    if (!slot) {
      continue;
    }

    let elementProp: boolean | undefined;
    let transformVNode: boolean | undefined;
    let propName = key;
    if (key.startsWith(ELEMENT_SLOT_PREFIX)) {
      propName = key.slice(ELEMENT_SLOT_PREFIX.length);
      elementProp = true;
    }

    if (slotsTransformConfig) {
      const slotTransformConfig = slotsTransformConfig[propName];
      if (slotTransformConfig) {
        if (elementProp === undefined) {
          elementProp = slotTransformConfig.elementProp;
        }
        transformVNode = slotTransformConfig.transformVNode;
      }
    }

    if (key === 'default') {
      propName = 'children';
      if (elementProp === undefined) {
        elementProp = true;
      }
    }

    let prop: any;
    if (elementProp) {
      if (transformVNode) {
        prop = vNodeToElement(slot());
      } else {
        prop = slot();
      }
    } else {
      if (transformVNode) {
        prop = (...args: any[]) => vNodeToElement(slots[key]?.(...args));
      } else {
        prop = slot;
      }
    }
    props[propName] = prop;
  }

  return createBaseElementWithDefaultProps(
    componentType,
    props,
    null,
    ref,
    undefined,
    true,
    true
  );
}
