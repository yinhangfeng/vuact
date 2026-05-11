import { TimePicker as RTimePicker } from 'antd';
import { r2v } from 'vuact';

export const TimePicker = r2v(RTimePicker, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default TimePicker;
