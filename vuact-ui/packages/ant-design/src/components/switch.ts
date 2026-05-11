import { Switch as RSwitch } from 'antd';
import { r2v } from 'vuact';

export const Switch = r2v(RSwitch, {
  vModel: { prop: 'checked', event: 'onChange' },
});
export default Switch;
