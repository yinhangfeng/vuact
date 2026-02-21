<script setup lang="ts">
import { h, ref } from 'vue';
import { createElement } from 'react';
import { ClassComponent1, VClassComponent1 } from '../vuact/class-component1';
import {
  FunctionComponent1,
  VFunctionComponent1,
} from '../vuact/function-component1';
import {
  FunctionComponent2,
  VFunctionComponent2,
} from '../vuact/function-component2';
import {
  FunctionComponent3,
  VFunctionComponent3,
} from '../vuact/function-component3';

import { DefineComponent1, RDefineComponent1 } from './define-component1';
import { DefineComponent2, RDefineComponent2 } from './define-component2';
import { SfcComponent1, RSfcComponent1 } from './sfc-component1';
import { ComponentOptions1, RComponentOptions1 } from './component-options1';

function test1() {
  const classComponent1Ref = ref<InstanceType<typeof VClassComponent1>>();
  h(VClassComponent1, {
    string1: 'string1',
    number1: 111,
    ref: classComponent1Ref,
  });

  classComponent1Ref.value?.instance.test();

  h(VFunctionComponent1, {
    string1: 'string1',
    number1: 111,
  });

  h(VFunctionComponent2, {
    string1: 'string1',
    number1: 111,
  });

  const functionComponent3Ref = ref<InstanceType<typeof VFunctionComponent3>>();
  h(
    VFunctionComponent3,
    {
      string1: 'string1',
      number1: 111,
      ref: functionComponent3Ref,
    },
    {}
  );
}

function test2() {
  createElement(ClassComponent1, {
    string1: 'string1',
    number1: 111,
    ref: (v) => {
      console.log(v);
    },
  });
  createElement(FunctionComponent1, {
    string1: 'string1',
    number1: 111,
    // ref: (v) => {
    //   console.log(v);
    // },
  });
  createElement(FunctionComponent2, {
    string1: 'string1',
    number1: 111,
    // ref: (v) => {
    //   console.log(v);
    // },
  });
  createElement(FunctionComponent3, {
    string1: 'string1',
    number1: 111,
    ref: (v) => {
      console.log(v);
    },
  });
}

function test3() {
  h(DefineComponent1, {
    string1: 'string1',
    number1: 111,
  });

  h(DefineComponent2, {
    string1: 'string1',
    number1: 111,
  });

  h(SfcComponent1, {
    string1: 'string1',
    number1: 111,
  });
}

function test4() {
  createElement(RDefineComponent1, {
    string1: 'string1',
    number1: 111,
    ref: (v) => {
      console.log(v);
    },
  });
  createElement(RDefineComponent2, {
    string1: 'string1',
    number1: 111,
    ref: (v) => {
      console.log(v);
    },
  });
  createElement(RSfcComponent1, {
    string1: 'string1',
    number1: 111,
    ref: (v) => {
      console.log(v);
    },
  });
}
</script>
<template>
  <div>
    <VClassComponent1 string1="string1" :number1="111">
      <template #default />
    </VClassComponent1>
    <VFunctionComponent1 string1="string1" :number1="111" />
    <VFunctionComponent2 string1="string1" :number1="111" />
    <VFunctionComponent3 string1="string1" :number1="111">
      <template #default />
      <template #renderAaa />
    </VFunctionComponent3>

    <DefineComponent1 string1="string1" :number1="111" />
    <DefineComponent2 string1="string1" :number1="111" />
    <SfcComponent1 string1="string1" :number1="111" />
    <ComponentOptions1 string1="string1" :number1="111" />
  </div>
</template>
