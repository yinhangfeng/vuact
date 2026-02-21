import { createElement as h } from 'react';
import { isElement } from 'react-is';

export default function ReactTest1() {
  const result = h(
    'div',
    {
      onClick: (e) => {
        console.log('ReactTest1 onClick', e);
      },
    },
    'ReactTest1'
  );

  console.log('ReactTest1', {
    isElement: isElement(result),
  });

  return result;
}
