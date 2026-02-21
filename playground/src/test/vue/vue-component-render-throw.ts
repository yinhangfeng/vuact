import { createVNode, defineComponent } from 'vue';

export default defineComponent({
  name: 'VueComponentRenderThrow',
  props: {},
  emits: {},
  setup(props, { emit, slots }) {
    return () => {
      throw 'VueComponentRenderThrow';
    };
  },
});
