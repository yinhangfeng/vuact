<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);

function onClick() {
  count.value++;
}
</script>

<template>
  <div :style="{ marginBottom: '20px', border: '1px solid #ddd' }">
    <button @click="onClick">count: {{ count }}</button>
    <slot name="title" :count="count" />
    <slot :count="count" />
  </div>
</template>
