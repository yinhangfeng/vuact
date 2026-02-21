import { defineComponent, ref, computed, watch, h, effect } from 'vue';

export default defineComponent({
  name: 'ComputedTest',
  props: {},
  emits: {},
  setup(props) {
    const ref1 = ref(0);

    let isInRender = false;

    const computed1 = computed(() => {
      console.log('computed1', isInRender);
      if (!isInRender) {
        return 0;
      }
      return ref1.value;
      // return 1;
    });

    console.log('before watch computed1');
    // watch(
    //   () => {
    //     console.log(
    //       'watch source before computed1.value _dirtyLevel',
    //       computed1._dirtyLevel
    //     );
    //     const v = computed1.value;
    //     console.log(
    //       'watch source after computed1.value _dirtyLevel',
    //       computed1._dirtyLevel
    //     );
    //     return v;
    //   },
    //   (v) => {
    //     console.log('watch computed1 callback', v);
    //   }
    // );

    return () => {
      isInRender = true;
      console.log(
        'render before computed1.value _dirtyLevel',
        computed1.effect._dirtyLevel
      );
      const v = computed1.value;
      console.log(
        'render after computed1.value _dirtyLevel',
        computed1.effect._dirtyLevel
      );
      isInRender = false;

      return h('div', {}, [
        h(
          'button',
          {
            onClick: () => {
              ref1.value++;
            },
          },
          `inc ref1 ${v}`
        ),
      ]);
    };
  },
});
