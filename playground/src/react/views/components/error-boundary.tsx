import React, { Component } from 'react';

export default class ErrorBoundary extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>ErrorBoundary Something went wrong.</h1>;
    }

    return this.props.children;
  }
}
