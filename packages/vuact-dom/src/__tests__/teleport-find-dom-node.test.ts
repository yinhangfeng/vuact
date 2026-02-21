import { describe, it, expect } from 'vitest';
import { createElement, Component } from 'vuact';
import { createRoot } from 'vuact-dom/client';
import { createPortal, findDOMNode } from 'vuact-dom';

describe('external dom modification test', () => {
  it('should not throw when external clear empty dom', async () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    const portalContainer = document.createElement('div');

    let teleportDom: any;

    function Portal() {
      return createPortal(
        [createElement('div', {}, 'test1'), createElement('div', {}, 'test2')],
        portalContainer
      );
    }

    class Test extends Component {
      componentDidMount() {
        teleportDom = findDOMNode(this);
      }

      render() {
        return [null, createElement(Portal)];
      }
    }

    root.render(createElement(Test));

    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(teleportDom.innerHTML).toBe('test1');
  });
});
