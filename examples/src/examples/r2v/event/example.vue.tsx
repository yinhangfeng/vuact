import { defineComponent, ref } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter';
const VCounter = r2v(Counter);

export default defineComponent({
  setup: () => {
    const count = ref(1);
    return () => {
      return (
        <VCounter
          count={count.value}
          onUpdateCount={(c) => (count.value = c)}
        />
      );
    };
  },
});
