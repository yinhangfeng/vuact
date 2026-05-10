# Vuact UI 适配包通用方案

> 把主流 React UI 库（antd / MUI / Arco / Semi …）通过 vuact 包装为 `@vuact/<name>` 系列 npm 包的端到端方案。
>
> 范围：定位、仓库划分、产物形态、配置 schema、codegen、AI 编排（skill）、测试体系、CI/CD、Roadmap。

---

## 1. 定位与边界

### 1.1 适配包定位

每个 `@vuact/<lib>` 都是**纯运行时桥接包**：

- 自身不内置 React UI 库源码，只产出薄薄一层 `r2v(...)` 调用
- 目标库（`antd` 等）、`vuact`、`vuact-dom`、`vue` 均声明为 `peerDependencies`
- 永远不打包目标库源码进产物
- 产物 ESM-only、`sideEffects: false`、子路径导出与目标库一致

### 1.2 显式不做的事

- 不重写组件逻辑、不改视觉、不维护任何目标库的 fork
- 不做类型映射（vuact 的 `r2v` 已提供）
- 不做样式方案、不内置主题
- 不为目标库提供未在 React 端存在的能力

### 1.3 依赖关系总览

```
┌──────────────────────────────────────────────────┐
│  Vue 3 用户项目                                  │
│  ┌──────────────┐    ┌────────────────────┐     │
│  │  Vue SFC     │───▶│ @vuact/<lib>       │     │
│  └──────────────┘    └─────────┬──────────┘     │
│                                │                 │
│                  ┌─────────────▼────────────┐    │
│                  │ vuact / vuact-dom        │    │
│                  │ (alias: react/react-dom) │    │
│                  └─────────────┬────────────┘    │
│                                │                 │
│                  ┌─────────────▼────────────┐    │
│                  │ <target-lib>（用户安装） │    │
│                  └──────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

---

## 2. 仓库划分

### 2.1 vuact 主仓（已有，扩容）

```
vuact/
├── packages/
│   ├── vuact/                  # 已有，r2v 在这里
│   ├── vuact-dom/              # 已有
│   └── @vuact/runtime-dom/     # 已有
├── tools/
│   └── codegen/                # 【新增】d.ts → r2v 调用源码的离线工具
└── skills/
    ├── vuact/                  # 已有：接入 vuact 的 skill
    └── vuact-port/             # 【新增】把 React UI 库转成 @vuact/<lib> 的 skill
        ├── SKILL.md
        ├── prompts/            # AI 审阅规则手册、hints 编写规范
        └── scripts/            # 固定流程脚本（建包/codegen/测试等）
```

要点：
- `tools/codegen` 与 `skills/vuact-port` 都跟随 vuact 主仓发布，不单独发 npm 包
- scaffold（创建空包模板）作为 `vuact-port` skill 的内置脚本，不单独发包
- 不存在 `@vuact/ui-core` 这一层

### 2.2 vuact-ui 仓库（新建）

只装适配包：

```
vuact-ui/
├── packages/
│   ├── ant-design/             # @vuact/ant-design
│   ├── mui/                    # @vuact/mui
│   ├── arco-design/            # @vuact/arco-design
│   └── ...
├── docs/                       # VitePress 统一文档站
├── playground/                 # 各包的 Vue demo
├── tooling/                    # 跨包共享的测试 runner（见 §6）
│   ├── contract-runner/
│   ├── parity-runner/
│   ├── visual-runner/
│   └── coverage-scanner/
├── .changeset/
└── pnpm-workspace.yaml
```

### 2.3 单个适配包的目录结构

```
packages/<lib>/
├── src/
│   ├── components/             # codegen 产物：每组件一文件
│   ├── overrides/              # 手工/AI 覆盖（codegen 不动）
│   ├── imperative.ts           # 命令式 API re-export（message/Modal.confirm 等）
│   ├── hints.ts                # codegen 输入：人工覆盖规则
│   └── index.ts                # 总入口（codegen 自动聚合）
├── tests/
│   ├── parity/                 # 行为对照测试（人工编写）
│   └── visual/                 # 视觉回归 demo（人工编写）
├── playground/
├── .vuact-port/
│   └── meta.json               # codegen 旁路元数据（不进 npm 产物）
├── package.json
├── tsup.config.ts
└── README.md
```

---

## 3. 产物与 API 约定

### 3.1 产物形态

| 项 | 决策 |
|---|---|
| 模块格式 | ESM-only |
| 子路径导出 | `@vuact/<lib>/<component-kebab>`、`@vuact/<lib>/icons/<name>` 与目标库一致 |
| 类型 | 完全由 `r2v` 推导，适配包不维护额外类型定义 |
| Side effects | `"sideEffects": false`，全量 tree-shaking |
| 依赖 | 目标库 / `vuact` / `vuact-dom` / `vue` 全部 `peerDependencies` |

### 3.2 命名约定

| 项 | 约定 |
|---|---|
| 包名 | `@vuact/<lib-kebab>`（`@vuact/ant-design`、`@vuact/material-ui`） |
| 组件名 | 与目标库**保持同名**，不加前缀 |
| 子路径 | 与目标库子路径一致 |
| 事件 | 默认去 `on` 前缀小写（`onChange` → `change`） |
| v-model | `value/onChange` 默认；命名 model 显式声明 |
| 子组件 | 既单独导出（`FormItem`），也挂在父组件上（`Form.Item`），二者**同一实例** |

### 3.3 用户使用形态

```ts
// 按需导入
import { Button, DatePicker, Form } from '@vuact/ant-design';

