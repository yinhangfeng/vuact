# v2r 事件回调

适用于 React 侧向 Vue 组件传递更新事件。

```tsx
import { v2r } from 'vuact';
import { useState } from 'react';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const [count, setCount] = useState(1);
  return <RCounter count={count} onUpdate:count={setCount} />;
}
```
