<script setup lang="ts">
import { ref } from 'vue';
import { Button, Input, Select, Modal, message } from '@vuact/ant-design';

const inputValue = ref('Hello');
const selectedValue = ref('option1');
const options = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const visible = ref(false);

function handleClick() {
  message.success('Button clicked!');
}

function showModal() {
  visible.value = true;
}
</script>

<template>
  <div class="demo">
    <h1>Ant Design Vue Demo</h1>

    <section>
      <h2>Button</h2>
      <Button type="primary" @click="handleClick">Primary Button</Button>
      <Button>Default Button</Button>
      <Button type="dashed">Dashed Button</Button>
    </section>

    <section>
      <h2>Input</h2>
      <Input v-model="inputValue" placeholder="Enter text" />
      <p>Value: {{ inputValue }}</p>
    </section>

    <section>
      <h2>Select</h2>
      <Select v-model="selectedValue" :options="options" placeholder="Select..." />
      <p>Selected: {{ selectedValue }}</p>
    </section>

    <section>
      <h2>Modal</h2>
      <Button @click="showModal">Open Modal</Button>
      <Modal v-model:open="visible" title="Modal Title">
        <p>This is a modal dialog!</p>
      </Modal>
    </section>
  </div>
</template>

<style scoped>
.demo {
  padding: 20px;
}

section {
  margin-bottom: 24px;
}

h2 {
  margin-bottom: 12px;
  font-size: 16px;
  color: #333;
}

button {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>