// 子组件两条路径同一实例
import { Form, FormItem } from '@vuact/ant-design';
// <Form.Item /> 与 <FormItem /> 等价

// 命令式 API
import { message, Modal, notification } from '@vuact/ant-design';

// Provider
import { ConfigProvider } from '@vuact/ant-design';
```

```vue
<script setup>
import { ref } from 'vue';
import { Select } from '@vuact/ant-design';

const value = ref('low');
const options = [
  { label: 'Low', value: 'low' },
  { label: 'High', value: 'high' },
];
</script>

<template>
  <Select v-model="value" :options="options">
    <template #suffixIcon><MyIcon /></template>
    <template #optionRender="o">{{ o.label }} ({{ o.value }})</template>
  </Select>
</template>
```

### 3.4 命令式 API 透传

`message.success()` / `Modal.confirm()` / `notification.open()` 这类 API 不是组件，由目标库自己挂载到 `document.body`。因为 vuact 已把 `react`/`react-dom` 替换为 vuact 自身，目标库内部的 `ReactDOM.render` 走的就是 vuact 渲染器，**适配包直接 re-export 即可**：

```ts
// src/imperative.ts
export { message, notification, Modal } from 'antd';
```

如果某些场景需要 Vue 端 `ConfigProvider` 上下文透到命令式 API（脱离组件树挂载拿不到 Provider），由各适配包按需要在 overrides 里再封一层，core 不参与。

---

## 4. 配置 schema 与 codegen

### 4.1 schema 的本质

适配包的"配置"**不是一个独立运行时对象**，而是 codegen 在内存里临时构造、然后**直接 emit 成 r2v 调用源码**的中间表示。落到磁盘上的就是普通的 TS 源码。

- schema 类型 ≈ `R2VOptions & { 极少数 codegen 元数据 }`
- 元数据（`source`、`needsManualReview`、`docUrl` 等）**不进 npm 产物**，落到 `.vuact-port/meta.json` 旁路文件供 AI/reviewer 使用
- 运行时不解析 schema，只执行 r2v

### 4.2 schema 字段

```ts
import type { R2VOptions } from 'vuact';

interface ComponentSpec extends R2VOptions {
  // 流水线元数据（不进运行时产物）
  source: { module: string; export: string };
  meta?: {
    docUrl?: string;
    experimental?: boolean;
    needsManualReview?: boolean;
    unsupported?: boolean;
  };
  // 子组件命名空间，由 codegen 在 emit 阶段拼装
  subComponents?: Record<string, ComponentSpec | string>;
}
```

`R2VOptions` 已包含的字段（直接复用，不重新命名）：

- `slotsTransformConfig`：ReactNode prop / render prop → Vue slot
- `vModel`：v-model 糖（`{ prop, event, modelName? }`）
- ref / forwardRef 相关（vuact 已支持，无需扩展）
- 事件命名映射

### 4.3 子组件命名空间处理

每个子组件**先 r2v 单独包装一次**，得到普通 Vue 组件；父组件包装完成后用 `Object.assign` 挂上去。两条访问路径（`Form.Item` 与 `FormItem`）指向**同一个** Vue 组件实例。

```ts
// codegen 产物：src/components/Form.ts
import { Form as RForm } from 'antd';
import { r2v } from 'vuact';

