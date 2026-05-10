import { defineHints } from '../src/dsl.js';

export default defineHints({
  Button: {
    vModel: 'value'
  },
  Modal: {
    vModel: 'open',
    eventMappings: {
      onOpenChange: 'update:open'
    }
  },
  Input: {
    vModel: 'value',
    slotsTransformConfig: {
      label: {
        type: 'element',
        slotName: 'label'
      }
    }
  },
  Select: {
    vModel: 'value'
  }
});
