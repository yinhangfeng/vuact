# v2r Component Ref

Use this when you want to access methods exposed by a Vue component instance from React.

```tsx
import { useRef, v2r, type ReactComponentRefType } from 'vuact';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const counterRef = useRef<ReactComponentRefType<typeof RCounter>>(null);
  return (
    <div>
      <button onClick={() => counterRef.current?.incCount()}>incCount</button>
      <RCounter ref={(ref) => ref?.incCount} defaultCount={1} />
    </div>
  );
}
```