// 子组件单独包装、单独导出
export const FormItem = r2v(RForm.Item, { /* spec */ });
export const FormList = r2v(RForm.List, { /* spec */ });
export const FormProvider = r2v(RForm.Provider, { /* spec */ });

// 父组件包装 + 挂载子组件
const RawForm = r2v(RForm, { /* spec */ });
export const Form = Object.assign(RawForm, {
  Item: FormItem,
  List: FormList,
  Provider: FormProvider,
});
```

`index.ts` 中 codegen 自动聚合：

```ts
export { Form, FormItem, FormList, FormProvider } from './components/Form';
```

### 4.4 codegen 流程

```
┌─────────────────────────────────────────────────┐
│  codegen 工作流                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ① 解析目标库的 d.ts（ts-morph / TS API）        │
│        ↓                                        │
│  ② 收集导出组件 + props 类型                    │
│        ↓                                        │
│  ③ 推断 spec                                    │
│     - ReactNode prop → slot                     │
│     - (...args) => ReactNode → scoped slot      │
│     - on[A-Z]\w+ → event                        │
│     - {value, onChange} → 默认 v-model          │
│     - 命名空间挂载 → subComponents              │
│        ↓                                        │
│  ④ 合并 hints.ts（人工覆盖优先）                 │
│        ↓                                        │
│  ⑤ emit 出每组件一个 .ts 文件 + index.ts        │
│  ⑥ 旁路输出 .vuact-port/meta.json（流水线元数据） │
│                                                 │
└─────────────────────────────────────────────────┘
```

CLI 形态：

```bash
vuact-codegen \
  --source antd \
  --entry node_modules/antd/es/index.d.ts \
  --hints packages/ant-design/src/hints.ts \
  --out packages/ant-design/src/components
```

### 4.5 hints.ts 编写规范

`hints.ts` 是 codegen 的**显式覆盖输入**，由 AI / 人工维护：

```ts
import { defineHints } from '../../tools/codegen/dsl';

