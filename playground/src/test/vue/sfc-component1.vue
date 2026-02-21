<script setup lang="ts">
import { ref } from 'vue';

export interface Props {
  string1: string;
  number1: number;
}

const props = defineProps<Props>();

defineExpose({
  string1: ref(''),
  number1: ref(0),
});
</script>
<template>
  <div>SfcComponent1</div>
</template>
