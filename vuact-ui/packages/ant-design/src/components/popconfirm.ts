import { Popconfirm as RPopconfirm } from 'antd';
import { r2v } from 'vuact';

export const Popconfirm = r2v(RPopconfirm, {
  vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
});

export default Popconfirm;
