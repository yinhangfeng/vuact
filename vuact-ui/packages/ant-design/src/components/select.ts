import { Select as RSelect } from 'antd';
import { r2v } from 'vuact';

export const Select = r2v(RSelect, {
  vModel: { prop: 'value', event: 'onChange' },
  slotsTransformConfig: {
    dropdownRender: { transformVNode: true },
    notFoundContent: { elementProp: true },
  },
});
export default Select;
