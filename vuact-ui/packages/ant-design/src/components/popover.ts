import { Popover as RPopover } from 'antd';
import { r2v } from 'vuact';

export const Popover = r2v(RPopover, {
  vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
});

export default Popover;
