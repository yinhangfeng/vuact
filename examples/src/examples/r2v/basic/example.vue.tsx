/**
 * r2v/basic/example.vue 的 tsx 版本
 * 当前文件后缀为 .vue.tsx，所以内部的 jsx 会被 vueJsx 插件处理为 vue vnode
 */
import { defineComponent } from 'vue';
import { r2v } from 'vuact';
import Counter from './counter.tsx';

// React 组件转为 Vue 组件
const VCounter = r2v(Counter);

export default defineComponent({
  setup: () => {
    return () => {
      return <VCounter defaultCount={1} />;
    };
  },
});
