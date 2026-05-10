import { describe, it, expect } from 'vitest';
import { createVNode, render } from 'vue';
import React, { reactToVue } from 'vuact';

describe('reactToVue eventMapping', () => {
  it('should emit mapped event with stripOnPrefix default true', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (props: { onChange?: (v: string) => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('change-val'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {},
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    expect(events).toEqual([{ event: 'change', val: 'change-val' }]);
  });

  it('should strip on prefix and lowercase first char', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (
        props: {
          onChange?: (v: string) => void;
          onClick?: (v: string) => void;
          onOpenChange?: (v: string) => void;
        },
        ref
      ) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('v1'),
          triggerClick: () => props.onClick?.('v2'),
          triggerOpenChange: () => props.onOpenChange?.('v3'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: { stripOnPrefix: true },
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
      onClick: (val: string) => events.push({ event: 'click', val }),
      onOpenChange: (val: string) =>
        events.push({ event: 'openChange', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    vnode.component!.exposed.instance.triggerClick();
    vnode.component!.exposed.instance.triggerOpenChange();

    expect(events).toEqual([
      { event: 'change', val: 'v1' },
      { event: 'click', val: 'v2' },
      { event: 'openChange', val: 'v3' },
    ]);
  });

  it('should not map events when stripOnPrefix is false and no custom mapping', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (props: { onChange?: (v: string) => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('direct-val'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: { stripOnPrefix: false },
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    expect(events).toEqual([{ event: 'change', val: 'direct-val' }]);
  });

  it('should use custom event name mapping', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (props: { onSearch?: (v: string) => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          triggerSearch: () => props.onSearch?.('search-val'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {
        custom: { onSearch: 'search' },
      },
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onSearch: (val: string) => events.push({ event: 'search', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerSearch();
    expect(events).toEqual([{ event: 'search', val: 'search-val' }]);
  });

  it('should let custom mapping override stripOnPrefix', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (
        props: {
          onChange?: (v: string) => void;
          onSearch?: (v: string) => void;
        },
        ref
      ) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('v1'),
          triggerSearch: () => props.onSearch?.('v2'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {
        custom: { onChange: 'valueChange', onSearch: 'search' },
      },
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) =>
        events.push({ event: 'valueChange', val }),
      onSearch: (val: string) => events.push({ event: 'search', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    vnode.component!.exposed.instance.triggerSearch();

    expect(events).toEqual([
      { event: 'valueChange', val: 'v1' },
      { event: 'search', val: 'v2' },
    ]);
  });

  it('should not emit when eventMapping is not provided (backward compatible)', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (props: { onChange?: (v: string) => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('backward-val'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent);

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    expect(events).toEqual([{ event: 'change', val: 'backward-val' }]);
  });

  it('should not wrap non-function onXxx values', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (
        props: { onChange?: (v: string) => void; onFlag?: boolean },
        ref
      ) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('val'),
          getFlag: () => props.onFlag,
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {},
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
      onFlag: true,
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    expect(events).toEqual([{ event: 'change', val: 'val' }]);
    expect(vnode.component!.exposed.instance.getFlag()).toBe(true);
  });

  it('should handle custom mapping with stripOnPrefix false', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (
        props: {
          onChange?: (v: string) => void;
          onSearch?: (v: string) => void;
        },
        ref
      ) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('v1'),
          triggerSearch: () => props.onSearch?.('v2'),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {
        stripOnPrefix: false,
        custom: { onSearch: 'search' },
      },
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (val: string) => events.push({ event: 'change', val }),
      onSearch: (val: string) => events.push({ event: 'search', val }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    vnode.component!.exposed.instance.triggerSearch();

    expect(events).toEqual([
      { event: 'change', val: 'v1' },
      { event: 'search', val: 'v2' },
    ]);
  });

  it('should pass multiple arguments to emit', () => {
    const events: any[] = [];

    const ReactComponent = React.forwardRef(
      (props: { onChange?: (a: string, b: number) => void }, ref) => {
        React.useImperativeHandle(ref, () => ({
          triggerChange: () => props.onChange?.('hello', 42),
        }));
        return <div>test</div>;
      }
    );

    const VComponent = reactToVue(ReactComponent, {
      eventMapping: {},
    });

    const container = document.createElement('div');
    const vnode = createVNode(VComponent, {
      onChange: (a: string, b: number) =>
        events.push({ event: 'change', a, b }),
    });
    render(vnode, container);

    vnode.component!.exposed.instance.triggerChange();
    expect(events).toEqual([{ event: 'change', a: 'hello', b: 42 }]);
  });
});
