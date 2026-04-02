# r2v Hybrid Components

Use this when you want to write React components that actively mix Vue and React hooks in the same component.

**When to use this guide:**

- `r2v-vue-hooks.md` covers basic usage of `useVueEffectScope`
- This guide covers **advanced patterns** for hybrid components

## Reactive Props with Two-Way Binding

This pattern uses both React's `useState` and Vue's `ref`/`watch` to keep React state and Vue reactivity in sync:

```tsx
import { useVueEffectScope } from 'vuact';
import { useState } from 'react';
import { onScopeDispose, ref, watch } from 'vue';

export default function HybridCounter({ initialCount = 0 }: { initialCount?: number }) {
  // React state for React-side rendering
  const [count1, setCount1] = useState(initialCount);

  // Vue state for Vue-side reactivity (passed to children or external systems)
  const { count: count2 } = useVueEffectScope((args) => {
    const count = ref(args.value);

    // Sync: React -> Vue
    watch(args, (v) => {
      count.value = v;
    });

    // Sync: Vue -> React
    watch(count, (v) => {
      if (v !== count1) {
        setCount1(v);
      }
    });

    onScopeDispose(() => {
      console.log('scope disposed');
    });

    return { count };
  }, initialCount);

  return (
    <div>
      <p>
        count1 (React): {count1} | count2 (Vue): {count2.value}
      </p>
      <button onClick={() => setCount1(count1 + 1)}>Increment React</button>
      <button onClick={() => count2.value++}>Increment Vue</button>
    </div>
  );
}
```

## Exposing Methods via useImperativeHandle

When you need Vue components (passed as children/slots) to call methods on this React component:

```tsx
import { useVueEffectScope } from 'vuact';
import { useImperativeHandle, forwardRef, useState } from 'react';
import { ref as vueRef, watch } from 'vue';

interface HybridCounterRef {
  reset: () => void;
  getCount: () => number;
}

const HybridCounter = forwardRef<HybridCounterRef, { initialCount?: number }>(
  ({ initialCount = 0 }, fRef) => {
    const [count, setCount] = useState(initialCount);

    const { count: vueCount } = useVueEffectScope((args) => {
      const count = vueRef(args.value);

      watch(args, (v) => {
        count.value = v;
      });

      return { count };
    }, initialCount);

    // Expose methods to parent components via fRef (renamed to avoid shadowing vue's ref)
    useImperativeHandle(fRef, () => ({
      reset: () => {
        setCount(initialCount);
        vueCount.value = initialCount;
      },
      getCount: () => vueCount.value,
    }));

    return (
      <div>
        <p>
          count: {count} | vueCount: {vueCount.value}
        </p>
      </div>
    );
  }
);
```

## Computed Values with Vue inside React

```tsx
import { useVueEffectScope } from 'vuact';
import { useState } from 'react';
import { computed, ref, watch } from 'vue';

interface Product {
  price: number;
  quantity: number;
}

function PriceCalculator({ product }: { product: Product }) {
  const [discount, setDiscount] = useState(0);

  // Pass both product and discount via args so Vue reactivity can track all changes
  const { total, discountedPrice } = useVueEffectScope((args) => {
    const priceRef = ref(args.value.price);
    const quantityRef = ref(args.value.quantity);
    const discountRef = ref(args.value.discount);

    // Sync all external values to Vue refs when args change
    watch(args, (v) => {
      priceRef.value = v.price;
      quantityRef.value = v.quantity;
      discountRef.value = v.discount;
    });

    const total = computed(() => priceRef.value * quantityRef.value);
    const discountedPrice = computed(
      () => total.value * (1 - discountRef.value / 100)
    );

    return { total, discountedPrice };
  }, { ...product, discount });

  return (
    <div>
      <p>Total: ${total.value.toFixed(2)}</p>
      <p>With {discount}% discount: ${discountedPrice.value.toFixed(2)}</p>
      <input
        type="number"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
      />
    </div>
  );
}
```

## When to Use Hybrid vs Pure React

| Scenario | Recommendation |
|----------|----------------|
| Pure React component logic | Use standard React hooks |
| Need Vue reactivity in render | Use `useVueEffectScope` (see r2v-vue-hooks.md) |
| Need two-way sync between React/Vue state | Use hybrid pattern (this guide) |
| Need to expose imperative methods | Use `useImperativeHandle` with hybrid |
| Need computed values from Vue side | Use `computed` inside `useVueEffectScope` |
