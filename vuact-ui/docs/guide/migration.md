# Migration Guide

## From ant-design-vue

If you're migrating from `ant-design-vue` to `@vuact/ant-design`:

### Import Changes

```ts
// ant-design-vue
import { Button } from 'ant-design-vue';

// @vuact/ant-design
import { Button } from '@vuact/ant-design';
```

### API Differences

| ant-design-vue | @vuact/ant-design |
|----------------|-------------------|
| `<a-button>` | `<Button>` |
| `v-model:value` | `v-model` |
| Slots: `v-slot:extra` | `v-slot:extra` (same) |

### Breaking Changes

1. **SSR**: Not supported in the first version
2. **Form.useForm**: Returns React hooks behavior, may differ from Vue version
3. **TreeSelect**: Experimental support

## From element-plus

If you're migrating from `element-plus` to a vuact adapter:

The API is designed to be similar, but some differences exist:

1. **Events**: Use Vue events (`@click`) instead of Vue 2 style
2. **Slots**: Use Vue 3 slot syntax

## Known Differences

See each adapter package's README for specific known differences.
