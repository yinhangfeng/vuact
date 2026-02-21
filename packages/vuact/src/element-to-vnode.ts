import {
  isVNode,
  createVNode,
  Fragment as VFragment,
  Teleport,
  type VNodeProps,
} from 'vue';
import { reactStyleToVueStyle } from './style';
import { reactToVue } from './react-to-vue';
import { isRawSlots } from './utils/vue';
import { REACT_PORTAL_TYPE, getIteratorFn } from './symbols';
import { isOn, processEventProp } from './event';
import { reactRefToVueRef } from './ref';
import type { RenderContext } from './render-context';
import { Fragment } from './fragment';
import getAttributeAlias from './get-attribute-alias';
import { REACT_VNODE_PROPS_PROTO, SLOT_PROP_PREFIX } from './constants';
import type {
  MaybeElements,
  VuactComponentTypeInner,
  VuactElement,
  VuactPortal,
} from './types';
import type { VuactConfig } from './config';
import { isThenable, resolveThenable } from './thenable';
import { readContext, isContext } from './context';
import { domComponentsRegistry } from './dom-components';

/**
 * react element 转为 vue vnode
 * 不行
 * 1. 造成浪费，可能 createElement 最初的 element 没有使用，比如被 clone 修改了
 * 2. vue vnode 不支持复用
 *
 * TODO renderContext config 逐层传递太麻烦
 */
export function elementToVNode(
  element: MaybeElements,
  renderContext?: RenderContext,
  config?: VuactConfig
): any {
  if (typeof element === 'object' && element) {
    if (isVNode(element)) {
      // 允许包含 VNode，比如 vue 调 react 组件时直接传入了 vnode 没有经过 vNodeToElement 转换
      return element;
    }

    if (element._$vue_vnode) {
      // element 是由 vnode 转换过来的，且没被修改，直接返回原始 vnode
      return element._$vue_vnode;
    }

    if (Array.isArray(element)) {
      return element.map((ele) => elementToVNode(ele, renderContext, config));
    }

    const iteratorFn = getIteratorFn(element);
    if (iteratorFn) {
      const iterator = iteratorFn.call(element);
      let step;
      const result: any[] = [];
      while (!(step = iterator.next()).done) {
        result.push(elementToVNode(step.value, renderContext, config));
      }
      return result;
    }

    if (isThenable(element)) {
      return elementToVNode(resolveThenable(element), renderContext, config);
    }

    if (isContext(element)) {
      return elementToVNode(readContext(element), renderContext, config);
    }

    const type = element.type;

    if (typeof type === 'string') {
      const domComponent = domComponentsRegistry[type];
      if (domComponent) {
        return vueComponentElementToVNode(
          element,
          domComponent,
          renderContext,
          config
        );
      }
      return nativeElementToVNode(element, renderContext, config);
    }

    if (type === Fragment) {
      return fragmentElementToVNode(element, renderContext, config);
    }

    if (element.$$typeof === REACT_PORTAL_TYPE) {
      // react portal
      return portalElementToVNode(element as VuactPortal);
    }

    if (type == null) {
      throw new Error(
        'Element type is invalid: expected a string (for built-in ' +
          'components) or a class/function (for composite components) ' +
          `but got: ${type}`
      );
    }

    if ((type as VuactComponentTypeInner)._$origin_vue_component) {
      // vue component vueToReact 转换过来的
      return vueComponentElementToVNode(
        element,
        element.type,
        renderContext,
        config
      );
    }

    // react component
    // TODO 可能为 vue component 没有 to-react 处理，需要在 createElement 中报错
    return reactComponentElementToVNode(element);
  }

  if (typeof element === 'boolean') {
    // react boolean 会渲染为 ''
    return '';
  }
  // string | number | null | undefined 或其它非法的 element 类型交给 vue 处理
  return element;
}

function nativeElementToVNode(
  element: VuactElement,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  const props = element.props;
  let vnodeProps: Record<string, any> = element._$vnode_props;
  let children: any;

  if (!vnodeProps) {
    if (config && !config.transformVNodeProps) {
      vnodeProps = Object.create(REACT_VNODE_PROPS_PROTO);
      for (const key in props) {
        const prop = props[key];
        switch (key) {
          case 'children':
          case 'ref':
            break;
          case 'dangerouslySetInnerHTML':
            // dangerouslySetInnerHTML 必须在这里处理，因为 innerHTML 清除是在 patchElement 处理的
            if (prop) {
              vnodeProps.innerHTML = prop.__html;
            }
            break;
          default:
            vnodeProps[key] = prop;
        }
      }
    } else {
      vnodeProps = {};
      for (const key in props) {
        const prop = props[key];
        switch (key) {
          case 'children':
          case 'ref':
            break;
          case 'className':
            vnodeProps.class = prop;
            break;
          case 'style':
            vnodeProps.style = reactStyleToVueStyle(prop);
            break;
          case 'dangerouslySetInnerHTML':
            if (prop) {
              vnodeProps.innerHTML = prop.__html;
            }
            break;
          default:
            if (isOn(key)) {
              processEventProp(key, prop, vnodeProps, element.type as string);
            } else {
              vnodeProps[getAttributeAlias(key)] = prop;
            }
        }
      }
    }

    if (element.key != null) {
      vnodeProps.key = element.key;
    }
    element._$vnode_props = vnodeProps;
  }

  if ('children' in props) {
    children = elementToVNode(props.children, renderContext, config);
    if (isVNode(children)) {
      children = [children];
    }
  } else if (element._$origin_vue_vnode) {
    // element 是由 vnode-to-element 转过来的，且 children 没有被覆盖，使用原始 vnode 的 children
    children = element._$origin_vue_vnode.children;
  }

  const ref = element.ref
    ? reactRefToVueRef(element.ref, renderContext)
    : undefined;

  return _createVNode(element.type, vnodeProps, children, ref);
}

