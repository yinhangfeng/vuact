<script setup lang="ts">
import { inject } from 'vue';
import { counterInjectionKey } from './context';

const counterContext = inject(counterInjectionKey)!;
const { count } = counterContext;

function onClick() {
  counterContext.setCount(count.value + 1);
}
</script>

<template>
  <div>
    <p>You clicked {{ count }} times</p>
    <button @click="onClick">Click me</button>
  </div>
</template>
