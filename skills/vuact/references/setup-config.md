# Vuact 配置与初始化

本文档详细说明如何在 Vue3 项目中配置和初始化 Vuact。

## 前置要求

- Vue 版本 >= 3.5

## 安装依赖

使用 pnpm 安装（推荐）：

```sh
pnpm add vuact vuact-dom
```

## Vite 配置

这是最常用的配置方式，通过 alias 将 react 相关依赖替换为 vuact。

### 基础配置

```js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

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
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
});
```

**关键说明**：
- `optimizeDeps.exclude` 非常重要，避免 Vite 预构建 react 相关依赖，导致 alias 失效
- 没有这个配置会出现：
  - alias 的 vuact 不会自动更新
  - 引入多份 vuact
  - cjs 模块引用 vuact esm 报错

### 同时支持 React JSX 与 Vue JSX

如果项目中需要同时使用两种 JSX：

```js
import { defineConfig } from 'vite';
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
    vue(),
    (() => {
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

**文件命名约定**：
- `.react.tsx` / `.react.jsx`：由 esbuild 处理为 React JSX
- 其他 `.tsx` / `.jsx`：由 vueJsx 插件处理为 Vue JSX

### TypeScript 配置

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

这个配置针对的是 esbuild 处理的 JSX，不会影响 vueJsx 插件。

## pnpm overrides 方式

不依赖构建工具，直接在 package.json 中替换：

```json
{
  "pnpm": {
    "overrides": {
      "react": "npm:vuact@^0.1.0",
      "react-dom": "npm:vuact-dom@^0.1.0"
    }
  }
}
```

这种方式更彻底，整个依赖树中的 react 都会被替换。

## 入口初始化

在应用入口文件的**最顶部**执行初始化代码。

### 基础初始化

```ts
import 'vuact/setup-scheduler';
import 'vuact-dom/register-dom-components';
```

**setup-scheduler**：
- 以 hack 方式获取 Vue 内部的 flushJobs 函数
- 实现模拟 ReactDOM.flushSync 等功能
- 必须在所有代码执行之前导入

**register-dom-components**：
- 注册 DOM 组件

### 启用 setupRenderer（可选，推荐）

setupRenderer 用于支持 input change 事件等

步骤 1：替换 @vue/runtime-dom

在 `package.json` 中：

```json
{
  "pnpm": {
    "overrides": {
      "@vue/runtime-dom": "npm:@vuact/runtime-dom@3.5.28-vuact.2"
    }
  }
}
```

步骤 2：在入口中调用

```ts
import 'vuact/setup-scheduler';
import 'vuact/setup-renderer';
import 'vuact-dom/register-dom-components';
```

setupRenderer 的作用：
- 扩展 vue rendererOptions
- 实现部分对齐 react-dom
- 事件增强
- 支持 input change 事件等

## 入口完整示例

```ts
import 'vuact/setup-scheduler';
import 'vuact/setup-renderer';
import 'vuact-dom/register-dom-components';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

## 配置总结

| 配置项 | 是否必需 | 说明 |
|--------|----------|------|
| 安装 vuact vuact-dom | 是 | 核心依赖 |
| Vite alias | 是 | 将 react 替换为 vuact |
| optimizeDeps.exclude | 是 | 避免预构建问题 |
| setup-scheduler | 否 | 推荐 |
| register-dom-components | 否 | 推荐 |
| setupRenderer | 否 | 推荐，需配合替换 @vuact/runtime-dom |
