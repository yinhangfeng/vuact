import {
  render as vRender,
  hydrate as vHydrate,
  createVNode,
  getCurrentInstance,
} from 'vue';
import { reactToVue, useConfigProvider, type Config } from 'vuact';
import type { Container, Renderer } from 'react-dom';
import type ReactDOM from 'react-dom';

let globalIdPrefix = 0;

export function setupIdPrefix(prefix?: string) {
  const ids = (getCurrentInstance() as any).ids;
  ids[0] = `${prefix ? prefix + '_' : ''}${globalIdPrefix++}_${ids[0]}`;
}

export function VuactRootComponent(props: { children?: any }) {
  return props.children;
}

const VuactSyncRoot = reactToVue(VuactRootComponent, {
  useConfig: () => {
    setupIdPrefix();
    return useConfigProvider((getCurrentInstance()!.props as any).config);
  },
});

VuactSyncRoot.props = {
  config: Object,
};

export function createRootNode(element: any, config?: Config) {
  return createVNode(VuactSyncRoot, { children: element, config });
}

export function _render(
  element: any,
  container: Container | null,
  callback?: () => void,
  options?: {
    isHydrate?: boolean;
    config?: Config;
  }
) {
  const root = createRootNode(element, {
    asyncMode: false,
    ...options?.config,
  });
  // TODO vue app 处理
  if (options?.isHydrate) {
    vHydrate(root as any, container as any);
  } else {
    if (container && !(container as any)._vnode) {
      (container as any).innerHTML = '';
    }
    vRender(root as any, container as any);
  }

  const vnode = root.component?.subTree;

  let instance: any = null;
  if (vnode) {
    if (vnode.component) {
      instance = vnode.component.exposed?.instance ?? null;
    } else {
      instance = vnode.el ?? null;
    }
  }

  if (typeof callback === 'function') {
    callback.call(instance);
  }

  return instance;
}

export const render: Renderer = function render(
  element: any,
  container: Container | null,
  callback?: () => void
) {
  return _render(element, container, callback);
};

export const hydrate: Renderer = function hydrate(
  element: any,
  container: Container | null,
  callback?: () => void
) {
  return _render(element, container, callback, {
    isHydrate: true,
  });
};

export const unmountComponentAtNode: typeof ReactDOM.unmountComponentAtNode =
  function unmountComponentAtNode(container: Element | DocumentFragment) {
    if (!(container as any)?._vnode) {
      return false;
    }
    vRender(null, container as any);
    return true;
  };
