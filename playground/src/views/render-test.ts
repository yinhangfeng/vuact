import { render, defineComponent, h, ref } from 'vue';
import VueComponentRenderThrow from '../test/vue/vue-component-render-throw';

const Test = defineComponent({
  setup() {
    console.log('Test setup');
    return () => {
      console.log('Test render');
      return '123';
    };
  },
});

export default defineComponent({
  name: 'RenderTest',
  props: {},
  emits: {},
  setup(props) {
    const dom = ref<HTMLElement>();

    return () => {
      return h('div', { ref: dom }, [
        h(
          'button',
          {
            onClick: () => {
              render(h(Test), dom.value!);
              render(
                h(Test, {
                  ref: (ref) => {
                    console.log('ref');
                  },
                }),
                dom.value!
              );
            },
          },
          'test'
        ),
        h(
          'button',
          {
            onClick: () => {
              try {
                render(
                  h(VueComponentRenderThrow),
                  document.createElement('div')
                );
              } catch (err) {
                console.log('render error', err);
              }
            },
          },
          'test1'
        ),
      ]);
    };
  },
});
