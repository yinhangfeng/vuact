import * as Vue from 'vue';
import { REACT_VNODE_PROPS_PROTO } from './constants';
import { reactStyleToVueStyle } from './style';
import {
  CHANGE_EVENT_ELEMENTS,
  createEventProxy,
  isOn,
  normalizeEventPropKey,
  onInputForChange,
} from './event';
import getAttributeAlias from './get-attribute-alias';
import { globalConfig } from './config';

/**
 * 扩展 vue rendererOptions，实现部分对齐 react-dom
 */
export function setupRenderer() {
  if (globalConfig.vuactRendererEnabled) {
    return;
  }

  const vue: any = Vue;
  // rspack 构建时不能直接使用 Vue.rendererOptions，好像 rspack 会分析是否真的导出了 rendererOptions
  const rendererOptions: Vue.RendererOptions = vue.rendererOptions;
  if (!rendererOptions) {
    return;
  }

  globalConfig.vuactRendererEnabled = true;
  globalConfig.transformVNodeProps = false;

  const originCreateElement = rendererOptions.createElement;
  rendererOptions.createElement = (tag, namespace, is, props) => {
    const element = originCreateElement(tag, namespace, is, props);
    if (props && Object.getPrototypeOf(props) === REACT_VNODE_PROPS_PROTO) {
      // 扩展 element
      // 标记 element 是 vuact 渲染的
      Object.defineProperty(element, '_$vuact', {
        enumerable: false,
        value: true,
      });

      enhanceElementEvent(element as VuactHTMLElement);
    }
    return element;
  };

  const originPatchProp = rendererOptions.patchProp;
  rendererOptions.patchProp = (
    el,
    key,
    prevValue,
    nextValue,
    namespace,
    parentComponent
  ) => {
    if (el._$vuact) {
      switch (key) {
        case 'className':
          key = 'class';
          break;
        case 'style':
          // `@vue/runtime-com` 中只有 style 需要 prevValue，且只需要 prevValue 的 keys 所以 prevValue 不需要处理
          nextValue = reactStyleToVueStyle(nextValue);
          break;
        case 'formAction':
          Object.defineProperty(el, '_$formAction', {
            enumerable: false,
            value: nextValue,
            configurable: true,
          });
          if (typeof nextValue === 'function') {
            nextValue = undefined;
          }
          break;
        default:
          if (isOn(key)) {
            key = normalizeEventPropKey(key);
          } else {
            key = getAttributeAlias(key);
          }
      }
    }
    return originPatchProp(
      el,
      key,
      prevValue,
      nextValue,
      namespace,
      parentComponent
    );
  };
}

export interface VuactHTMLElement extends HTMLElement {
  _$vuact?: boolean;
  _$originAddEventListener?: any;
  _$originRemoveEventListener?: any;
  _$changeEventEnhanced?: boolean;
}

function addEventListener(
  this: VuactHTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
) {
  if (typeof listener !== 'function') {
    return this._$originAddEventListener!(type, listener, options);
  }

  const result = this._$originAddEventListener!(
    type,
    createEventProxy(listener),
    options
  );

  if (type === 'change') {
    if (
      !this._$changeEventEnhanced &&
      CHANGE_EVENT_ELEMENTS[this.tagName.toLowerCase()]
    ) {
      this._$changeEventEnhanced = true;
      this._$originAddEventListener!('input', onInputForChange);
    }
  } else if (type === 'input' && this._$changeEventEnhanced) {
    // 将 onInputForChange 调整到最后
    this._$originRemoveEventListener('input', onInputForChange);
    this._$originAddEventListener!('input', onInputForChange);
  }

  return result;
}

function removeEventListener(
  this: VuactHTMLElement,
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
) {
  return this._$originRemoveEventListener!(
    type,
    (listener as any)._$proxy || listener,
    options
  );
}

function enhanceElementEvent(element: VuactHTMLElement) {
  element._$originAddEventListener = element.addEventListener;
  element._$originRemoveEventListener = element.removeEventListener;
  element.addEventListener = addEventListener;
  element.removeEventListener = removeEventListener;
}
