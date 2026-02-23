# r2v React Context

适用于在 Vue 侧为 React 组件提供 React Context。

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
