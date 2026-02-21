import { h } from 'vue';
import { vueToReact } from 'vuact';

export const ComponentOptions1 = {
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
};

export const RComponentOptions1 = vueToReact(ComponentOptions1);
