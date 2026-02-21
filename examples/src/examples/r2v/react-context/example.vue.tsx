import { defineComponent, shallowRef } from 'vue';
import { provideContext, r2v } from 'vuact';
import Counter, { CounterContext } from './counter';

const VCounter = r2v(Counter);

export default defineComponent({
  setup: () => {
    function setCount(count: number) {
      counterContextRef.value = {
        ...counterContextRef.value,
        count,
      };
    }

    const counterContextRef = shallowRef({
      count: 1,
      setCount,
    });

    provideContext(CounterContext, counterContextRef);

    return () => {
      return <VCounter />;
    };
  },
});
