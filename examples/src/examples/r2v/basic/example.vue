<script setup lang="ts">
/**
 * Vue 调用 React 组件基本用法
 */
import { r2v } from 'vuact';
import Counter from './counter.tsx';

// React 组件转为 Vue 组件
const VCounter = r2v(Counter);
</script>
<template>
  <!-- class style 属性可按 vue 规范传递，传递给 React 组件之后 class 会被转为 className，style 会被转为 object -->
  <VCounter :defaultCount="1" class="counter" style="border: 1px solid #ddd" />
</template>
