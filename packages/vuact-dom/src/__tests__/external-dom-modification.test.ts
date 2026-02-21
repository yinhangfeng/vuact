import { describe, it, expect } from 'vitest';
import { createElement, useRef, useState, useEffect } from 'vuact';
import { createRoot } from 'vuact-dom/client';

describe('external dom modification test', () => {
  it('should not throw when external clear empty dom', async () => {
    function Foo() {
      const ref1 = useRef<HTMLElement>();
      const [flag1, setFlag1] = useState(false);
      useEffect(() => {
        // 外部修改了 dom，清空了 div
        ref1.current!.innerHTML = '';
        // 触发渲染 span，react 由于第一次渲染时不会渲染内容而不会造成影响，而 vue 会因为渲染的 comment 从 div 去掉了，没有了 parentNode 而造成异常
        setFlag1(true);
      }, []);

      return createElement(
        'div',
        {
          ref: ref1,
        },
        createElement(Bar, { flag1 })
      );
    }

    function Bar({ flag1 }: any) {
      return flag1 ? createElement('span') : null;
    }

    const container = document.createElement('div');
    const root = createRoot(container, {
      config: {
        fixExternalDomModification: true,
      },
    } as any);

    root.render(createElement(Foo));

    await new Promise((resolve) => setTimeout(resolve, 800));

    expect(container.innerHTML).toBe('<div><span></span></div>');
  });
});
