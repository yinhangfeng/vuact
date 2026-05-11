import { Drawer as RDrawer } from 'antd';
import { r2v } from 'vuact';

export const Drawer = r2v(RDrawer, {
  vModel: [{ modelName: 'open', prop: 'open', event: 'onClose' }],
  slotsTransformConfig: {
    title: { elementProp: true },
  },
});

export default Drawer;
