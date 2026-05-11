# Getting Started

## Installation

```bash
pnpm add antd vuact vuact-dom @vuact/ant-design
```

## Configuration

Configure your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuact from 'vuact/vite';

export default defineConfig({
  plugins: [
    vue(),
    vuact(),
  ],
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
});
```

## Usage

```vue
<script setup>
import { ref } from 'vue';
import { Button, Select } from '@vuact/ant-design';

const value = ref('option1');
const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
];
</script>

<template>
  <Button type="primary">Click me</Button>
  <Select v-model="value" :options="options" />
</template>
```

## Version Compatibility

| Package | Version |
|---------|---------|
| Vue | >= 3.5 |
| vuact | >= 0.1 |
| React | 18.x |
| antd | 5.x |
