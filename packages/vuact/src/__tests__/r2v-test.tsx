import { describe, it, expect } from 'vitest';
import { createVNode, render } from 'vue';
import React, { reactToVue } from 'vuact';

describe('reactToVue', () => {
  it('class component to vue', () => {
    class ReactTestComponent {
      render() {
        return <div>test</div>;
      }
    }
    const VReactTestComponent = reactToVue(ReactTestComponent);
    const container = document.createElement('div');
    const vnode = createVNode(VReactTestComponent, {});
    render(vnode, container);
    expect(container.innerHTML).toBe('<div>test</div>');
    expect(vnode.component!.exposed.instance).toBeInstanceOf(
      ReactTestComponent
    );
  });

  it('function component to vue', () => {
    const ReactTestComponent = React.forwardRef((props, ref) => {
      React.useImperativeHandle(
        ref,
        () => ({
          xxx: 1,
        }),
        []
      );
      return <div>test</div>;
    });
    const VReactTestComponent = reactToVue(ReactTestComponent);
    const container = document.createElement('div');
    const vnode = createVNode(VReactTestComponent, {});
    render(vnode, container);
    expect(container.innerHTML).toBe('<div>test</div>');
    expect(vnode.component!.exposed!.instance.xxx).toBe(1);
  });
});
