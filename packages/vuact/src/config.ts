import { inject, provide, type InjectionKey } from 'vue';
import { enableRefAsProp } from './feature-flags';

export interface VuactConfig {
  /**
   * 是否开启同步更新回调
   */
  enableSyncUpdated?: boolean;
  /**
   * 是否开启异步渲染
   */
  asyncMode?: boolean;
  /**
   * 是否需要修复外部 dom 修改导致的异常
   */
  fixExternalDomModification?: boolean;
  isSSR?: boolean;
  /**
   * 是否启用了 vuact renderer
   * Vuact renderer 可以提供属转换(如 className => class， style 兼容等)，事件增强等功能
   * 依赖 `@vuact/runtime-dom`
   */
  vuactRendererEnabled?: boolean;
  /**
   * 是否需要将 vnode props 从 react props 转为 vue 兼容的 props
   * 当启用 vuact renderer 时可以关闭，转换将延迟到 renderer 中进行（可以避免在每次 render 时都进行转换，提高性能）
   */
  transformVNodeProps?: boolean;
  /**
   * 是否将 ref 作为 props 传递
   */
  refAsProp?: boolean;
}

export const globalConfig: VuactConfig = {
  enableSyncUpdated: true,
  asyncMode: true,
  fixExternalDomModification: false,
  vuactRendererEnabled: false,
  transformVNodeProps: true,
  refAsProp: enableRefAsProp,
};

const configInjectionKey: InjectionKey<VuactConfig> =
  Symbol.for('vuact.config');

export function useConfig() {
  return inject(configInjectionKey, globalConfig);
}

export type ConfigProviderOptions = VuactConfig;

export function useConfigProvider(options: ConfigProviderOptions) {
  const parentConfig = useConfig();
  const config = {
    ...parentConfig,
    ...options,
  };
  provide(configInjectionKey, config);
  return config;
}
