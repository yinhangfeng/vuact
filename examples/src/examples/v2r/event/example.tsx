/**
 * React 调 Vue 组件并传递事件属性
 */
import { v2r } from 'vuact';
import { useState } from 'react';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const [count, setCount] = useState(1);
  return <RCounter count={count} onUpdate:count={setCount} />;
}
