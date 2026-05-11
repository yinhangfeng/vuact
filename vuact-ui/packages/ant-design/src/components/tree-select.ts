import { TreeSelect as RTreeSelect } from 'antd';
import { r2v } from 'vuact';

export const TreeSelect = r2v(RTreeSelect, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default TreeSelect;