export default defineHints({
  Modal: {
    vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
    slotsTransformConfig: { footer: { elementProp: true } },
  },
  Form: {
    // 复杂组件完全手写
  },
});
```

codegen 在合并阶段：**hints 优先级 > 自动推断**，但 hints 里没出现的字段保留自动推断结果。

### 4.6 codegen 产物提交策略

- `src/components/**` 的 codegen 产物**进 git**，可审计、可 PR review
- `.vuact-port/meta.json` 进 git，不进 npm 产物
- `hints.ts` 是手写文件，进 git
- `src/overrides/**` 是手写文件，覆盖优先级最高

---

## 5. vuact-port skill：AI 编排转换流程

### 5.1 定位

`vuact-port` 是 vuact 主仓 `skills/` 下的一个 skill，安装后让 AI 编辑器可以**用一条命令**端到端完成"加一个新适配包"。

### 5.2 端到端工作流

```
用户：把 antd 接入 vuact-ui

│
├─ Step 1  脚手架
│   exec: 在 packages/ant-design/ 下创建空包骨架
│         （package.json、tsup、tsconfig、目录占位、playground 占位）
│
├─ Step 2  装目标库到 monorepo（仅 devDep，给 codegen 解析用）
│   exec: pnpm -F @vuact/ant-design add -D antd
│
├─ Step 3  codegen
│   exec: vuact-codegen --source antd --entry ... --out src/components
│   产出：每组件 spec + wrapper，标好 needsManualReview
│
├─ Step 4  AI 审阅（skill 的核心价值）
│   AI 读取：codegen 产物 + meta.json + hints.ts + 目标库官方文档
│   按规则做：
│   ① 修正 needsManualReview 的组件
│   ② 在 overrides/ 写人工版本（如 antd Form 的特殊处理）
│   ③ 更新 hints.ts 让下次 codegen 一致
│   ④ 写 README：兼容版本、未支持组件、已知差异
│
├─ Step 5  生成 demo
│   AI 在 playground/ 写几个典型组件的 Vue demo 跑通
│
├─ Step 6  跑测试 + 修
│   exec: pnpm -F @vuact/ant-design test
│   失败时回 Step 4 循环
│
└─ Step 7  提 PR
    AI 写 changeset、commit、推 PR
```

### 5.3 SKILL.md 内容骨架

| 部分 | 内容 |
|---|---|
| **触发条件** | "把 X 包装成 vuact 适配包"、"为 vuact-ui 加一个新库 X" |
| **环境契约** | 当前 cwd 是 vuact-ui monorepo 根；vuact 已在 npm 可用 |
| **流程脚本** | Step 1–3、Step 5–7 是固定 shell；Step 4 由 AI 主导 |
| **AI 审阅规则手册** | 详细 checklist：见 5.4 |
| **hints.ts 编写规范** | 示例 + 注释 |
| **质量门禁** | L1/L4 测试必须过、playground 必须能渲染、README 必须含三件套 |
| **失败兜底** | 哪些组件可标记 `unsupported` 跳过，避免钻牛角尖 |

### 5.4 AI 审阅规则手册（Step 4 关键）

- 看到 `meta.needsManualReview` → 打开目标库官方文档对应组件页 → 核对 props/events/slots
- 看到 prop 名是 `render*` / `*Render` 但类型不是函数 → 可能是 codegen 推断错，重查
- 看到组件是 `forwardRef` 包过的 → 检查 ref 暴露是否完整（vuact 已自动透传，主要确认 `useImperativeHandle` 行为）
- 看到目标库文档里有 "Imperative" / "static method" 字样 → 在 `imperative.ts` 里 re-export
- 看到组件有 `useForm` 类 hook → 在 README 标注用法，不在 wrapper 里硬桥
- 任何含 Context / Provider 的组件 → 检查是否需要在 ConfigProvider 透传

### 5.5 vuact-port 与测试的反馈环

```
Step 4 AI 写 overrides / 修 spec
   │
   ▼
Step 6 跑测试
   │
   ├─ L1 失败 → 改 spec/overrides → 回 Step 4
   ├─ L4 失败 → 补漏的导出 → 回 Step 4
   ├─ L2 失败 → 标 known-diff，写进 unsupported-list 或 README
   └─ L3 失败 → 同 L2，标 known-diff
```

`L1`、`L4` 必须修复；`L2`、`L3` 允许标记为 known-diff 后通过。

---

## 6. 测试体系

### 6.1 四层结构

```
┌────────────────────────────────────────┐
│ L1  包装契约测试（每个组件全自动）     │ ← codegen 元数据驱动
├────────────────────────────────────────┤
│ L2  行为对齐测试（典型组件 ×N）        │ ← 半人工
├────────────────────────────────────────┤
│ L3  视觉回归（关键 demo 截图比对）     │ ← Playwright
├────────────────────────────────────────┤
│ L4  覆盖率/完整性扫描                  │ ← 静态脚本
└────────────────────────────────────────┘
```

### 6.2 L1 包装契约测试

**目标**：验证 wrapper 结构正确——所有 spec 声明的 slot / event / v-model / ref / sub-component 都能工作。不验证视觉/业务。

**工具**：Vitest + `@vue/test-utils`，跑在 jsdom。

**生成方式**：`tooling/contract-runner` 读 `.vuact-port/meta.json`，按以下矩阵**在内存中**展开测试用例（不落盘成上千个文件）：

| 维度 | 用例 |
|---|---|
| props 透传 | 任意 prop 能传到 React 端、能渲染出 DOM |
| events | 每个声明的 event 触发后 Vue 端能收到 emit，参数一致 |
| v-model | 双向更新不丢失 |
| slots | ReactNode prop 通过 slot 传入能渲染 |
| scoped slot | render prop 类型 slot 参数能传到 slot scope |
| ref | `ref` 能拿到 React 实例，调用方法不抛 |
| sub-components | `Form.Item` 与 `import { FormItem }` 是同一实例 |

### 6.3 L2 行为对齐测试

**目标**：Vue 端写法 == React 端写法，行为输出一致。

**工具**：Vitest + jsdom，**同一份测试代码**用 `react-testing-library` 与 `@vue/test-utils` 各跑一遍，对比输出。

**范围**：人工挑出典型组件（覆盖事件、表单、Portal、Context、render prop 几大类），每个适配包 10–20 个。

```ts
// tests/parity/select.parity.test.ts
const cases = [
  { props: { options: [...], defaultValue: 'a' }, action: () => clickOption('b') },
];

cases.forEach((c) => {
  it('react vs vue', async () => {
    const reactSnapshot = await renderReact(c);
    const vueSnapshot = await renderVue(c);
    expect(normalize(vueSnapshot)).toEqual(normalize(reactSnapshot));
  });
});
```

**实现策略**：same-codebase 对照（同一段测试代码跑两边），自动化程度高。

### 6.4 L3 视觉回归

**目标**：真实浏览器渲染，截图与 React 原版逐像素对比，捕捉 DOM 结构 / 样式 / 动画偏差。

**工具**：Playwright + `pixelmatch`。

```
tests/visual/
├── pages/
│   ├── react/<comp>.html      # 用 React + 原库的 demo
│   └── vue/<comp>.vue         # 用 vuact + @vuact/<lib> 的 demo
└── visual.spec.ts             # 同时打开两边页面、截图、diff
```

- 控制变量：关动画、固定时间、固定 viewport
- diff 阈值：1–3% 像素差
- 第一版只对**关键 demo**做（每个适配包 20–50 张截图）
- 自建 Playwright，不上 SaaS（Chromatic 等）

### 6.5 L4 覆盖率/完整性扫描

**目标**：静态检查"有没有漏组件、漏 prop"。

**工具**：纯 Node 脚本，不依赖测试框架。

| 检查 | 报错条件 |
|---|---|
| 导出完整性 | 目标库 `index.d.ts` 顶层 export 是否都在适配包 export |
| 子组件完整性 | 命名空间挂载是否齐全 |
| Spec 覆盖度 | 每个组件所有 props 要么被声明（slot/event/model），要么被识别为普通透传 prop |
| 命令式 API | 静态方法都被 re-export |
| 已知未支持清单 | `unsupported-list.md` 项必须有显式跳过逻辑 |

输出 `coverage-report.md`，PR 阶段在评论里 diff。

### 6.6 跨适配包共享的测试基建

```
vuact-ui/tooling/
├── contract-runner/      # L1：吃 meta.json → 跑契约测试
├── parity-runner/        # L2：跑 React/Vue 对照
├── visual-runner/        # L3：Playwright + pixelmatch 封装
└── coverage-scanner/     # L4：静态扫描
```

每个适配包的 `package.json`：

```json
{
  "scripts": {
    "test": "vuact-ui-test contract && vuact-ui-test parity && vuact-ui-test visual && vuact-ui-test coverage"
  }
}
```

### 6.7 CI 执行策略

| 触发 | 跑哪些层 | 时间预算 |
|---|---|---|
| PR 改了某适配包代码 | 该包 L1 + L4 | 5 分钟 |
| PR 改了 spec / overrides | 该包 L1 + L2 + L4 | 15 分钟 |
| 合并到 main | 全部包 L1 + L2 + L4 | 30 分钟 |
| 每日定时 | 全部包 L1–L4 | 1 小时 |
| 发版前 | 全部包全量 + 兼容矩阵 | 不限 |

### 6.8 兼容矩阵（每日定时）

```
Node:    18, 20
Vue:     3.5.x, 3.6.x（如有）
vuact:   latest, prerelease
target:  目标库最近 3 个 minor 版本
```

### 6.9 第一版分级落地

| 必做 | 选做 | 不做 |
|---|---|---|
| L1 契约测试 | L2（每包 5–10 核心组件） | 全量视觉回归 |
| L4 覆盖率扫描 | L3（1–2 个旗舰组件 PoC） | 性能基准 |
| 兼容矩阵 |  |  |

---

## 7. 版本与发布

### 7.1 版本号策略

`@vuact/<lib>` 命名约束 `{target-major}.{minor}.{patch}`：

- `target-major` 跟随目标库主版本
- `minor` / `patch` 由适配包自身节奏决定

`peerDependencies` 严格声明，不锁死 minor：

```json
{
  "peerDependencies": {
    "vue": "^3.5.0",
    "vuact": "^0.x",
    "vuact-dom": "^0.x",
    "antd": "^5.0.0"
  }
}
```

### 7.2 升级流程

- 目标库 minor 升级 → 跑回归 → 发 patch
- 目标库 major 升级 → 拉新分支 → 主版本号跟随目标库
- vuact 升级 → 看是否有 r2v API 变化 → 视情况发新版

### 7.3 工程化选型

| 项 | 选型 |
|---|---|
| 包管理 | pnpm workspace |
| 构建 | tsup（ESM only，d.ts emit） |
| 版本/发布 | changesets + npm provenance |
| Lint/格式 | 复用 vuact 主仓的 eslint + prettier |
| CI | GitHub Actions |
| 文档站 | VitePress |

---

## 8. 文档与 DX

### 8.1 文档站结构（VitePress）

```
/components/<comp>       ← 复刻目标库文档结构
  ├─ 概览（Vue 版用法）
  ├─ Props/Events/Slots 表（codegen 旁路产出）
  ├─ 在线 Playground（@vue/repl）
  └─ 跳转目标库官方文档链接
/guide/getting-started   ← Vite alias / pnpm overrides 两种接入方式
/guide/migration         ← 从 ant-design-vue / element-plus 迁移
/guide/troubleshooting   ← 常见踩坑（optimizeDeps / CJS-ESM / SSR 不支持等）
```

### 8.2 接入方式（用户视角）

```bash
# 通过 vuact skill 一键接入 vuact 本身
npx skills add yinhangfeng/vuact

# 安装适配包与目标库
pnpm add antd vuact vuact-dom @vuact/ant-design
```

`vite.config.ts` 配置参考 vuact 主仓 README。

### 8.3 错误诊断 FAQ 必备项

1. `optimizeDeps` 没排除 react 导致的双实例
2. CJS 目标库子包（如 `antd/locale/zh_CN`）的 ESM 导入坑
3. 引用目标库 reset 样式的姿势
4. SSR 不支持的明确声明
5. Form/Table ref API 的使用方式

---

## 9. 贡献者协议（新建适配包必须满足）

| 必须项 | 说明 |
|---|---|
| 依赖 | 目标库、`vuact`、`vuact-dom`、`vue` 必须 peer；不引入额外运行时依赖 |
| 产物 | ESM-only、`sideEffects: false`、子路径导出 |
| 命名 | 遵守 §3.2 |
| 测试 | 至少通过 L1 + L4；L2/L3 至少有 1–2 个 PoC |
| 文档 | 至少标注：兼容版本、未支持组件、已知差异（known-diff） |
| CI | 跑 vuact-ui 仓库提供的 workflow 模板 |

---

## 10. Roadmap

| 阶段 | 仓库 | 目标 | 验收 |
|---|---|---|---|
| **C0** | vuact | 定稿 schema / hints DSL，写 RFC 文档 | 一份 schema + 一个手写示例 |
| **C1** | vuact | codegen MVP（解析 d.ts → emit r2v 调用） | 一个 mini React 库验收 |
| **C2** | vuact | `vuact-port` skill MVP：scaffold + codegen + AI 规则手册 | 端到端跑通一个简单 React 库 |
| **C3** | vuact-ui | 新建 monorepo + tooling + 文档站基线 | 仓库可独立运转 |
| **C4** | vuact-ui | 用 skill 接 antd 作为旗舰适配包 | `@vuact/ant-design` Beta 上线 |
| **C5** | vuact-ui | 横向扩 MUI / Arco / Semi | 至少 3 个适配包 GA |

---

## 11. 风险清单

| 风险 | 应对 |
|---|---|
| vuact 主项目仍在 alpha，桥接底座不稳 | 适配包紧跟 vuact，问题在主项目修，不在适配层打补丁 |
| 目标库内部 API 变动（私有 hook、context） | codegen 只依赖公开 d.ts；CI 矩阵兜底 |
| codegen 推断错误（slot / event / v-model 判断错） | hints + overrides 兜底；AI 审阅规则手册主修 |
| 包名占用与品牌问题 | npm 注册 `@vuact` scope；README 显著标注「非官方桥接」 |
| 维护工作量爆炸 | codegen + skill + AI 自动化；新库走「贡献者主导 + 模板化」 |
| Form/Table 等复杂组件桥接质量 | 标 experimental，文档明确边界，必要时手工 overrides |
| SSR / Nuxt 支持 | 第一版明确不支持，写进 troubleshooting |
| AI 审阅误判 | L1/L4 强制门禁；L2/L3 known-diff 由人工 review |

---

## 12. 已经定下的关键决策

1. **纯运行时桥接**，不内置目标库源码
2. **不要 `@vuact/ui-core`**：codegen 作为 vuact 主仓的离线工具，适配包产物只 `import` `vuact`
3. **schema 继承自 `R2VOptions`**，运行时不解析 schema，codegen 直接 emit 成 r2v 调用源码
4. **流水线元数据**（`source` / `meta`）走旁路文件 `.vuact-port/meta.json`，不进 npm 产物
5. **子组件**：每个先单独 `r2v` 包装、单独导出，再 `Object.assign` 挂父组件，两条路径同一实例
6. **forwardRef** 完全交给 vuact 已有能力，**不做白/黑名单**
7. **`vuact-port` skill 与 codegen 都放 vuact 主仓**，不单独发包
8. **scaffold** 作为 skill 的内置脚本，不发独立 npm 包
9. **首发只做 antd**，跑通后再横向铺
10. **测试四层**：L1/L4 强制、L2/L3 渐进推进、视觉回归自建 Playwright
