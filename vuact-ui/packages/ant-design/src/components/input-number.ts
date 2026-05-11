import { InputNumber as RInputNumber } from 'antd';
import { r2v } from 'vuact';

export const InputNumber = r2v(RInputNumber, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default InputNumber;
