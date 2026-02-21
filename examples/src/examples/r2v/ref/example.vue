<script setup lang="ts">
/**
 * 获取 React 组件的 ref
 */
import { shallowRef } from 'vue';
import { r2v } from 'vuact';
import FunctionComponent from './function-component';
import ClassComponent from './class-component';

const VFunctionComponent = r2v(FunctionComponent);
const VClassComponent = r2v(ClassComponent);

const functionComponentRef =
  shallowRef<InstanceType<typeof VFunctionComponent>>();
const classComponentRef = shallowRef<InstanceType<typeof VClassComponent>>();

function incCount() {
  // 函数组件 .instance 为 useImperativeHandle 提供的 handle
  functionComponentRef.value?.instance?.incCount();
  // 类组件 .instance 为 class component instance
  classComponentRef.value?.instance.incCount();
}
</script>
<template>
  <div>
    <button @click="incCount">incCount</button>
    <VFunctionComponent ref="functionComponentRef" />
    <VClassComponent ref="classComponentRef" />
  </div>
</template>
