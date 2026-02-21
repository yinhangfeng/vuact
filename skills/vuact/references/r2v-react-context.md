# r2v React Context

Use this when you want to provide React Context to a React component from the Vue side.

```tsx
import { provideContext, r2v } from 'vuact';
import { shallowRef } from 'vue';
import Counter, { CounterContext } from './counter';

const VCounter = r2v(Counter);

function setCount(count: number) {
  counterContextRef.value = {
    ...counterContextRef.value,
    count,
  };
}

const counterContextRef = shallowRef({
  count: 1,
  setCount,
});

provideContext(CounterContext, counterContextRef);

export default {
  components: { VCounter },
};
```
