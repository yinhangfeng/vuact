import { render, defineComponent, h, ref } from 'vue';

export default defineComponent({
  name: 'RenderTest',
  props: {},
  emits: {},
  setup(props) {
    const count = ref(0);

    let refCallback: any;

    function createRefCallback() {
      const i = count.value++;
      // vue 目前 3.4  rendererTemplateRef/setRef 不会对 old function ref 回调 null
      refCallback = (el: HTMLElement) => {
        console.log('refCallback', i, el);
      };
    }
    createRefCallback();

    const ref1 = ref();
    const ref2 = ref();
    const eleRef = ref1;

    return () => {
      return h('div', { ref: refCallback }, [
        h(
          'button',
          {
            ref: eleRef,
            onClick: () => {
              eleRef.value = eleRef.value === ref1.value ? ref2 : ref1;
              createRefCallback();
            },
          },
          'test' + count.value
        ),
        h(
          'div',
          null,
          JSON.stringify({
            ref1: !!ref1.value,
            ref2: !!ref2.value,
          })
        ),
      ]);
    };
  },
});
