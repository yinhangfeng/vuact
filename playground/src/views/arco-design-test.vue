<script setup lang="tsx">
import { shallowRef } from 'vue';
import React from 'react';
import ReactDOM from 'react-dom';
import '@arco-design/web-react/dist/css/arco.css';
import { Avatar, Select, Checkbox } from '@arco-design/web-react';
const Option = Select.Option;
const options = [
  'Beijing',
  'Shanghai',
  'Guangzhou',
  'Shenzhen',
  'Chengdu',
  'Wuhan',
];

const container = shallowRef<HTMLElement>();

async function test1() {
  ReactDOM.render(<Avatar size={32}>T</Avatar>, container.value!);

  await new Promise((resolve) => setTimeout(resolve, 10));

  ReactDOM.render(
    <Avatar size={32}>
      <img
        alt="avatar"
        src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/3ee5f13fb09879ecb5185e440cef6eb9.png~tplv-uwbnlip3yd-webp.webp"
      />
    </Avatar>,
    container.value!
  );
}

async function test2() {
  ReactDOM.render(
    <Select
      mode="multiple"
      placeholder="Select cities"
      style={{ width: 345 }}
      defaultValue={['Beijing', 'Shenzhen']}
      allowClear
    >
      {options.map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>,
    container.value!
  );
}

async function test3() {
  ReactDOM.render(
    <div>
      <Checkbox
        onChange={(e) => {
          console.log('checkbox onChange', e);
        }}
      >
        check
      </Checkbox>
      <label className="arco-checkbox1">
        <input
          type="checkbox"
          onChange={(e) => {
            console.log('input onChange', e);
          }}
        />
        <span className="arco-checkbox-text1">check</span>
      </label>
    </div>,
    container.value!
  );
}
</script>

<template>
  <div>
    <button @click="test1">test1</button>
    <button @click="test2">test2</button>
    <button @click="test3">test3</button>
  </div>
  <div ref="container" />
</template>
