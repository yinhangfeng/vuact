export function propsWithoutRef(props: any) {
  const newProps: any = {};
  for (const key in props) {
    if (key !== 'ref') {
      newProps[key] = props[key];
    }
  }
  return newProps;
}
