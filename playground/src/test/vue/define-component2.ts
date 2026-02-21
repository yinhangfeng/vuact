import { vueToReact } from 'vuact';
import { h, defineComponent } from 'vue';

interface Props {
  string1: string;
  number1: number;
}

export const DefineComponent2 = defineComponent((props: Props) => {
  return () => {
    return h('div', null, 'DefineComponent2');
  };
});

export const RDefineComponent2 = vueToReact(DefineComponent2);
