import {
  h,
  defineComponent,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
} from 'vue';

const Child = defineComponent({
  setup() {
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
    return () => {
      return h('div');
    };
  },
});

export default defineComponent({
  setup(props, { emit }) {
    return () => {
      return h(Child, {
        ref: (ref) => {
          console.log('Child ref', ref);
        },
      });
    };
  },
});
