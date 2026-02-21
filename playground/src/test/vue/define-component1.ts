import { vueToReact } from 'vuact';
import { h, defineComponent } from 'vue';

export const DefineComponent1 = defineComponent({
  props: {
    string1: {
      type: String,
    },
    number1: {
      type: Number,
    },
  },
  setup() {
    return () => {
      return h('div', null, 'DefineComponent1');
    };
  },
});

export const RDefineComponent1 = vueToReact(DefineComponent1);
