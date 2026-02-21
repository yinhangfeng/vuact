# r2v 渲染属性与 slots

适用于 React 组件的 render props 与 element props 在 Vue 侧通过 slots 传递。

## 核心概念

### Element Props（元素属性）
Element Props 是指传递给 React 组件的属性值是一个已经渲染完成的 React 元素（React Element）或静态内容。这种属性会被立即执行并渲染，React 组件可以直接使用这个元素，例如：
- 作为普通内容展示
- 使用 `React.cloneElement` 进行处理
- 使用 `React.Children` 进行遍历

### Render Props（渲染属性）
Render Props 是指传递给 React 组件的属性值是一个函数，这个函数会在 React 组件内部被调用并返回 React 元素。这种方式的优势是：
- 可以动态接收 React 组件内部的状态或数据作为参数
- 可以根据这些参数动态渲染内容
- 实现了组件间的数据共享和逻辑复用

## React 组件例子 RenderPropsComponent

```tsx
import { useState } from 'react';

export default function Counter({
  title,
  renderTitle,
  children,
}: {
  title?: any;
  renderTitle?: (count: number) => any;
  children?: any;
}) {
  const [count, setCount] = useState(0);

  return (
    <div style={{ marginBottom: 20, border: '1px solid #ddd' }}>
      <button onClick={() => setCount(count + 1)}>count: {count}</button>
      {title}
      {renderTitle?.(count)}
      {typeof children === 'function' ? children(count) : children}
    </div>
  );
}
```

这个 React 组件展示了三种不同的属性使用方式：
- **title**: Element Prop - 直接接收并渲染静态内容
- **renderTitle**: Render Prop - 接收一个函数，调用时传入 count 参数
- **children**: 兼容两种模式 - 可以是静态内容，也可以是函数

## slotsTransformConfig 配置详解

`slotsTransformConfig` 用于配置 Vue 的 slot 如何转换为 React 的属性。

### 配置项说明

```typescript
interface SlotTransformConfig {
  /**
   * 是否将 slot 转为 element prop，立即执行 slot
   * 默认值：
   * - default slot: 默认为 true，默认会作为 children element prop
   * - 其它 slot: 默认为 false
   * 也可以在 slot name 名字前加上 `element:` 前缀开启
   */
  elementProp?: boolean;

  /**
   * 是否将 slot 结果转为 element
   * 默认 false
   * 当 react 组件内部需要对 element 进行处理时需要开启，
   * 比如 react 组件内部使用 React.Children 或 React.cloneElement 等
   */
  transformVNode?: boolean;
}
```

### 配置示例

```typescript
const VRenderPropsComponent = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    // title slot 作为 element prop
    title: { elementProp: true },
    // default slot 默认会作为 element prop，但这里不需要，所以关闭
    default: { elementProp: false },
  },
});
```

## Vue 使用（SFC）

```vue
<script setup lang="ts">
import { r2v } from 'vuact';
import RenderPropsComponent from './render-props';

const VRenderPropsComponent = r2v(RenderPropsComponent);
const VRenderPropsComponent2 = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    // title slot 作为 element prop
    title: { elementProp: true },
    // default slot 默认会作为 element prop，但这里不需要，所以关闭
    default: { elementProp: false },
  },
});
</script>

<template>
  <!-- 方式 1: 使用 element: 前缀将 title 作为 element prop -->
  <VRenderPropsComponent>
    <template #element:title>
      <div>title</div>
    </template>
  </VRenderPropsComponent>

  <!-- 方式 2: 通过 slotsTransformConfig 配置将 title 作为 element prop -->
  <VRenderPropsComponent2>
    <template #title>
      <div>title2</div>
    </template>
  </VRenderPropsComponent2>

  <!-- renderTitle 作为 render prop，接收 count 参数 -->
  <VRenderPropsComponent>
    <template #renderTitle="count">
      <div>renderTitle {{ count }}</div>
    </template>
  </VRenderPropsComponent>

  <!-- children 作为静态 content -->
  <VRenderPropsComponent>
    <div>children</div>
  </VRenderPropsComponent>

  <!-- children 作为 render prop，接收 count 参数 -->
  <VRenderPropsComponent>
    <template #children="count">
      <div>children {{ count }}</div>
    </template>
  </VRenderPropsComponent>

  <!-- 通过 slotsTransformConfig 配置关闭 default slot 的 elementProp，使其作为 render prop -->
  <VRenderPropsComponent2>
    <template #default="count">
      <div>children {{ count }}</div>
    </template>
  </VRenderPropsComponent2>
</template>
```

## Vue 使用（TSX）

```tsx
import { defineComponent } from 'vue';
import { r2v } from 'vuact';
import RenderPropsComponent from './render-props';

const VRenderPropsComponent = r2v(RenderPropsComponent);
const VRenderPropsComponent2 = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    title: { elementProp: true },
    default: { elementProp: false },
  },
});

export default defineComponent({
  setup: () => () => [
    <VRenderPropsComponent>
      {{ 'element:title': () => <div>title</div> }}
    </VRenderPropsComponent>,
    <VRenderPropsComponent2>
      {{ title: () => <div>title</div> }}
    </VRenderPropsComponent2>,
    <VRenderPropsComponent>
      {{ renderTitle: (count) => <div>renderTitle {count}</div> }}
    </VRenderPropsComponent>,
    <VRenderPropsComponent>
      <div>children</div>
    </VRenderPropsComponent>,
    <VRenderPropsComponent>
      {{ children: (count) => <div>children {count}</div> }}
    </VRenderPropsComponent>,
    <VRenderPropsComponent2>
      {(count) => <div>children {count}</div>}
    </VRenderPropsComponent2>,
  ],
});
```
