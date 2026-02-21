# r2v Vue Context

Use this when you want to provide Vue Context from the Vue side and let a React component read it.

```vue
<script setup lang="ts">
import { r2v } from 'vuact';
import { provide, shallowRef } from 'vue';
import { counterInjectionKey, type CounterContext } from './context';
import Counter from './counter';

const VCounter = r2v(Counter);

const counterContext: CounterContext = {
  count: shallowRef(1),
  setCount: (count) => {
    counterContext.count.value = count;
  },
};

provide(counterInjectionKey, counterContext);
</script>

<template>
  <VCounter />
</template>
```
