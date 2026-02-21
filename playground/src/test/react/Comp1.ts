import {
  createElement,
  reactToVue,
  useEffect,
  useLayoutEffect,
  useState,
} from 'vuact';

export function Comp1(props: { aaa?: string; bbb?: number }) {
  console.log('Comp1 render', {
    props,
  });

  const [state1, setState1] = useState(0);

  useEffect(() => {
    console.log('useEffect callback');
  });

  useLayoutEffect(() => {
    console.log('useLayoutEffect [] callback');
    setState1(9);
  }, []);

  useEffect(() => {
    console.log('useEffect [] callback');
  }, []);

  return createElement(
    'div',
    {
      style: { backgroundColor: '#ddd' },
    },
    'Comp1',
    createElement(
      'div',
      {},
      JSON.stringify({
        state1,
      })
    ),
    createElement(
      'div',
      {
        style: { display: 'flex', padding: '10px' },
      },
      createElement(
        'button',
        {
          onClick: (e: any) => {
            console.log('test1 onClick', e);
            setState1((s) => s + 1);
          },
        },
        'test1'
      )
    )
  );
}

export const VComp1 = reactToVue(Comp1);
