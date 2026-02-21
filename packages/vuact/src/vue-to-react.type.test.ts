/* eslint-disable */
import { type DefineComponent, defineComponent } from 'vue';
import { vueToReact } from './vue-to-react';

// Vue defineComponent 组件类型测试
const VueComponent1 = defineComponent({
  name: 'VueComponent1',
  props: {
    string1: {
      type: String,
      required: true,
    },
    number1: {
      type: Number,
      required: true,
    },
    optional1: {
      type: Boolean,
      required: false,
    },
  },
  emits: {
    test: (value: string) => true,
  },
  setup(props) {
    return () => {};
  },
});

// Vue defineComponent 组件带有 slots 类型测试
const VueComponentWithSlots: DefineComponent<{
  string1?: string;
}> & {
  new (): {
    $slots: {
      content: (value: string) => any;
      footer?: () => any;
    };
  };
} = defineComponent({}) as any;

// Vue defineComponent 组件带有 ref 类型测试
const VueComponentWithRef = defineComponent({
  name: 'VueComponentWithRef',
  props: {
    string1: {
      type: String,
      required: true,
    },
  },
  setup() {
    function getValue() {
      return 'test';
    }
    return {
      getValue,
    };
  },
});

// 类型测试
function typeTest() {
  // 测试 defineComponent 组件转换
  const RVueComponent1 = vueToReact(VueComponent1);
  type RVueComponent1Props = React.ComponentProps<typeof RVueComponent1>;

  // 验证 props 类型
  const props: RVueComponent1Props = {
    string1: 'test',
    number1: 123,
    optional1: true,
  };
  props.string1.toLowerCase();
  props.number1.toFixed();
  props.optional1?.valueOf();
  // @ts-expect-error
  props.notExist;

  // 测试带有 slots 的组件转换
  const RVueComponentWithSlots = vueToReact(VueComponentWithSlots);
  type RVueComponentWithSlotsProps = React.ComponentProps<
    typeof RVueComponentWithSlots
  >;

  // 验证 props 和 renderXXX 方法类型
  const slotsProps: RVueComponentWithSlotsProps = {
    string1: 'test',
    'slot:content': (value: string) => null,
    'slot:footer': () => null,
  };
  slotsProps.string1?.toLowerCase();
  // slotsProps['slot:content']?.('test');
  // slotsProps['slot:footer']?.();

  // 测试带有 ref 的组件
  const RVueComponentWithRef = vueToReact(VueComponentWithRef);
  type RVueComponentWithRefProps = React.ComponentProps<
    typeof RVueComponentWithRef
  >;

  // 验证 ref 类型
  const refProps: RVueComponentWithRefProps = {
    string1: 'test',
    ref: (instance) => {
      instance?.getValue();
      // @ts-expect-error
      instance?.notExist();
    },
  };
}
