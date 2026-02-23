# r2v 基础

r2v (react-to-vue) 是 Vuact 提供的核心函数，用于将 React 组件转换为 Vue 组件，这样你就可以在 Vue 应用中直接使用 React 组件了。

**使用场景**：
- 在 Vue 项目中引入已有的 React 组件库
- 逐步将 React 组件迁移到 Vue
- 在同一个项目中混合使用 Vue 和 React

## React 组件

首先，你需要有一个标准的 React 组件。这里是一个简单的计数器组件示例：

```tsx
import { useState } from 'react';

export default function Counter({ defaultCount = 0 }: { defaultCount?: number }) {
  const [count, setCount] = useState(defaultCount);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

这个 React 组件可以：
- 接受 `defaultCount` 属性作为初始值
- 使用 `useState` 管理内部状态
- 渲染 DOM 元素并处理点击事件

## Vue 使用（SFC）

在 Vue 单文件组件（SFC）中使用 r2v：

```vue
<script setup lang="ts">
import { r2v } from 'vuact';
import Counter from './counter';

// 使用 r2v 将 React 组件转换为 Vue 组件
const VCounter = r2v(Counter);
</script>

<template>
  <!-- 像使用普通 Vue 组件一样使用转换后的组件 -->
  <VCounter :defaultCount="1" class="counter" style="border: 1px solid #ddd" />
</template>
```

**关键要点**：
1. 导入 `r2v` 函数和 React 组件
2. 调用 `r2v(ReactComponent)` 得到 Vue 组件
3. 在模板中像使用普通 Vue 组件一样使用
4. 属性传递：Vue 的 `class` 和 `style` 会自动转换为 React 的 `className` 和 `style` 对象

## Vue 使用（TSX）

如果你在 Vue 项目中使用 TSX，使用方式如下：

```tsx
import { defineComponent } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter';

// 使用 r2v 将 React 组件转换为 Vue 组件
const VCounter = r2v(Counter);

export default defineComponent({
  setup: () => () => <VCounter defaultCount={1} />,
});
```

在 TSX 中使用时，属性传递方式与 React 一致。
