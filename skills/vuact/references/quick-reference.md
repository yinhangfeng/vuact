# Quick Reference

Essential vuact patterns for AI agents working with Vue 3 + React integration.

## Core Conversion Functions

```ts
// r2v: Convert React component to Vue component
import { r2v } from 'vuact';
const VComponent = r2v(ReactComponent);

// v2r: Convert Vue component to React component
import { v2r } from 'vuact';
const RComponent = v2r(VueComponent);
```

## Props Transformation (Automatic)

| Vue → React | React → Vue |
|-------------|-------------|
| `class` | `className` |
| `style="..."` | `style={{ ... }}` |
| `:prop="value"` | `prop={value}` |
| `v-model` | `onUpdate:modelValue` |

## Vue SFC with r2v (React in Vue)

```vue
<script setup lang="ts">
import { r2v } from 'vuact';
import ReactCounter from './ReactCounter';

const VCounter = r2v(ReactCounter);
</script>

<template>
  <VCounter :initialCount="0" class="my-class" />
</template>
```

## Vue TSX with r2v

```tsx
import { defineComponent } from 'vue';
import { r2v } from 'vuact';
import ReactCounter from './ReactCounter';

const VCounter = r2v(ReactCounter);

export default defineComponent({
  setup: () => () => <VCounter initialCount={0} />,
});
```

## React with v2r (Vue in React)

```tsx
import { v2r } from 'vuact';
import VueCounter from './VueCounter.vue';

const RVueCounter = v2r(VueCounter);

export default function Example() {
  return <RVueCounter initialCount={0} className="counter" />;
}
```

## Events

```vue
<!-- Vue: @eventName -->
<VCounter @click="handleClick" @update:modelValue="onUpdate" />
```

```tsx
// React: onEventName
<VCounter onClick={handleClick} onUpdate:modelValue={onUpdate} />
```

## Slots

**r2v (React component in Vue):**

```vue
<VCounter>
  <template #header>Header</template>
  <template #default>Default slot</template>
</VCounter>
```

**v2r (Vue component in React):**

```tsx
<RVueCounter
  slot:header={<div>Header</div>}
  slot:default={<div>Default</div>}
/>
```

## Context

```tsx
// r2v: Provide React context (use ReactContext)
import { provideContext } from 'vuact';
provideContext(ReactContext, value);

// v2r: Provide Vue context (use VueContextProvider)
import { VueContextProvider } from 'vuact';
<VueContextProvider contextKey={vueContextKey} value={value}>
  <RVueComponent />
</VueContextProvider>
```

## Refs

```vue
<!-- Vue: ref to get React component instance -->
<template>
  <VCounter ref="counterRef" />
</template>

<script setup lang="ts">
const counterRef = ref<{ reset: () => void }>();
counterRef.value?.reset();
</script>
```

```tsx
// React: ref to get Vue component instance
const vueRef = useRef<{ reset: () => void }>();
<v2rComponent ref={vueRef} />;
vueRef.current?.reset();
```

## Vue Hooks in React

```tsx
import { useVueEffectScope } from 'vuact';
import { ref, watch } from 'vue';

function ReactComponent({ initialValue = 0 }) {
  const { value } = useVueEffectScope((args) => {
    const value = ref(args.value);
    watch(args, (v) => { value.value = v; });
    return { value };
  }, initialValue);

  return <div>{value.value}</div>;
}
```

## Import Checklist

```ts
// Required in Vue entry file (.ts/.js)
import 'vuact/setup-scheduler';

// Optional but recommended
import 'vuact/setup-renderer';       // Enhanced input events
import 'vuact-dom/register-dom-components'; // DOM components
```

## Vite Config Essentials

```js
{
  resolve: {
    alias: {
      'react': 'vuact',
      'react-dom/client': 'vuact-dom/client',
      'react-dom': 'vuact-dom',
    },
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
  },
}
```
