# r2v Vue Context

适用于 Vue 侧提供 Vue Context，供 React 组件读取。

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
