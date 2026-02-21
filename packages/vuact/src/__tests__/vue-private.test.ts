import { describe, it, expect } from 'vitest';
import {
  createVNode,
  ref,
  ReactiveEffect,
  defineComponent,
  h,
  getCurrentInstance,
  render,
  type ComponentInternalInstance,
  nextTick,
} from 'vue';

describe('vue private api', () => {
  it('vnode.ref', () => {
    const vnode = createVNode('div', {
      ref: ref(),
    });
    expect(vnode.ref).toBeDefined();
    expect('i' in vnode.ref!).toBeTruthy();
    expect('r' in vnode.ref!).toBeTruthy();
  });

  it('ReactiveEffect', () => {
    const ref1 = ref(0);
    const fn = () => {
      return ref1.value;
    };
    const renderEffect = new ReactiveEffect(fn);
    let schedulerCalledCount = 0;
    renderEffect.scheduler = () => {
      ++schedulerCalledCount;
    };
    expect(renderEffect.fn).toBe(fn);
    expect(renderEffect.run()).toBe(0);
    ref1.value++;
    expect(schedulerCalledCount).toBe(1);
    expect(renderEffect.run()).toBe(1);
  });

  it('ComponentInternalInstance.effect', async () => {
    let instance: ComponentInternalInstance = null as any;
    let setEffectCalledCount = 0;
    let componentUpdateCalledCount = 0;
    const ref1 = ref(0);

    const Component = defineComponent({
      name: 'TestComponent',
      setup() {
        instance = getCurrentInstance()!;

        Object.defineProperty(instance, 'effect', {
          configurable: true,
          set(effect: ReactiveEffect) {
            ++setEffectCalledCount;
            const originComponentUpdateFn = effect.fn;
            effect.fn = function componentUpdateFn() {
              ++componentUpdateCalledCount;
              originComponentUpdateFn();
            };
            Object.defineProperty(instance, 'effect', {
              configurable: true,
              writable: true,
              value: effect,
            });
          },
        });

        return () => {
          return h('div', {
            class: `cls${ref1.value}`,
          });
        };
      },
    });

    const container = document.createElement('div');
    render(h(Component), container);
    expect(instance).toBeDefined();
    expect(instance.effect).toBeDefined();
    expect(setEffectCalledCount).toBe(1);
    expect(componentUpdateCalledCount).toBe(1);
    ref1.value++;
    await nextTick();
    expect(setEffectCalledCount).toBe(1);
    expect(componentUpdateCalledCount).toBe(2);
    expect(container.innerHTML).toBe('<div class="cls1"></div>');
  });
});
