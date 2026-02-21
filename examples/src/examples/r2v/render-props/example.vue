<script setup lang="ts">
/**
 * React 组件渲染属性的用法，render prop 或 element prop
 */
import { r2v } from 'vuact';
import RenderPropsComponent from './render-props';
const VRenderPropsComponent = r2v(RenderPropsComponent);
// r2v 但提供 slots 转换配置
const VRenderPropsComponent2 = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    title: {
      // title slot 作为 element prop
      elementProp: true,
    },
    default: {
      // default 关闭 element prop，使得可以获取到 slot 入参
      elementProp: false,
    },
  },
});
</script>
<template>
  <VRenderPropsComponent>
    <!-- slot 名字以 element: 开头，代表将 slot 的值作为 element prop 传递给 react 组件 -->
    <template #element:title>
      <div>title</div>
    </template>
  </VRenderPropsComponent>
  <VRenderPropsComponent2>
    <!-- VRenderPropsComponent2 将 title 配置为了 elementProp，就不需要 element: 前缀了 -->
    <template #title>
      <div>title2</div>
    </template>
  </VRenderPropsComponent2>
  <VRenderPropsComponent>
    <!-- 可以获取到 render prop 的入参 -->
    <template #renderTitle="count">
      <div>renderTitle {{ count }}</div>
    </template>
  </VRenderPropsComponent>
  <VRenderPropsComponent>
    <!-- default slot 会默认作为 children (element prop) -->
    <div>children</div>
  </VRenderPropsComponent>
  <VRenderPropsComponent>
    <!-- default slot 默认会作为 children (element prop)，如果 react 组件需要 children 为函数传递参数，则可以使用 children slot -->
    <template #children="count">
      <div>children {{ count }}</div>
    </template>
  </VRenderPropsComponent>
  <VRenderPropsComponent2>
    <!-- VRenderPropsComponent2 关闭了 default slot 的 elementProp 可以获取参数 -->
    <template #default="count">
      <div>children {{ count }}</div>
    </template>
  </VRenderPropsComponent2>
</template>
