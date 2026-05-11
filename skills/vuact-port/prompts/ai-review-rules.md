# AI 审阅规则手册

## 触发条件

当 codegen 产物标记 `meta.needsManualReview: true` 时，AI 必须进行人工审阅。

## 审阅 Checklist

### 1. ReactNode Props → Slot 核对

- [ ] 找到目标库文档中对应的组件页面
- [ ] 核对所有 `ReactNode` 类型的 props 是否正确映射为 Vue slot
- [ ] 检查是否有遗漏的 slot（如 `footer`、`header`、`extra` 等）

### 2. Render Props 核对

- [ ] 找到所有 render function props（如 `renderItem`、`renderOption`）
- [ ] 确认这些 props 正确映射为 scoped slot
- [ ] 检查参数类型是否正确传递

### 3. Event Props 核对

- [ ] 找到所有 `on[A-Z]` 开头的 props
- [ ] 确认默认的 `onChange` → `change` 映射正确
- [ ] 检查特殊事件名是否需要 `eventMapping.custom` 配置

### 4. v-model 核对

- [ ] 找到 `{ value, onChange }` 组合，确认默认 v-model 正确
- [ ] 检查命名 v-model（如 Modal 的 `open`/`onOpenChange`）
- [ ] 确认 `vModel` spec 正确

### 5. forwardRef 组件

- [ ] 检查组件是否用 `forwardRef` 包装
- [ ] 确认 ref 暴露是否完整
- [ ] 检查 `useImperativeHandle` 行为是否正确桥接

### 6. Context / Provider

- [ ] 找到所有 Context/Provider 组件
- [ ] 确认需要在 `ConfigProvider` 中透传
- [ ] 检查 imperative API（message/Modal/notification）是否需要特殊处理

### 7. 复杂组件

以下组件通常需要 `needsManualReview: true`：

- [ ] `Form` / `Form.Item`
- [ ] `Table`
- [ ] `Modal`
- [ ] `Select`
- [ ] `DatePicker`
- [ ] `Tree` / `TreeSelect`

### 8. 命令式 API

- [ ] 找到所有静态方法（如 `Modal.confirm()`）
- [ ] 确认在 `imperative.ts` 中正确 re-export

## 输出要求

完成审阅后：

1. 更新 `src/hints.ts` 让下次 codegen 一致
2. 在 `src/overrides/` 下写人工覆盖版本（如需要）
3. 更新 README.md 中的 Known Differences

## 常见问题

### Form 组件

Form 通常需要：
- `useForm` hook 保持 React 版本行为
- 在 hints 中标注 experimental
- 提供文档说明 ref API 用法

### Table 组件

Table 通常需要：
- `columns` prop → `columns` scoped slot
- `dataSource` → 直接传递
- 在 hints 中标注 experimental

### Modal 组件

Modal 通常需要：
- `open` / `onOpenChange` → 命名 v-model
- `footer` slot 需要 `elementProp: true`
- 命令式 API 需要特殊处理
