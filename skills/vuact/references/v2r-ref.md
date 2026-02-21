# v2r 获取组件 ref

适用于在 React 侧访问 Vue 组件实例暴露的方法。

```tsx
import { useRef, v2r, type ReactComponentRefType } from 'vuact';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const counterRef = useRef<ReactComponentRefType<typeof RCounter>>(null);
  return (
    <div>
      <button onClick={() => counterRef.current?.incCount()}>incCount</button>
      <RCounter ref={(ref) => ref?.incCount} defaultCount={1} />
    </div>
  );
}
```
