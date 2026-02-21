import { h, ref, defineComponent } from 'vue';

const aaa = ref(0);
const bbb = ref(0);

const Child = defineComponent({
  props: ['aaa'],
  setup(props) {
    return () => {
      console.log('Child render', props);
      return h('div', null, 'Test1 ' + props.aaa + ' ' + bbb.value);
    };
  },
});

const Parent = defineComponent({
  setup() {
    return () => {
      console.log('Parent render');
      bbb.value = Date.now();
      return h(Child, {
        aaa: aaa.value,
      });
    };
  },
});

export default defineComponent({
  setup() {
    return () => {
      return h('div', {}, [
        h(Parent),
        h(
          'button',
          {
            onClick: () => {
              aaa.value++;
            },
          },
          'test'
        ),
      ]);
    };
  },
});
