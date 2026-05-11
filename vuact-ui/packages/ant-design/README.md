# @vuact/ant-design

Vue 3 adapter for [ant-design](https://ant.design), powered by [vuact](https://github.com/yinhangfeng/vuact).

## Compatibility

| Package | Version |
|---------|---------|
| Vue | >= 3.5 |
| vuact | >= 0.1 |
| React | 18.x |
| antd | 5.x |

## Installation

```bash
pnpm add antd vuact vuact-dom @vuact/ant-design
```

## Quick Start

```vue
<script setup>
import { ref } from 'vue';
import { Button, Select, Form, Input } from '@vuact/ant-design';

const value = ref('');
const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
];
</script>

<template>
  <Button type="primary">Click me</Button>
  <Select v-model="value" :options="options" />
</template>
```

## Known Differences

### v-model

- All form components support v-model syntax natively
- Named v-model is supported (e.g., `v-model:open` for Modal)

### SSR

SSR is **not supported** in this version. Use `<ClientOnly>` wrapper if needed.

### Form

Form components are marked as **experimental**:
- `useForm` hook behavior may differ from React version
- Some validation behaviors may not match exactly

### Table

Table component is marked as **experimental**:
- `columns` prop is mapped to scoped slots
- `dataSource` is passed directly

### Modal

Modal uses named v-model for visibility:
```vue
<Modal v-model:open="visible">
  <p>Content</p>
</Modal>
```

## Unsupported Components

The following components are not yet supported:
- ConfigProvider (context providers)
- Typography (editable text)
- Tour
- FloatButton

## License

MIT
