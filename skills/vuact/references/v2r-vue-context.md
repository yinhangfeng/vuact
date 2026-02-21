# v2r Vue Context

适用于在 React 侧为 Vue 组件提供 Vue Context。

```tsx
import { v2r, VueContextProvider } from 'vuact';
import { useMemo } from 'react';
import { shallowRef } from 'vue';
import Counter from './counter.vue';
import { type CounterContext, counterInjectionKey } from './context';

const RCounter = v2r(Counter);

export default function Example() {
  const counterContext = useMemo(() => {
    const count = shallowRef(1);
    return {
      count,
      setCount: (c) => {
        count.value = c;
      },
    } as CounterContext;
  }, []);

  return (
    <VueContextProvider contextKey={counterInjectionKey} value={counterContext}>
      <RCounter defaultCount={1} />
    </VueContextProvider>
  );
}
```
