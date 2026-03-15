/**
 * React 获取 Vue 组件的 ref
 */
import { useRef, v2r, type ReactComponentRefType } from 'vuact';
import Counter from './counter.vue';

const RCounter = v2r(Counter);

export default function Example() {
  const counterRef = useRef<ReactComponentRefType<typeof RCounter>>(null);
  return (
    <div>
      <button
        onClick={() => {
          counterRef.current?.incCount();
        }}
      >
        incCount
      </button>
      <RCounter
        ref={(instance) => {
          counterRef.current = instance;
        }}
        defaultCount={1}
      />
    </div>
  );
}
