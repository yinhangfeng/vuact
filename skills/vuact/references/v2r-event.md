# v2r Event Callbacks

Use this when you want to pass update events from React to a Vue component.

```tsx
import { v2r } from 'vuact';
import { useState } from 'react';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const [count, setCount] = useState(1);
  return <RCounter count={count} onUpdate:count={setCount} />;
}
```
