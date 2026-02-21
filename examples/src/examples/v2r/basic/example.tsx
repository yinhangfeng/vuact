/**
 * React 调 Vue 组件基本用法
 */
import { v2r } from 'vuact';
import Counter from './counter.vue';

// Vue 组件转为 React 组件
const RCounter = v2r(Counter);

export default function Example() {
  // class 与 style 可按 react 规范传递
  // 传递给 Vue 组件之后 className 会被转为 class，style object 中 Unitless 样式会自动加上单位
  // 比如 height: 100 => height: '100px'
  return (
    <RCounter defaultCount={1} className="counter" style={{ height: 100 }} />
  );
}
