import { DatePicker as RDatePicker } from 'antd';
import { r2v } from 'vuact';

export const DatePicker = r2v(RDatePicker, {
  vModel: { prop: 'value', event: 'onChange' },
});

export const RangePicker = r2v(RDatePicker.RangePicker, {
  vModel: { prop: 'value', event: 'onChange' },
});

export const MonthPicker = r2v(RDatePicker.MonthPicker);
export const WeekPicker = r2v(RDatePicker.WeekPicker);
export const YearPicker = r2v(RDatePicker.YearPicker);

export default DatePicker;
