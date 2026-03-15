中文 | [English](README.md)

[![npm version](https://img.shields.io/npm/v/vuact.svg)](https://www.npmjs.com/package/vuact)

## 什么是 Vuact
Vuact = Vue + React 是一个在 Vue3 环境下模拟 React 运行时的兼容层，能够让开发者在 Vue 项目中调用 React 组件生态，也可将其视为一个高度兼容 React 的类 React 库。

## ⚠️ 重要提示
**当前项目处于早期开发阶段，仍不稳定，不建议在生产环境使用。**

## 使用场景
- 在 Vue 应用中使用 React 组件
- 从 React 迁移到 Vue 或者从 Vue 迁移到 React
- 在一个应用中同时使用 Vue 和 React
- 使用类 React 方式开发技术栈无关的组件库

## 功能特性
- 轻量级，Vue 项目使用 React 组件时不需要引入 React
- 兼容 React18 与之前所有版本（React19 支持开发中）
- Vue React 组件互相调用，随意嵌套
- 扩展 Vue React，Vuact 相当于 Vue 和 React 的并集，可在 React 组件中直接使用 Vue 的 reactive 特性
- 经过测试，通过 React 大部分核心测试用例

## Hello World
React 组件 `Select.tsx`:

```tsx
export default function Select(props: {
  options: { label: string; value: string }[];
  value?: string;
  onChange?: (v: string) => void;
  prefix?: any;
  renderOption?: (o: { label: string; value: string }) => any;
}) {
  return (
    <div>
      {props.prefix}
      <select
        value={props.value}
        onChange={(e) => props.onChange?.((e.target as any).value)}
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {props.renderOption?.(o) ?? o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

Vue 调用 React 组件（`example.vue`）:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { r2v } from 'vuact';
import Select from './Select';

const VSelect = r2v(Select, {
  slotsTransformConfig: { prefix: { elementProp: true }, renderOption: {} },
});
const value = ref('low');
const options = [
  { label: 'Low', value: 'low' },
  { label: 'High', value: 'high' },
];
</script>

<template>
  <VSelect :options="options" :value="value" @change="value = $event">
    <template #prefix><span>Priority</span></template>
    <template #renderOption="o">{{ o.label }} ({{ o.value }})</template>
  </VSelect>
</template>
```

## 快速开始

推荐使用 vuact skill
```bash
npx skills add yinhangfeng/vuact
```

### 安装
在 Vue3 项目中执行以下命令安装
```sh
pnpm add vuact vuact-dom
```
`vuact` 和 `vuact-dom` 分别对应 `react` 和 `react-dom`
需要将 vue 版本升级到 3.5 以上

### 配置

#### Vite
vite.config.js
```js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  resolve: {
    // 将 react alias 到 vuact
    alias: {
      'react/jsx-runtime': 'vuact/jsx-runtime',
      'react/jsx-dev-runtime': 'vuact/jsx-dev-runtime',
      react: 'vuact',
      'react-dom/client': 'vuact-dom/client',
      'react-dom/server': 'vuact-dom/server',
      'react-dom': 'vuact-dom',
    },
  },
  optimizeDeps: {
    // 设置 alias 之后能让 node_modules 中的模块（比如 react-redux）依赖的 react 改成 vuact，但是 vite 默认会将 node_modules
    // 中的依赖提前构建到 node_modules/.vite/deps 中，导致 alias 的 react(vuact) 1. 不会自动更新 2. 引入多份 vuact 3. cjs 模块引用 vuact esm 报错
    exclude: ['react', 'react-dom'],
  },
});
```

##### 一个项目同时支持 React jsx 与 Vue jsx
vite.config.js
```js
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  resolve: {
    alias: {
      'react/jsx-runtime': 'vuact/jsx-runtime',
      'react/jsx-dev-runtime': 'vuact/jsx-dev-runtime',
      react: 'vuact',
      'react-dom/client': 'vuact-dom/client',
      'react-dom/server': 'vuact-dom/server',
      'react-dom': 'vuact-dom',
    },
  },
  plugins: [
    (() => {
      // 将 .react.jsx .react.tsx 文件认为是 react jsx，从 vueJsx 插件排除由 esbuild 直接处理
      const reactJsxReg = [
        /^.+\.react\.(j|t)sx$/,
      ];
      const vueJsxPlugin = vueJsx({
        exclude: reactJsxReg,
      });
      const originConfig = vueJsxPlugin.config;
      vueJsxPlugin.config = function (config, env) {
        const result = originConfig(config, env);
        result.esbuild.include = [/\.ts$/, ...reactJsxReg];
        return result;
      };
      return vueJsxPlugin;
    })(),
  ],
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
});
```

tsconfig.json
```json
{
  // ...
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    // ...
  }
}
```
这里的 jsx 配置针对的是 esbuild 处理的 jsx，不会影响 vueJsx 插件

#### pnpm overrides 方式
不依赖构建工具，使用 pnpm overrides 直接将 react react-dom 替换为 vuact vuact-dom

package.json
```json
{
  //...
  "pnpm": {
    "overrides": {
      "react": "npm:vuact@^0.1.0",
      "react-dom": "npm:vuact-dom@^0.1.0"
    }
  }
}
```

## 例子
https://yinhangfeng.github.io/vuact

执行下面命令快速在本地运行例子
```bash
git clone https://github.com/yinhangfeng/vuact.git
cd vuact
pnpm i
pnpm examples
```

## 兼容性
- Vuact 目前主要兼容 React 16-18，同时已经实现 React19 的大部分特性
- Vuact 只发布了 esm 版本而 React 是 cjs 的，可能会碰到 cjs 引用 esm 的问题，请使用现代构建工具
- Vuact 本质是基于 Vue 的，存在一些局限性无法完全模拟 React
  - Vue 采用的是递归渲染，无法实现 React 并发渲染特性
  - Vue 采用的是边递归渲染边修改 DOM，没有 React 的 commit 机制，所以 useInsertionEffect 以及 getSnapshotBeforeUpdate 的调用时机与 React 不同
- @vue/runtime-dom 无法与 react-dom 对齐的地方
  - react-dom 的 SyntheticEvent 系统实现了一套与标准 web 不同的事件系统，比如 input 输入时会触发 change 事件
  - react-dom 对一些原生 dom 做了特殊处理，比如 input form 等
- 不支持 React19 RSC
- 其它未完全对齐 React 的地方请在本项目搜索 `TODO vuact` 结合具体测试用例查看，按重要程度分为 `TODO vuact0` `TODO vuact1` `TODO vuact2` `TODO vuact3`，`TODO vuact0` 的影响最大

## 高级配置

### 配置 scheduler

在入口文件中所有代码执行之前执行 setupScheduler，会通过 hack 方式获取 vue 内部的 flushJobs 函数，以 实现模拟 ReactDOM.flushSync 等功能
```ts
import 'vuact/setup-scheduler';
```

### 扩展 vue renderer
用于支持 input change 事件等

- 使用 @vuact/runtime-dom 替换 @vue/runtime-dom 以实现将 rendererOptions 导出
package.json
```json
{
  //...
  "pnpm": {
    "overrides": {
      "@vue/runtime-dom": "npm:@vuact/runtime-dom@3.5.28-vuact.2"
    }
  }
}
```

- 在入口文件中所有代码执行之前执行 setupRenderer，内部会对 rendererOptions 进行扩展
```ts
import 'vuact/setup-renderer';
```

## 参考借鉴
- 部分设计思路来自 [Veaury](https://github.com/gloriasoft/veaury)
- hooks 部分实现最初参考自 [Preact](https://github.com/preactjs/preact)
- 测试用例是从 React 借来的

## TODO
- @vuact/runtime-dom 方案不是很好，希望 vue 能官方[导出 rendererOptions](https://github.com/vuejs/rfcs/discussions/767)
