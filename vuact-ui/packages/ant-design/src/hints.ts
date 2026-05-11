import { defineHints } from '../../../../tools/codegen/src/dsl';

export default defineHints({
  Modal: {
    vModel: [
      {
        modelName: 'open',
        prop: 'open',
        event: 'onOpenChange',
      },
    ],
    slotsTransformConfig: {
      footer: { elementProp: true },
      children: { elementProp: true },
    },
    meta: {
      experimental: true,
      docUrl: 'https://ant.design/components/modal',
    },
  },
  Form: {
    meta: {
      experimental: true,
      docUrl: 'https://ant.design/components/form',
    },
    subComponents: {
      Item: {},
      List: {},
      Provider: {},
    },
  },
  Table: {
    meta: {
      experimental: true,
      docUrl: 'https://ant.design/components/table',
    },
  },
  Select: {
    vModel: {
      prop: 'value',
      event: 'onChange',
    },
    slotsTransformConfig: {
      dropdownRender: { transformVNode: true },
      notFoundContent: { elementProp: true },
    },
  },
  DatePicker: {
    vModel: {
      prop: 'value',
      event: 'onChange',
    },
  },
  Input: {
    vModel: {
      prop: 'value',
      event: 'onChange',
    },
  },
  Switch: {
    vModel: {
      prop: 'checked',
      event: 'onChange',
    },
  },
  Checkbox: {
    vModel: {
      prop: 'checked',
      event: 'onChange',
    },
  },
  Radio: {
    vModel: {
      prop: 'checked',
      event: 'onChange',
    },
  },
  TreeSelect: {
    meta: {
      experimental: true,
      docUrl: 'https://ant.design/components/tree-select',
    },
  },
  Cascader: {
    vModel: {
      prop: 'value',
      event: 'onChange',
    },
    meta: {
      experimental: true,
    },
  },
  AutoComplete: {
    vModel: {
      prop: 'value',
      event: 'onSearch',
    },
  },
});
