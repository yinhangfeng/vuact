import { Slider as RSlider } from 'antd';
import { r2v } from 'vuact';

export const Slider = r2v(RSlider, {
  vModel: { prop: 'value', event: 'onChange' },
});

export default Slider;
