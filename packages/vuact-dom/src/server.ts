import { renderToString as vRenderToString } from '@vue/server-renderer';
import version from 'vuact-shared/src/ReactVersion';
import type { ServerOptions } from 'react-dom/server';
import type { ReactNode } from 'react';
import { createRootNode } from './render';

// TODO vue renderToString 是异步的无法与 react 对齐
export function renderToString(element: ReactNode, options?: ServerOptions) {
  const root = createRootNode(element, {
    isSSR: true,
    // @vue/server-renderer 不会走 rendererOptions，所以需要开启 transformVNodeProps
    transformVNodeProps: true,
  });
  return vRenderToString(root);
}

export function renderToStaticMarkup() {}
export function renderToNodeStream() {}
export function renderToStaticNodeStream() {}

export function renderToPipeableStream() {}

export { version };

export default {
  version,
  renderToString,
  renderToStaticMarkup,
  renderToNodeStream,
  renderToStaticNodeStream,
  renderToPipeableStream,
};
