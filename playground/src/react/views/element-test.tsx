import React, { createElement, Component } from 'react';

export default class ElementTest extends Component {
  constructor(props: any) {
    super(props);
    console.log('ElementTest constructor', createElement('div'));
  }

  componentWillMount() {
    console.log('ElementTest componentWillMount', createElement('div'));
  }

  componentDidMount() {
    console.log('ElementTest componentDidMount', createElement('div'));
  }

  componentWillUpdate() {
    console.log('ElementTest componentWillUpdate', createElement('div'));
  }

  componentDidUpdate() {
    console.log('ElementTest componentDidUpdate', createElement('div'));
  }

  componentWillUnmount() {
    console.log('ElementTest componentWillUnmount', createElement('div'));
  }

  render() {
    console.log('ElementTest render', createElement('div'));
    return <div>ElementTest</div>;
  }
}
