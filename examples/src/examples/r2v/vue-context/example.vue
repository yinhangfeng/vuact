<script setup lang="ts">
/**
 * 向 React 组件传递 Vue context
 */
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
