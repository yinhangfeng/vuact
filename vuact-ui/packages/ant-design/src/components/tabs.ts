import { Tabs as RTabs } from 'antd';
import { r2v } from 'vuact';

export const Tabs = r2v(RTabs, {
  vModel: { prop: 'activeKey', event: 'onChange' },
});

export const TabPane = r2v(RTabs.TabPane);

export default Tabs;
