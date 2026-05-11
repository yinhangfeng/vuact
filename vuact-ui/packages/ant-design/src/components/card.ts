import { Card as RCard } from 'antd';
import { r2v } from 'vuact';

export const Card = r2v(RCard, {
  slotsTransformConfig: {
    title: { elementProp: true },
    extra: { elementProp: true },
  },
});

export default Card;
