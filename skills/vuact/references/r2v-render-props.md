# r2v 渲染属性与 slots

适用于 React 组件的 render props 与 element props 在 Vue 侧的传递。

## Vue 使用（SFC）

```vue
<script setup lang="ts">
import { r2v } from 'vuact';
import RenderPropsComponent from './render-props';

const VRenderPropsComponent = r2v(RenderPropsComponent);
const VRenderPropsComponent2 = r2v(RenderPropsComponent, {
  slotsTransformConfig: {
    title: { elementProp: true },
    default: { elementProp: false },
  },
});
</script>

<template>
  <VRenderPropsComponent>
    <template #element:title>
      <div>title</div>
    </template>
  </VRenderPropsComponent>

  <VRenderPropsComponent2>
    <template #title>
      <div>title2</div>
    </template>
  </VRenderPropsComponent2>

  <VRenderPropsComponent>
    <template #renderTitle="count">
      <div>renderTitle {{ count }}</div>
    </template>
  </VRenderPropsComponent>

  <VRenderPropsComponent>
    <div>children</div>
  </VRenderPropsComponent>

  <VRenderPropsComponent>
    <template #children="count">
      <div>children {{ count }}</div>
    </template>
  </VRenderPropsComponent>

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
