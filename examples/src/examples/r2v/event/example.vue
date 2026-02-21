<script setup lang="ts">
/**
 * 事件回调的用法
 */
import { ref } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter';
const VCounter = r2v(Counter);

const count = ref(1);
</script>
<template>
  <VCounter :count="count" @update-count="count = $event" />
</template>
