import { isUnitlessNumber } from './css-property';
import { hasOwn } from './utils/utils';

/**
 * 将 react style 转为 vue style
 * 主要是将类似 { height: 1 } 转为 { height: '1px' }
 * TODO 如果是 vueStyleToReactStyle 转过来的不需要再次转换
 */
export function reactStyleToVueStyle(style: any) {
  if (!style) {
    return;
  }

  const result: Record<string, any> = {};
  let updated = false;
  for (let styleName in style) {
    if (!hasOwn(style, styleName)) {
      continue;
    }
    const isCustomProperty = styleName.startsWith('--');

    let styleValue = style[styleName];
    if (
      !isCustomProperty &&
      typeof styleValue === 'number' &&
      styleValue !== 0 &&
      !isUnitlessNumber[styleName]
    ) {
      styleValue = styleValue + 'px'; // Presumes implicit 'px' suffix for unitless numbers
      updated = true;
    } else if (typeof styleValue === 'string') {
      const temp = styleValue.trim();
      if (styleValue !== temp) {
        styleValue = temp;
        updated = true;
      }
    } else if (typeof styleValue === 'boolean') {
      styleValue = '';
      updated = true;
    }
    if (styleName === 'float') {
      styleName = 'cssFloat';
      updated = true;
    }
    result[styleName] = styleValue;
  }
  return updated ? result : style;
}

/**
 * 将 vue style 转为 react style
 */
export function vueStyleToReactStyle(style: any) {
  // 不需要转换，但可以标记一下，后续转回 vue style 时可以跳过
  return style;
}
