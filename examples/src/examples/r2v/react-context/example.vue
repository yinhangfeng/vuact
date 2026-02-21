<script setup lang="ts">
/**
 * 向 React 组件传递 React context
 */
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

// provideContext 允许 vue 组件为 react 组件提供 react context
provideContext(CounterContext, counterContextRef);
</script>
<template>
  <VCounter />
</template>
