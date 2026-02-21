<script setup>
import { ref, onMounted } from 'vue';

const flag = ref(true);
const eleRef = ref();
const eleRef2 = ref();

onMounted(async () => {
  console.log(eleRef.value);
  flag.value = false;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(eleRef.value);
});
</script>

<template>
  <div :key="0" ref="xxx">div3</div>
  <div v-if="flag" ref="eleRef">div1</div>
  <div v-if="!flag">div2</div>
  <div ref="eleRef2">div4</div>
</template>
