import vue from 'vue?url';
import vuact from 'vuact?url';
import vuactJsxRuntime from 'vuact/jsx-runtime?url';
import vuactDom from 'vuact-dom?url';
import vuactDomClient from 'vuact-dom/client?url';

export const builtinModules = __DEV__
  ? {
      vue,
      react: vuact,
      'react-dom': vuactDom,
      vuact: vuact,
      'vuact/jsx-runtime': vuactJsxRuntime,
      'vuact-dom': vuactDom,
      'vuact-dom/client': vuactDomClient,
    }
  : {
      vue: '/vue.js',
      react: '/vuact.js',
      'react/jsx-runtime': '/vuact/jsx-runtime.js',
      'react-dom': '/vuact-dom.js',
      'react-dom/client': '/vuact-dom/client.js',
      vuact: '/vuact.js',
      'vuact/jsx-runtime': '/vuact/jsx-runtime.js',
      'vuact-dom': '/vuact-dom.js',
      'vuact-dom/client': '/vuact-dom/client.js',
    };
