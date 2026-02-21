# v2r Vue Context

Use this when you want to provide Vue Context to a Vue component from the React side.

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
