// TODO
export function createMutableSource(source: any, getVersion: any) {
  const mutableSource = {
    _getVersion: getVersion,
    _source: source,
    _workInProgressVersionPrimary: null,
    _workInProgressVersionSecondary: null,
  };

  return mutableSource;
}
