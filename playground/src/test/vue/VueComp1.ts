import { createVNode, defineComponent } from 'vue';

export default defineComponent({
  name: 'VueComp1',
  props: {},
  emits: {},
  setup(props, { emit, slots }) {
    console.log('VueComp1 setup slot1', slots.slot1?.());

    return () => {
      console.log('VueComp1 render slot1', slots.slot1?.());
      // createVNode children 不能直接为 VNode
      return createVNode('div', {}, [createVNode('div', {}, 'xxx')]);
    };
  },
});
