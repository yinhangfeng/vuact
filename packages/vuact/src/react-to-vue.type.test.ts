/* eslint-disable */
import { type Ref } from 'vue';
import type RealReact from 'react';
import * as React from './react';
import { reactToVue } from './react-to-vue';

// React class component 类型测试
class ClassComponent1 extends React.Component<{
  string1: string;
  number1: number;
  optional1?: boolean;
}> {
  test() {}
  render() {
    return null;
  }
}

// React function component 类型测试
function FunctionComponent1(props: {
  string1: string;
  number1: number;
  optional1?: boolean;
}) {
  return null;
}

// 带有 renderXXX 方法的组件类型测试
class ComponentWithRenderProps extends React.Component<{
  string1: string;
  renderContent: (value: string) => RealReact.ReactNode;
  renderFooter?: () => RealReact.ReactNode;
}> {
  render() {
    return null;
  }
}

// 带有 ref 和 imperative handle 的组件类型测试
class ComponentWithRef extends React.Component<{
  string1: string;
}> {
  getValue() {
    return 'test';
  }
  render() {
    return null;
  }
}

// 类型测试
function typeTest() {
  // 测试 class component 转换
  const VClassComponent1 = reactToVue(ClassComponent1);
  type VClassComponent1Instance = InstanceType<typeof VClassComponent1>;

  // 验证 props 类型
  const classInstance = {} as VClassComponent1Instance;
  classInstance.$props.string1.toLowerCase();
  classInstance.$props.number1.toFixed();
  classInstance.$props.optional1?.valueOf();
  // @ts-expect-error
  classInstance.$props.notExist;

  // 验证 expose 类型
  const classRef: Ref<{
    instance: InstanceType<typeof ClassComponent1>;
  }> = {} as any;
  classRef.value.instance.test();
  // @ts-expect-error
  classRef.value.instance.notExist();

  // 测试 function component 转换
  const VFunctionComponent1 = reactToVue(FunctionComponent1);
  type VFunctionComponent1Instance = InstanceType<typeof VFunctionComponent1>;

  // 验证 props 类型
  const functionInstance = {} as VFunctionComponent1Instance;
  functionInstance.$props.string1.toLowerCase();
  functionInstance.$props.number1.toFixed();
  functionInstance.$props.optional1?.valueOf();
  // @ts-expect-error
  functionInstance.$props.notExist;

  // 测试 renderXXX 方法转换为 slots
  const VComponentWithRenderProps = reactToVue(ComponentWithRenderProps);
  type VComponentWithRenderPropsInstance = InstanceType<
    typeof VComponentWithRenderProps
  >;

  // 验证 props 和 slots 类型
  const renderPropsInstance = {} as VComponentWithRenderPropsInstance;
  renderPropsInstance.$props.string1.toLowerCase();

  // 验证 slots 类型
  const renderPropsSlots = renderPropsInstance.$slots;
  renderPropsSlots.content?.('test');
  renderPropsSlots.footer?.();

  // 测试带有 ref 的组件
  const VComponentWithRef = reactToVue(ComponentWithRef);
  type VComponentWithRefInstance = InstanceType<typeof VComponentWithRef>;

  // 验证 ref 类型
  const refComponentRef: Ref<{
    instance: InstanceType<typeof ComponentWithRef>;
  }> = {} as any;
  refComponentRef.value.instance.getValue();
  // @ts-expect-error
  refComponentRef.value.instance.notExist();
}
