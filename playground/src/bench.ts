/**
 * 使用 js-framework-benchmark 进行测试
 * git clone https://github.com/krausest/js-framework-benchmark.git
 */

import './js-framework-benchmark/css/bootstrap/dist/css/bootstrap.min.css';
import './js-framework-benchmark/css/main.css';
import React from 'react';

// 代替 auto import react
window.React = React;

const bench =
  new URL(location.href).searchParams.get('framework') ?? 'keyed/react-hooks';

const benchs: Record<string, () => void> = {
  'keyed/react-hooks': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-hooks/src/main.jsx'
    );
  },
  'keyed/react-classes': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-classes/src/main.jsx'
    );
  },
  'keyed/react-hooks-use-transition': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-hooks-use-transition/src/main.jsx'
    );
  },
  'keyed/react-redux': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-redux/src/main.jsx'
    );
  },
  'keyed/react-redux-hooks': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-redux-hooks/src/main.jsx'
    );
  },
  'keyed/react-redux-hooks-immutable': () => {
    import(
      './js-framework-benchmark/frameworks/keyed/react-redux-hooks-immutable/src/main.jsx'
    );
  },
  'keyed/react-mobX': () => {
    import('./js-framework-benchmark/frameworks/keyed/react-mobX/src/Main.jsx');
  },
  // 'non-keyed/react-classes': () => {
  //   import(
  //     './js-framework-benchmark/frameworks/non-keyed/react-classes/src/main.jsx'
  //   );
  // },
};

benchs[bench]();
