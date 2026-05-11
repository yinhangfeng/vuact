# hints.ts 编写规范

## 概述

`hints.ts` 是 codegen 的显式覆盖输入，用于人工指定组件的 r2v 配置。

## 基本语法

```ts
import { defineHints } from '../../tools/codegen/dsl';

export default defineHints({
  组件名: {
    // r2v 配置
  },
});
```

## 配置字段

### vModel

指定 v-model 映射：

```ts
export default defineHints({
  Modal: {
    vModel: [
      {
        modelName: 'open',      // v-model 名称（可选，默认 'modelValue'）
        prop: 'open',           // React prop 名
        event: 'onOpenChange',  // React 事件名
      },
    ],
  },
  Input: {
    vModel: {
      prop: 'value',
      event: 'onChange',
    },
  },
});
```

### slotsTransformConfig

指定 slot 转换配置：

```ts
export default defineHints({
  Modal: {
    slotsTransformConfig: {
      footer: { elementProp: true },      // footer 作为 element prop 传递
      children: { elementProp: true },    // children 作为 element prop 传递
      extra: { transformVNode: true },     // 将 slot 结果转为 element
    },
  },
});
```

### eventMapping

指定事件映射：

```ts
export default defineHints({
  Select: {
    eventMapping: {
      stripOnPrefix: true,                  // 默认：onChange → change
      custom: {
        onSearch: 'search',                 // 自定义映射
        onOpenChange: 'openChange',          // 覆盖默认
      },
    },
  },
});
```

### meta

指定元数据：

```ts
export default defineHints({
  Form: {
    meta: {
      experimental: true,         // 标记为实验性
      docUrl: 'https://...',      // 文档链接
      unsupported: false,         // 标记为不支持
    },
  },
  OldComponent: {
    meta: {
      unsupported: true,
    },
  },
});
```

### subComponents

指定子组件（用于命名空间组件如 `Form.Item`）：

```ts
export default defineHints({
  Form: {
    subComponents: {
      Item: {},        // 使用自动推断的配置
      List: 'List',    // 直接引用已有的配置名
    },
  },
});
```

## 完整示例

```ts
import { defineHints } from '../../tools/codegen/dsl';

export default defineHints({
  Modal: {
    vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
    slotsTransformConfig: {
      footer: { elementProp: true },
      children: { elementProp: true },
    },
    meta: {
      experimental: true,
      docUrl: 'https://ant.design/components/modal',
    },
  },
  Form: {
    meta: {
      experimental: true,
    },
    subComponents: {
      Item: {},
      List: {},
      Provider: {},
    },
  },
  Select: {
    vModel: { prop: 'value', event: 'onChange' },
    slotsTransformConfig: {
      dropdownRender: { transformVNode: true },
      notFoundContent: { elementProp: true },
    },
  },
  Table: {
    meta: {
      experimental: true,
    },
  },
});
```

## 优先级规则

1. hints 中的显式配置**优先于**自动推断
2. hints 中未指定的字段**保留**自动推断结果
3. `unsupported: true` 的组件**跳过** codegen
