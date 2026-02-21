# v2r Slots

Use this when you want to pass values to Vue slots from React via `slot:`-prefixed props.

```tsx
import { v2r } from 'vuact';
import SlotsComponent from './slots.vue';

const RSlotsComponent = v2r(SlotsComponent);

export default function Example() {
  return [
    <RSlotsComponent slot:title={<div>title</div>} />,
    <RSlotsComponent
      slot:title={({ count }) => <div>renderTitle {count}</div>}
    />,
    <RSlotsComponent>
      <div>children</div>
    </RSlotsComponent>,
    <RSlotsComponent>
      {({ count }) => <div>children {count}</div>}
    </RSlotsComponent>,
  ];
}
```
