# v2r Basics

v2r (vue-to-react) is a core Vuact function that converts a Vue component into a React component, so you can use Vue components directly in a React app.

**Use cases**:
- Bring an existing Vue component library into a React project
- Gradually migrate Vue components to React
- Mix React and Vue in the same project

## Vue Component

First, you need a standard Vue component. Here is a simple counter example:
`./counter.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  defaultCount?: number;
}
const props = withDefaults(defineProps<Props>(), {
  defaultCount: 0,
});

const count = ref(props.defaultCount);
function incCount() {
  count.value += 1;
}
</script>

<template>
  <div>
    <div>{{ count }}</div>
    <button @click="incCount">inc</button>
  </div>
</template>
```

This Vue component:
- Accepts `defaultCount` as the initial value via props
- Uses `ref` to manage internal state
- Renders DOM elements and handles click events

## React Usage

Use v2r in a React component:

```tsx
import { v2r } from 'vuact';
import Counter from './counter.vue';

// Convert the Vue component into a React component with v2r
const RCounter = v2r(Counter);

export default function Example() {
  return <RCounter defaultCount={1} className="counter" style={{ height: 100 }} />;
}
```

**Key points**:
1. Import `v2r` and your Vue component
2. Call `v2r(VueComponent)` to get a React component
3. Use it like a normal React component
4. Props interop: React `className` and `style` are automatically transformed into Vue `class` and `style` (auto-adds `px` for unitless values)

## Important Notes

### v2r Component vs Normal React Component

The v2r-converted component (`RCounter`) is still a **Vue component** at runtime but behaves like a React component from the consumer's perspective:

| Aspect | v2r Component | Normal React Component |
|--------|---------------|------------------------|
| JSX usage | React JSX | React JSX |
| Props | className → class | className |
| Events | onClick, onChange | onClick, onChange |
| Slots | Via `slot:name` prop | Via children |
| State | Uses Vue's reactivity | Uses React hooks |

### Key Limitations

1. **Vue context**: v2r components use Vue's reactivity internally — they cannot be used outside a Vue app
2. **Vue refs**: Internal state is Vue-based; `useRef` in React actually uses Vue's `ref`
3. **Suspense**: Limited support for React Suspense with Vue Suspense integration
4. **Native DOM events**: For input/select/textarea, ensure `setupRenderer` is imported for proper event handling

### Props Transformation

| React Prop | Vue Side Receives |
|------------|-------------------|
| `className="foo"` | `class="foo"` |
| `style={{ height: 100 }}` | `style="height: 100px"` (px auto-added) |
| `onClick={fn}` | `@click="fn"` |
| `slot:header={<El />}` | `<template #header><El /></template>` |

