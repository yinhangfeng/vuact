<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  defaultCount?: number;
}
const props = withDefaults(defineProps<Props>(), {
  defaultCount: 0,
});

const count = ref(props.defaultCount);

defineExpose({
  incCount: () => {
    count.value++;
  },
});
</script>

<template>
  <div>
    <p>count {{ count }}</p>
  </div>
</template>
