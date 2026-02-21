import * as featureFlags from '../packages/vuact/src/feature-flags.js';

const schedulerFeatureFlags = {
  enableSchedulerDebugging: false,
  enableIsInputPending: false,
  enableProfiling: false,
  enableIsInputPendingContinuous: false,
  frameYieldMs: 5,
  continuousYieldMs: 50,
  maxYieldMs: 300,
};

const environmentFlags = {
  __DEV__,
  build: __DEV__ ? 'development' : 'production',

  experimental: __EXPERIMENTAL__,

  stable: !__EXPERIMENTAL__,

  variant: __VARIANT__,

  persistent: global.__PERSISTENT__ === true,

  FIXME: false,

  dfsEffectsRefactor: true,
  enableUseJSStackToTrackPassiveDurations: false,
};

export function getTestFlags() {
  // These are required on demand because some of our tests mutate them. We try
  // not to but there are exceptions.

  const www = global.__WWW__ === true;
  const releaseChannel = www
    ? __EXPERIMENTAL__
      ? 'modern'
      : 'classic'
    : __EXPERIMENTAL__
      ? 'experimental'
      : 'stable';

  // Return a proxy so we can throw if you attempt to access a flag that
  // doesn't exist.
  return new Proxy(
    {
      // Feature flag aliases
      old: featureFlags.enableNewReconciler === false,
      new: featureFlags.enableNewReconciler === true,

      channel: releaseChannel,
      modern: releaseChannel === 'modern',
      classic: releaseChannel === 'classic',
      source: !process.env.IS_BUILD,
      www,

      // This isn't a flag, just a useful alias for tests.
      enableUseSyncExternalStoreShim: !__VARIANT__,
      enableSuspenseList: releaseChannel === 'experimental' || www,

      // If there's a naming conflict between scheduler and React feature flags, the
      // React ones take precedence.
      // TODO: Maybe we should error on conflicts? Or we could namespace
      // the flags
      ...schedulerFeatureFlags,
      ...featureFlags,
      ...environmentFlags,
    },
    {
      get(flags, flagName) {
        const flagValue = flags[flagName];
        if (flagValue === undefined && typeof flagName === 'string') {
          throw Error(
            `Feature flag "${flagName}" does not exist. See TestFlags.js ` +
              'for more details.'
          );
        }
        return flagValue;
      },
    }
  );
}
