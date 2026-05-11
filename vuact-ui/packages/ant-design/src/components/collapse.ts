import { Collapse as RCollapse } from 'antd';
import { r2v } from 'vuact';

export const Collapse = r2v(RCollapse, {
  vModel: { prop: 'activeKey', event: 'onChange' },
});

export const CollapsePanel = r2v(RCollapse.Panel);

export default Collapse;
