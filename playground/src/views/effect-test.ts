import {
  defineComponent,
  ref,
  h,
  ReactiveEffect,
  getCurrentInstance,
} from 'vue';

export default defineComponent({
  name: 'EffectTest',
  props: {},
  emits: {},
  setup(props) {
    const vInstance = getCurrentInstance()!;

    // vInstance.effect.dirty

    const ref1 = ref(0);

    const effect = new ReactiveEffect(
      () => {
        const v = ref1.value;
        console.log('ReactiveEffect fn', v);
        return v;
      },
      () => {
        console.log('ReactiveEffect trigger');
        vInstance.proxy?.$forceUpdate();
        // vInstance.proxy?.$forceUpdate();
      },
      () => {
        console.log('ReactiveEffect scheduler');
      }
    );

    return () => {
      console.log('EffectTest render before effect.run()', effect._dirtyLevel);
      const v = effect.run();
      console.log('EffectTest render after effect.run()', effect._dirtyLevel);

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
