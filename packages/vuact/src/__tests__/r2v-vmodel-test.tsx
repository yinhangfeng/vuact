import { describe, it, expect } from 'vitest';
import { createVNode, render, ref, nextTick, h, defineComponent } from 'vue';
import React, { reactToVue } from 'vuact';
import 'vuact/setup-scheduler';
import 'vuact/setup-renderer';
import 'vuact-dom/register-dom-components';

describe('reactToVue vModel', () => {
  it('default v-model (modelValue)', async () => {
    const ReactCounter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
      return <div data-testid="counter" onClick={() => onChange(value + 1)}>{value}</div>;
    };

    const VReactCounter = reactToVue(ReactCounter, {
      vModel: { prop: 'value', event: 'onChange' },
    });

    const Parent = defineComponent({
      setup() {
        const val = ref(0);
        return () =>
          h(VReactCounter, {
            modelValue: val.value,
            'onUpdate:modelValue': (v: number) => {
              val.value = v;
            },
          });
      },
    });

    const container = document.createElement('div');
    render(h(Parent), container);

    expect(container.querySelector('[data-testid="counter"]')!.textContent).toBe('0');

    container.querySelector('[data-testid="counter"]')!.click();
    await nextTick();

    expect(container.querySelector('[data-testid="counter"]')!.textContent).toBe('1');
  });

  it('named v-model (v-model:open)', async () => {
    const ReactDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
      return <div data-testid="dialog" onClick={() => onOpenChange(!open)}>{open ? 'open' : 'closed'}</div>;
    };

    const VReactDialog = reactToVue(ReactDialog, {
      vModel: { modelName: 'open', prop: 'open', event: 'onOpenChange' },
    });

    const Parent = defineComponent({
      setup() {
        const visible = ref(false);
        return () =>
          h(VReactDialog, {
            open: visible.value,
            'onUpdate:open': (v: boolean) => {
              visible.value = v;
            },
          });
      },
    });

    const container = document.createElement('div');
    render(h(Parent), container);

    expect(container.querySelector('[data-testid="dialog"]')!.textContent).toBe('closed');

    container.querySelector('[data-testid="dialog"]')!.click();
    await nextTick();

    expect(container.querySelector('[data-testid="dialog"]')!.textContent).toBe('open');
  });

  it('multiple v-model specs', async () => {
    const ReactComponent = ({
      value,
      onChange,
      open,
      onOpenChange,
    }: {
      value: number;
      onChange: (v: number) => void;
      open: boolean;
      onOpenChange: (v: boolean) => void;
    }) => {
      return (
        <div>
          <span data-testid="value" onClick={() => onChange(value + 1)}>{value}</span>
          <button data-testid="toggle" onClick={() => onOpenChange(!open)}>{open ? 'open' : 'closed'}</button>
        </div>
      );
    };

    const VReactComponent = reactToVue(ReactComponent, {
      vModel: [
        { prop: 'value', event: 'onChange' },
        { modelName: 'open', prop: 'open', event: 'onOpenChange' },
      ],
    });

    const Parent = defineComponent({
      setup() {
        const val = ref(0);
        const visible = ref(false);
        return () =>
          h(VReactComponent, {
            modelValue: val.value,
            'onUpdate:modelValue': (v: number) => {
              val.value = v;
            },
            open: visible.value,
            'onUpdate:open': (v: boolean) => {
              visible.value = v;
            },
          });
      },
    });

    const container = document.createElement('div');
    render(h(Parent), container);

    expect(container.querySelector('[data-testid="value"]')!.textContent).toBe('0');
    expect(container.querySelector('[data-testid="toggle"]')!.textContent).toBe('closed');

    container.querySelector('[data-testid="value"]')!.click();
    await nextTick();

    expect(container.querySelector('[data-testid="value"]')!.textContent).toBe('1');

    container.querySelector('[data-testid="toggle"]')!.click();
    await nextTick();

    expect(container.querySelector('[data-testid="toggle"]')!.textContent).toBe('open');
  });

  it('v-model with different prop name mapping', async () => {
    const ReactInput = ({ text, onTextChange }: { text: string; onTextChange: (v: string) => void }) => {
      return <input data-testid="input" value={text} onInput={(e: any) => onTextChange(e.target.value)} />;
    };

    const VReactInput = reactToVue(ReactInput, {
      vModel: { prop: 'text', event: 'onTextChange' },
    });

    const Parent = defineComponent({
      setup() {
        const val = ref('hello');
        return () =>
          h(VReactInput, {
            modelValue: val.value,
            'onUpdate:modelValue': (v: string) => {
              val.value = v;
            },
          });
      },
    });

    const container = document.createElement('div');
    render(h(Parent), container);

    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement;
    expect(input.value).toBe('hello');

    input.value = 'world';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await nextTick();

    expect(input.value).toBe('world');
  });

  it('v-model works with Vue defineComponent parent', async () => {
    const ReactSwitch = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) => {
      return <button data-testid="switch" onClick={() => onCheckedChange(!checked)}>{checked ? 'on' : 'off'}</button>;
    };

    const VReactSwitch = reactToVue(ReactSwitch, {
      vModel: { prop: 'checked', event: 'onCheckedChange' },
    });

    const Parent = defineComponent({
      setup() {
        const active = ref(false);
        return () =>
          h(VReactSwitch, {
            modelValue: active.value,
            'onUpdate:modelValue': (v: boolean) => {
              active.value = v;
            },
          });
      },
    });

    const container = document.createElement('div');
    render(h(Parent), container);

    expect(container.querySelector('[data-testid="switch"]')!.textContent).toBe('off');

    container.querySelector('[data-testid="switch"]')!.click();
    await nextTick();

    expect(container.querySelector('[data-testid="switch"]')!.textContent).toBe('on');
  });

  it('v-model without vModel option does not affect normal props', async () => {
    const ReactCounter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
      return <div data-testid="counter" onClick={() => onChange(value + 1)}>{value}</div>;
    };

    const VReactCounter = reactToVue(ReactCounter);

    let emittedValue = 0;
    const container = document.createElement('div');
    const vnode = createVNode(VReactCounter, {
      value: 5,
      onChange: (v: number) => {
        emittedValue = v;
      },
    });
    render(vnode, container);

    expect(container.innerHTML).toBe('<div data-testid="counter">5</div>');

    container.querySelector('[data-testid="counter"]')!.click();
    await nextTick();

    expect(emittedValue).toBe(6);
  });

  it('v-model emit updates the ref value', async () => {
    const ReactCounter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
      return <div data-testid="counter" onClick={() => onChange(value + 1)}>{value}</div>;
    };

    const VReactCounter = reactToVue(ReactCounter, {
      vModel: { prop: 'value', event: 'onChange' },
    });

    const val = ref(0);
    const container = document.createElement('div');
    const vnode = createVNode(VReactCounter, {
      modelValue: val.value,
      'onUpdate:modelValue': (v: number) => {
        val.value = v;
      },
    });
    render(vnode, container);

    expect(container.querySelector('[data-testid="counter"]')!.textContent).toBe('0');

    container.querySelector('[data-testid="counter"]')!.click();
    await nextTick();

    expect(val.value).toBe(1);
  });
});
