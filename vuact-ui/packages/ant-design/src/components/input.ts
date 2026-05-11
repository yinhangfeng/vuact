import { Input as RInput } from 'antd';
import { r2v } from 'vuact';

export const Input = r2v(RInput, {
  vModel: { prop: 'value', event: 'onChange' },
  slotsTransformConfig: {
    prefix: { elementProp: true },
    suffix: { elementProp: true },
  },
});
export default Input;
