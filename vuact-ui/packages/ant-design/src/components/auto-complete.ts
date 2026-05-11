import { AutoComplete as RAutoComplete } from 'antd';
import { r2v } from 'vuact';

export const AutoComplete = r2v(RAutoComplete, {
  vModel: { prop: 'value', event: 'onSearch' },
});

export default AutoComplete;
