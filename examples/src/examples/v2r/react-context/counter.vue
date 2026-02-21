<script setup lang="ts">
import { injectContext } from 'vuact';
import { CounterContext } from './context';

// 使用 injectContext 在 vue 组件中获取 react 的 context，获取到的 context 是原始 context 值的 shallowRef
const counterContextRef = injectContext(CounterContext);

function onClick() {
  counterContextRef.value.setCount(counterContextRef.value.count + 1);
}
</script>

<template>
  <div>
    <p>You clicked {{ counterContextRef.count }} times</p>
    <button @click="onClick">Click me</button>
  </div>
</template>
