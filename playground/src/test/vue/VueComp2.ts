import { createVNode, defineComponent } from 'vue';
import VueComp1 from './VueComp1';

export default defineComponent({
  name: 'VueComp2',
  props: {},
  emits: {},
  setup(props, { emit, slots }) {
    return () => {
      // createVNode children 不能直接为 VNode
      return createVNode('div', {}, [
        'VueComp2',
        createVNode(VueComp1, null, {
          slot1: () => 'slot1',
        }),
      ]);
    };
  },
});
