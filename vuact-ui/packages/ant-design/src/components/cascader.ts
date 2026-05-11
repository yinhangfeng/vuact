import { Cascader as RCascader } from 'antd';
import { r2v } from 'vuact';

export const Cascader = r2v(RCascader, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default Cascader;
