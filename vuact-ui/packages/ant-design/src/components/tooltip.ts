import { Tooltip as RTooltip } from 'antd';
import { r2v } from 'vuact';

export const Tooltip = r2v(RTooltip, {
  vModel: [{ modelName: 'open', prop: 'open', event: 'onOpenChange' }],
});

export default Tooltip;
