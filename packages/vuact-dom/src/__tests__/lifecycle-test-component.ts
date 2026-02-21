import type * as React from 'react';

interface Options {
  React: typeof React;
  newApi?: boolean;
  depth?: number;
  log: (tag: string, msg: any, ...args: any[]) => void;
}

export function createLogFun() {
  const logs: any[] = [];
  function log(
    tag: string,
    msg:
      | string
      | {
          msg: string;
          nextTick?: boolean;
        },
    ...args: any[]
  ) {
    let nextTick = true;
    if (typeof msg === 'object') {
      nextTick = msg.nextTick !== false;
      msg = msg.msg;
    }

    if (typeof __TEST__ === 'undefined') {
      console.log(tag, msg, ...args);
    }
    logs.push([tag, msg, ...args]);
    if (nextTick) {
      Promise.resolve().then(() => {
        if (typeof __TEST__ === 'undefined') {
          console.log('__NEXT_TICK__', tag, msg);
        }
        logs.push(['__NEXT_TICK__', tag, msg]);
      });
    }
  }
  log.logs = logs;
  log.clearLogs = () => {
    logs.length = 0;
  };
  return log;
}

export function createLifecycleTestClassComponent({
  React,
  newApi = false,
  depth = 3,
  log,
}: Options) {
  class TestComp extends React.Component<any, any> {
    static defaultProps = {
      defaultProp: 'defaultProp',
    };

    static childContextTypes = {
      aaa: null,
    };

    state = {
      xxx: 1,
      count: -2,
    };

    div: any;

    get tag() {
      return this.props.tag ?? 'L0';
    }

    get level() {
      return this.tag.split('_').length - 1;
    }

    get leaf() {
      return this.tag.split('_').length >= depth;
    }

    constructor(props: any) {
      super(props);
      log(this.tag, 'constructor', props);
      if (this.level === 0) {
        log(this.tag, 'constructor before setState');
        this.setState(
          (prevState: any, props: any) => {
            log(
              this.tag,
              'constructor setState state callback',
              prevState,
              props
            );
            return {
              count: -1,
            };
          },
          () => {
            log(this.tag, 'constructor setState callback', this.state);
          }
        );
        log(this.tag, 'constructor after setState');

        log(this.tag, 'constructor before setState1');
        this.setState(
          {
            count: 0,
          },
          () => {
            log(this.tag, 'constructor setState1 callback', this.state);
          }
        );
        log(this.tag, 'constructor after setState1');
      }
    }

    update = (newState: any) => {
      log(this.tag, 'update before setState', newState);
      this.setState(
        (prevState: any) => {
          log(this.tag, 'update setState state callback', newState, prevState);
          return {
            ...newState,
          };
        },
        () => {
          log(this.tag, 'update setState callback', this.state);
        }
      );
      log(this.tag, {
        msg: 'update after setState',
        // vuact root.render 和 setState 之后会在 nextTick 执行，而 react 会在 setTimeout 执行，所以下面的 __NEXT_TICK__ log 顺序不一致
        nextTick: !__VUACT_SKIP_TEST__,
      });
    };

    render() {
      log(this.tag, 'render', this.state);
      const div = React.createElement(
        'div',
        {
          key: 'a',
          ref: (r) => {
            log(this.tag, 'div ref', r != null);
            this.div = r;
          },
          data: this.props.data,
        },
        this.tag
      );
      if (this.leaf) {
        return div;
      }

      return [
        div,
        React.createElement(TestComp, {
          key: '0',
          tag: `${this.tag}_0`,
          errorKey: this.props.errorKey,
          data: this.props.data,
          ref: (r) => {
            log(this.tag, `${this.tag}_0 ref`, r != null);
          },
        }),
        React.createElement(TestComp, {
          key: '1',
          tag: `${this.tag}_1`,
          errorKey: this.props.errorKey,
          data: this.props.data,
          ref: (r) => {
            log(this.tag, `${this.tag}_1 ref`, r != null);
          },
        }),
      ];
    }
  }

  [
    !newApi && 'UNSAFE_componentWillMount',
    'componentDidMount',
    'shouldComponentUpdate',
    !newApi && 'UNSAFE_componentWillReceiveProps',
    !newApi && 'UNSAFE_componentWillUpdate',
    'componentDidUpdate',
    'componentWillUnmount',
    newApi && 'getSnapshotBeforeUpdate',
    'componentDidCatch',
    // 'getChildContext', // react19 不支持
  ].forEach((key) => {
    if (!key) {
      return;
    }
    TestComp.prototype[key] = function (...args: any[]) {
      log(this.tag, key, args);

      if (this.leaf && this.props.errorKey === key) {
        throw new Error(`${this.tag} ${key} error`);
      }

      if (key === 'shouldComponentUpdate') {
        return true;
      }
      if (key === 'getChildContext') {
        return {
          aaa: 1,
        };
      }
      return null;
    };
  });

  if (newApi) {
    TestComp.getDerivedStateFromProps = function getDerivedStateFromProps(
      nextProps: any,
      prevState: any
    ) {
      log(nextProps.tag, 'getDerivedStateFromProps', [nextProps, prevState]);
      return {};
    };
  }
  TestComp.getDerivedStateFromError = function getDerivedStateFromError(
    error: any
  ) {
    log('getDerivedStateFromError', 'getDerivedStateFromError', error);
    return {};
  };

  return TestComp;
}

