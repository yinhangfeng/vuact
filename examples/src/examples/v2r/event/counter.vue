<script setup lang="ts">
import { useModel } from 'vue';

interface Props {
  count?: number;
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

defineEmits<{
  'update:count': [d: number];
}>();

const count = useModel(props, 'count');

function onClick() {
  count.value++;
}
</script>

<template>
  <div>
    <p>You clicked {{ count }} times</p>
    <button @click="onClick">Click me</button>
  </div>
</template>