function fragmentElementToVNode(
  element: VuactElement,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  let props: VNodeProps | undefined;
  if (element.key != null) {
    props = {
      key: element.key,
    };
  }
  let children: any;
  const elementProps = element.props;
  if (elementProps.children != null) {
    children = elementToVNode(elementProps.children, renderContext, config);
    if (!Array.isArray(children)) {
      children = [children];
    }
  }
  return createVNode(VFragment, props, children);
}

function portalElementToVNode(
  element: VuactPortal,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  const children = elementToVNode(element.children, renderContext, config);
  return createVNode(
    Teleport,
    {
      key: element.key as any,
      to: element.containerInfo,
    },
    isVNode(children) ? [children] : children
  );
}

function reactPropToSlot(
  prop: any,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  if (typeof prop === 'function') {
    return (...args: any[]) => {
      return elementToVNode(prop(...args), renderContext, config);
    };
  }
  const vnode = elementToVNode(prop, renderContext, config);
  return () => vnode;
}

function elementToSlot(
  element: MaybeElements,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  return () => {
    return elementToVNode(element, renderContext, config);
  };
}

function vueComponentElementToVNode(
  element: VuactElement,
  type: any,
  renderContext?: RenderContext,
  config?: VuactConfig
) {
  const props = element.props;
  const vnodeProps: Record<string, any> = {};
  if (element.key != null) {
    vnodeProps.key = element.key;
  }
  let slots: any;
  for (const key in props) {
    const prop = props[key];
    switch (key) {
      case 'children':
        if (slots == null) {
          slots = {};
        }
        if (typeof prop === 'function') {
          // function as children
          slots.default = reactPropToSlot(prop, renderContext, config);
        } else {
          slots.default = elementToSlot(prop, renderContext, config);
        }
        break;
      case 'className':
        vnodeProps.class = prop;
        break;
      case 'style':
        vnodeProps.style = reactStyleToVueStyle(prop);
        break;
      case 'dangerouslySetInnerHTML':
        if (prop) {
          vnodeProps.innerHTML = prop.__html;
        }
        break;
      default:
        if (key.startsWith(SLOT_PROP_PREFIX)) {
          if (slots == null) {
            slots = {};
          }
          const slotName = key.slice(SLOT_PROP_PREFIX.length);
          slots[slotName] = reactPropToSlot(prop);
        } else {
          vnodeProps[key] = prop;
        }
        break;
    }
  }

  if (element.ref) {
    vnodeProps.ref = reactRefToVueRef(element.ref, renderContext);
  }

  if (element._$origin_vue_vnode) {
    // element 是有 vnode-to-element 转过来的，将原有 slots 中未被覆盖的部分添加到 slots 中
    const vnodeChildren: any = element._$origin_vue_vnode.children;
    if (slots == null) {
      slots = vnodeChildren;
    } else if (isRawSlots(vnodeChildren)) {
      for (const key in vnodeChildren) {
        const slot = vnodeChildren[key];
        if (typeof slot === 'function' && !(key in slots)) {
          slots[key] = slot;
        }
      }
    } else if (!('default' in slots)) {
      slots.default = () => vnodeChildren;
    }
  }

  return createVNode(type, vnodeProps, slots);
}

function reactComponentElementToVNode(element: any) {
  return createVNode(
    reactToVue(element.type),
    element.key != null
      ? {
          $element: element,
          key: element.key,
        }
      : { $element: element }
  );
}

function _createVNode(type: any, props: any, children: any, ref: any) {
  const vnode = createVNode(type, props, children);
  // 目前看 props.ref 没有用，直接设置到 vnode.ref 上(@private 内部 api 可能有兼容性问题)
  if (ref) {
    vnode.ref = {
      i: (vnode as any).ctx,
      r: ref,
      f: false,
    };
  }
  // 标记其是从 element 转过来的
  // Object.defineProperty(vnode, '_$vuact', {
  //   enumerable: false,
  //   value: true,
  // });
  return vnode;
}
