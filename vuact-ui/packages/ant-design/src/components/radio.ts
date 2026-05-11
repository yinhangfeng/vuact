import { Radio as RRadio } from 'antd';
import { r2v } from 'vuact';

export const Radio = r2v(RRadio, {
  vModel: { prop: 'checked', event: 'onChange' },
});

export const RadioGroup = r2v(RRadio.Group, {
  vModel: { prop: 'value', event: 'onChange' },
});

export const RadioButton = r2v(RRadio.Button);

export default Radio;
