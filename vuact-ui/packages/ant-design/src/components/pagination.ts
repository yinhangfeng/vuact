import { Pagination as RPagination } from 'antd';
import { r2v } from 'vuact';

export const Pagination = r2v(RPagination, {
  vModel: { prop: 'current', event: 'onChange' },
});

export default Pagination;
