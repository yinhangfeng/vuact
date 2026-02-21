import { Component } from 'react';

export default class Example extends Component<any, { count: number }> {
  constructor(props: any) {
    super(props);

    this.state = {
      count: 0,
    };
  }

  incCount() {
    this.setState((state) => {
      return {
        count: state.count + 1,
      };
    });
  }

  render() {
    return (
      <div>
        <p>count {this.state.count}</p>
      </div>
    );
  }
}