export function createLifecycleTestFunctionComponent({
  React,
  depth = 3,
  log,
}: Options) {
  function TestComp(props: any) {
    const tag = props.tag ?? 'L0';
    const leaf = tag.split('_').length >= depth;
    const divRef = React.useRef(null);
    const [state, setState] = React.useState({});
    const [reducerState, dispatch] = React.useReducer(
      (prevState: any, action: any) => {
        log(tag, 'reducer', prevState, action);
        return action;
      },
      null,
      () => {
        log(tag, 'reducer init');
        return {
          a: 1,
        };
      }
    );
    React.useLayoutEffect(() => {
      log(tag, 'useLayoutEffect', state, reducerState);

      if (props.errorKey === 'useLayoutEffect') {
        throw new Error(`${tag} useLayoutEffect error`);
      }

      return () => {
        log(tag, 'useLayoutEffect cleanup');
        if (props.errorKey === 'useLayoutEffect cleanup') {
          throw new Error(`${tag} useLayoutEffect cleanup error`);
        }
      };
    });
    React.useLayoutEffect(() => {
      log(tag, 'useLayoutEffect []');
      return () => {
        log(tag, 'useLayoutEffect [] cleanup');
      };
    }, []);
    React.useEffect(() => {
      log(tag, 'useEffect', state, reducerState);
      if (props.errorKey === 'useEffect') {
        throw new Error(`${tag} useEffect error`);
      }
      return () => {
        log(tag, 'useEffect cleanup');
        if (props.errorKey === 'useEffect cleanup') {
          throw new Error(`${tag} useEffect cleanup error`);
        }
      };
    });
    React.useEffect(() => {
      log(tag, 'useEffect []');
      return () => {
        log(tag, 'useEffect [] cleanup');
      };
    }, []);

    React.useImperativeHandle(
      props.ref || props.customRef,
      () => {
        return {
          update: (newState: any) => {
            log(tag, 'update before setState', newState);
            setState((prevState: any) => {
              log(tag, 'update setState state callback', newState, prevState);
              return {
                ...newState,
              };
            });
            log(tag, 'update after setState');
          },
          dispatch: (action: any) => {
            log(tag, 'dispatch before dispatch', action);
            dispatch(action);
            log(tag, 'dispatch after dispatch');
          },
        };
      },
      []
    );

    log(tag, 'render', props, state, reducerState);
    const div = React.createElement(
      'div',
      {
        key: 'a',
        ref: (r) => {
          log(tag, 'div ref', r != null);
          divRef.current = r;
        },
        data: props.data,
      },
      tag
    );
    if (leaf) {
      return div;
    }

    return [
      div,
      React.createElement(TestComp, {
        key: '0',
        tag: `${tag}_0`,
        errorKey: props.errorKey,
        data: props.data,
        ref: (r) => {
          log(tag, `${tag}_0 ref`, r != null);
        },
        customRef: (r) => {
          log(tag, `${tag}_0 ref`, r != null);
        },
      }),
      React.createElement(TestComp, {
        key: '1',
        tag: `${tag}_1`,
        errorKey: props.errorKey,
        data: props.data,
        ref: (r) => {
          log(tag, `${tag}_1 ref`, r != null);
        },
        customRef: (r) => {
          log(tag, `${tag}_1 ref`, r != null);
        },
      }),
    ];
  }
  return TestComp;
}
