# r2v 事件回调

r2v 支持 Vue 与 React 组件之间的事件双向传递。Vue 侧通过 `@event-name` 监听事件，React 侧通过 `onEventName` 回调函数触发事件。

**使用场景**：
- React 组件需要向父组件（Vue）传递数据
- 实现 Vue 与 React 组件的双向数据绑定
- 处理用户交互事件

## React 组件示例

首先，我们需要一个接受回调函数的 React 组件：

```tsx
import { useState } from 'react';

export default function Counter({ count, onUpdateCount }: { count: number; onUpdateCount: (count: number) => void }) {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => onUpdateCount(count + 1)}>Increment</button>
    </div>
  );
}
```

这个 React 组件：
- 接受 `count` 属性作为当前值
- 接受 `onUpdateCount` 回调函数用于通知父组件更新
- 点击按钮时调用 `onUpdateCount` 传递新值

## Vue 使用（SFC）

在 Vue 单文件组件中使用 r2v 处理事件回调：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter';

const VCounter = r2v(Counter);
const count = ref(1);
</script>

<template>
  <!-- 使用 @update-count 监听 React 组件的 onUpdateCount 回调 -->
  <VCounter :count="count" @update-count="count = $event" />
</template>
```

**事件映射规则**：
- React 的 `onUpdateCount` → Vue 的 `@update-count`（驼峰转短横线）
- 回调参数通过 `$event` 访问

## Vue 使用（TSX）

在 Vue TSX 中使用 r2v 处理事件回调：

```tsx
import { defineComponent, ref } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter';

const VCounter = r2v(Counter);

export default defineComponent({
  setup: () => {
    const count = ref(1);
    return () => (
      // 在 TSX 中直接使用 onUpdateCount，与 React 一致
      <VCounter count={count.value} onUpdateCount={(c) => (count.value = c)} />
    );
  },
});
```

## v-model 支持

Vuact 还支持 Vue 的 v-model 语法糖。Vue 的 v-model 更新事件在 React 侧以 `onUpdate:xxx` 形式接收：

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { r2v } from 'vuact';
import Input from './input';

const VInput = r2v(Input);
const value = ref('');
</script>

<template>
  <!-- 使用 v-model 绑定，React 组件接收 value 和 onUpdate:value -->
  <VInput v-model="value" />
</template>
```

对应的 React 组件：

```tsx
export default function Input({ value, onUpdateValue }: { value: string; onUpdateValue: (value: string) => void }) {
  return <input value={value} onChange={(e) => onUpdateValue(e.target.value)} />;
}
```
