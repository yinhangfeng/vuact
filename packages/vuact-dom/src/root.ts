import { createVNode, render as vRender, type AppContext } from 'vue';
import type {
  Container,
  RootOptions,
  Root,
  HydrationOptions,
} from 'react-dom/client';
import type ReactDOMClient from 'react-dom/client';
import {
  deferInTransition,
  reactToVue,
  useConfigProvider,
  Suspense,
  createElement,
  type VuactConfig,
} from 'vuact';
import type { VuactComponentInternalInstance } from 'vuact/src/types';
import { _render, setupIdPrefix, unmountComponentAtNode } from './render';

export const createRoot: typeof ReactDOMClient.createRoot = function createRoot(
  container: Container,
  {
    config,
    identifierPrefix,
    vAppContext,
  }: RootOptions & {
    config?: VuactConfig;
    vAppContext?: AppContext;
  } = {}
): Root {
  // TODO options

  config = {
    asyncMode: true,
    ...config,
  };
  let element: any;

  function VuactRootComponent() {
    return createElement(Suspense, {
      noFallback: true,
      children: element,
    } as any);
  }

  const VuactAsyncRoot = reactToVue(VuactRootComponent, {
    useConfig: () => {
      setupIdPrefix(identifierPrefix);
      return useConfigProvider(config);
    },
  });

  const rootVNode = createVNode(VuactAsyncRoot);
  rootVNode.appContext = vAppContext ?? null;

  return {
    render: (children) => {
      if (!rootVNode.component) {
        if (!(container as any)._vnode) {
          (container as any).innerHTML = '';
        }
        vRender(rootVNode, container as any);
      }
      element = children;
      deferInTransition(() => {
        (
          rootVNode.component as VuactComponentInternalInstance
        )._$vuactInternalInstance!.enqueueUpdate();
      });
    },
    unmount: () => {
      unmountComponentAtNode(container);
    },
    _internalRoot: {
      containerInfo: container,
    },
  } as Root & { _internalRoot: any };
};

export const hydrateRoot: typeof ReactDOMClient.hydrateRoot =
  function hydrateRoot(
    container: Element | Document,
    initialChildren: React.ReactNode,
    options?: HydrationOptions & {
      config?: VuactConfig;
    }
  ): Root {
    // TODO
    return {
      render: (children) => {
        _render(children as any, container, undefined, { isHydrate: true });
      },
      unmount: () => {
        unmountComponentAtNode(container as any);
      },
    };
  };
