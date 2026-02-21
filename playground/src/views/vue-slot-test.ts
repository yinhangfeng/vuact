import {
  h,
  ref,
  computed,
  defineComponent,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  createVNode,
  Fragment,
} from 'vue';

const Child = defineComponent({
  setup(props, { slots, attrs }) {
    onMounted(() => {
      console.log('Child onMounted');
    });
    onBeforeUpdate(() => {
      console.log('Child onBeforeUpdate');
    });
    onUpdated(() => {
      console.log('Child onUpdated');
    });
    onBeforeUnmount(() => {
      console.log('Child onBeforeUnmount');
    });

    const xxx = computed(() => {
      console.log('xxx computed');
      slots.default;
      return attrs.xxx;
    });

    let oldSlots: any;

    return () => {
      console.log(
        'Child render',
        // vue 中 normalizeSlot 所以传入 slots 函数每次都是新的
        oldSlots?.default === slots.default,
        oldSlots?.slot1 === slots.slot1,
        xxx.value
      );
      oldSlots = {
        ...slots,
      };
      return h('div', null, [slots.default?.(), slots.slot1?.()]);
    };
  },
});

const Test2 = defineComponent({
  setup(props, { slots, attrs }) {
    onMounted(() => {
      console.log('Test2 onMounted');
    });
    onBeforeUpdate(() => {
      console.log('Test2 onBeforeUpdate');
    });
    onUpdated(() => {
      console.log('Test2 onUpdated');
    });
    onBeforeUnmount(() => {
      console.log('Test2 onBeforeUnmount');
    });

    return () => {
      console.log('Test2 render');
      return h('div', null, slots.default?.());
    };
  },
});

export default defineComponent({
  setup(props, { emit }) {
    const ref1 = ref(0);
    const ref2 = ref(0);
    const test3 = ref(false);
    const test4 = ref(false);
    const test5 = ref(false);

    function slot1() {
      return `slot1 ${ref2.value}`;
    }

    return () => {
      const defaultSlot = () => {
        return 'child default';
      };
      return h('div', null, [
        h(
          'button',
          {
            onClick: () => {
              ref1.value++;
            },
          },
          `test1 ${ref1.value}`
        ),
        h(
          'button',
          {
            onClick: () => {
              ref2.value++;
            },
          },
          'test2'
        ),
        // 只要传了 slots 就算 props slots 都没变也会导致子组件重新渲染
        h(
          Child,
          {
            bbb: ref1.value,
          },
          {
            default: defaultSlot,
            slot1,
          }
        ),

        h(
          'button',
          {
            onClick: () => {
              test3.value = !test3.value;
            },
          },
          `test3`
        ),
        test3.value && [
          createVNode('div', null, 'div1'),
          createVNode('div', null, ['div2']),
          createVNode('div', null, () => 'div3'),
          createVNode('div', null, { default: () => 'div4' }),
        ],

        h(
          'button',
          {
            onClick: () => {
              test4.value = !test4.value;
            },
          },
          `test4`
        ),
        test4.value && [
          createVNode(Test2, null, 'test2_1'),
          createVNode(Test2, null, ['test2_2']),
          createVNode(Test2, null, () => 'test2_3'),
          createVNode(Test2, null, { default: () => 'test2_4' }),
        ],

        h(
          'button',
          {
            onClick: () => {
              test5.value = !test5.value;
            },
          },
          `test5`
        ),
        test5.value && [
          // createVNode(Fragment, null, 'test5_1'),
          createVNode(Fragment, null, ['test5_2']),
          // createVNode(Fragment, null, () => 'test5_3'),
          // createVNode(Fragment, null, { default: () => 'test5_4' }),
        ],
      ]);
    };
  },
});
