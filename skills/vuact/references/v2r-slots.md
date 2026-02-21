# v2r Slots

适用于在 React 侧通过 slot: 前缀向 Vue slots 传值。

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
