<script setup lang="ts">
import { ref } from 'vue';
import { createElement } from 'vuact';
import { render } from 'vuact-dom';
import { Comp1 } from '../test/react/Comp1';

const container = ref<HTMLElement>();

function renderTest(e: any) {
  console.log('renderTest', e);
  const res = render(createElement(Comp1, {}), container.value!, () => {
    console.log('render callback');
  });

  console.log('render res', res);
}
</script>

<template>
  <div>vuact render</div>
  <button @click="renderTest">render</button>
  <div ref="container" />
</template>
