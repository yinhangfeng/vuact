<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  defaultCount?: number;
}
const props = withDefaults(defineProps<Props>(), {
  defaultCount: 0,
});

const count = ref(props.defaultCount);

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
