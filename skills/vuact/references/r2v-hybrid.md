# r2v 混合组件

适用于在 Vue JSX 环境中编写 React 组件，并同时使用 Vue hooks。

```tsx
import { useVueEffectScope } from 'vuact';
import { useState } from 'react';
import { onScopeDispose, ref, watch } from 'vue';

export default function Counter({ defaultCount = 0 }: { defaultCount?: number }) {
  const [count1, setCount] = useState(defaultCount);

  const { count: count2 } = useVueEffectScope((args) => {
    const count = ref(args.value);
    watch(args, (v) => {
      count.value = v;
    });

    onScopeDispose(() => {
      console.log('scope disposed');
    });
    return { count };
  }, defaultCount);

  return (
    <div>
      <p>
        count1: {count1} count2: {count2.value}
      </p>
      <button onClick={() => setCount(count1 + 1)}>count1</button>
      <button onClick={() => count2.value++}>count2</button>
    </div>
  );
}
```
