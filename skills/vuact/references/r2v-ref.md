# r2v 获取组件 ref

r2v 支持在 Vue 侧获取 React 组件的 ref，从而调用 React 组件暴露的方法或访问其属性。

**使用场景**：
- 调用 React 组件的公开方法
- 访问 React 组件的实例属性
- 实现父组件对子组件的 imperative 控制

## React 函数组件

对于 React 函数组件，需要使用 `forwardRef` 和 `useImperativeHandle` 来暴露方法：

```tsx
import { forwardRef, useImperativeHandle, useState } from 'react';

export default forwardRef(function FunctionComponent(_, ref) {
  const [count, setCount] = useState(0);
  
  // 使用 useImperativeHandle 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    incCount() {
      setCount((c) => c + 1);
    },
  }));
  
  return <div>{count}</div>;
});
```

**关键要点**：
1. 使用 `forwardRef` 包裹函数组件
2. 使用 `useImperativeHandle` 定义暴露给父组件的方法

## React 类组件

对于 React 类组件，所有公开方法都会自动暴露，无需额外配置：

```tsx
import { Component } from 'react';

export default class ClassComponent extends Component {
  state = { count: 0 };
  
  incCount() {
    this.setState({ count: this.state.count + 1 });
  }
  
  render() {
    return <div>{this.state.count}</div>;
  }
}
```

## Vue 使用

在 Vue 中使用 ref 获取 React 组件实例：

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { r2v } from 'vuact';
import FunctionComponent from './function-component';
import ClassComponent from './class-component';

const VFunctionComponent = r2v(FunctionComponent);
const VClassComponent = r2v(ClassComponent);

// 使用 shallowRef 存储组件引用
const functionComponentRef = shallowRef<InstanceType<typeof VFunctionComponent>>();
const classComponentRef = shallowRef<InstanceType<typeof VClassComponent>>();

function incCount() {
  // 通过 ref.value?.instance 访问 React 组件实例
  functionComponentRef.value?.instance?.incCount();
  classComponentRef.value?.instance?.incCount();
}
</script>

<template>
  <div>
    <button @click="incCount">incCount</button>
    <VFunctionComponent ref="functionComponentRef" />
    <VClassComponent ref="classComponentRef" />
  </div>
</template>
```

**关键要点**：
1. 使用 `shallowRef` 或 `ref` 存储组件引用
2. 通过 `ref.value?.instance` 访问 React 组件实例
3. 然后就可以调用 React 组件暴露的方法了
