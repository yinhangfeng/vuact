import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import { r2v } from 'vuact';

const viewModules = import.meta.glob(['../views/**/*test.*']);

const nameFromPath = (path: string) =>
  path.replace(/^.*\/(?:views|examples)\/(.+)$/, '$1');

const pages: RouteRecordRaw[] = Object.keys(viewModules)
  .map((path) => {
    const name = nameFromPath(path);
    return {
      name,
      path: name === '404' ? '/:patchMatch(.*)*' : `/${name}`,
      component: async () => {
        const { default: component } = (await viewModules[path]()) as any;
        return {
          // function component 认为是 react 组件
          default: typeof component === 'function' ? r2v(component) : component,
        };
      },
      meta: {
        hide: name === '404',
      },
    };
  })
  .filter((it) => it) as any;

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      children: pages,
    },
  ],
});

export default router;
