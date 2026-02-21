import React from 'react';

const initialState = {
  test: 0,
};

export default class Test extends React.Component {
  state = initialState;

  constructor() {
    super();
  }

  stateList: any[] = [];

  stateEqualsList = (s: any) => {
    return this.stateList.map((it) => it === s);
  };

  test1 = () => {
    console.log('test1', this.state, this.state === initialState);

    this.stateList = [];
    setTimeout(() => {
      // 0
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      let s = {
        test: 1,
      };
      // 1
      this.stateList.push(s);
      this.setState(s);

      // 2
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      s = {
        test: 2,
      };
      // 3
      this.stateList.push(s);
      this.setState(s);

      // 4
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      this.setState((ss) => {
        // 5
        this.stateList.push(ss);
        console.log('setState state callback', ss, this.stateEqualsList(ss));

        s = {
          test: 3,
        };
        // 6
        this.stateList.push(s);
        return s;
      });

      // 7
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      this.setState(undefined, () => {
        console.log('setState undefined callback');
      });
      console.log('8');
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      this.setState(null, () => {
        console.log('setState null callback');
      });
      console.log('9');
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));

      this.setState({});
      // 10
      this.stateList.push(this.state);
      console.log('test1', this.state, this.stateEqualsList(this.state));
    });
  };

  test2 = () => {
    setTimeout(() => {
      console.log('aaa');
      this.setState(undefined, () => {
        console.log('setState undefined callback');
      });
      this.setState(null, () => {
        console.log('setState null callback');
      });
      console.log('bbb');
    });
  };

  test3 = () => {
    this.setState((s) => {
      console.log('test3 setState state callback', s);
    });
  };

  render() {
    console.log('render', this.state, this.stateEqualsList(this.state));
    return (
      <div>
        <div>react class test</div>
        <button onClick={this.test1}>test1</button>
        <button onClick={this.test2}>test2</button>
        <button onClick={this.test3}>test3</button>
      </div>
    );
  }
}
