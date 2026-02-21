/**
 * React 调 Vue 组件 slot 用法
 */
import { v2r } from 'vuact';
import SlotsComponent from './slots.vue';

const RSlotsComponent = v2r(SlotsComponent);

export default function Example() {
  return [
    // slot: 前缀开头的属性会作为 slot 传递给 vue 组件，可以直接传递 element 也可以传递渲染函数
    <RSlotsComponent slot:title={<div>title</div>} />,
    <RSlotsComponent
      slot:title={({ count }) => {
        return <div>renderTitle {count}</div>;
      }}
    />,
    <RSlotsComponent>
      <div>children</div>
    </RSlotsComponent>,
    // React function as children 用法
    <RSlotsComponent>
      {({ count }) => {
        return <div>children {count}</div>;
      }}
    </RSlotsComponent>,
  ];
}
