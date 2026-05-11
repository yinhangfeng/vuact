import { Checkbox as RCheckbox } from 'antd';
import { r2v } from 'vuact';

export const Checkbox = r2v(RCheckbox, {
  vModel: { prop: 'checked', event: 'onChange' },
});

export const CheckboxGroup = r2v(RCheckbox.Group, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default Checkbox;
