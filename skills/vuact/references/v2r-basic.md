# v2r 基础

v2r (vue-to-react) 是 Vuact 提供的核心函数，用于将 Vue 组件转换为 React 组件，这样你就可以在 React 应用中直接使用 Vue 组件了。

**使用场景**：
- 在 React 项目中引入已有的 Vue 组件库
- 逐步将 Vue 组件迁移到 React
- 在同一个项目中混合使用 React 和 Vue

## Vue 组件

首先，你需要有一个标准的 Vue 组件。这里是一个简单的计数器组件示例：

```vue
<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
function incCount() {
  count.value += 1;
}
</script>

<template>
  <div>
    <div>{{ count }}</div>
    <button @click="incCount">inc</button>
  </div>
</template>
```

这个 Vue 组件可以：
- 使用 `ref` 管理内部状态
- 渲染 DOM 元素并处理点击事件

## React 使用

在 React 组件中使用 v2r：

```tsx
import { v2r } from 'vuact';
import Counter from './counter.vue';

// 使用 v2r 将 Vue 组件转换为 React 组件
const RCounter = v2r(Counter);

export default function Example() {
  return <RCounter defaultCount={1} className="counter" style={{ height: 100 }} />;
}
```

**关键要点**：
1. 导入 `v2r` 函数和 Vue 组件
2. 调用 `v2r(VueComponent)` 得到 React 组件
3. 像使用普通 React 组件一样使用
4. 属性传递：React 的 `className` 和 `style` 会自动转换为 Vue 的 `class` 和 `style`（单位less自动加px）
