import { flushSync } from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import SchedulerMatchers from './schedulerTestMatchers';

function captureAssertion(fn) {
  try {
    fn();
  } catch (error) {
    return {
      pass: false,
      message: () => error.message,
    };
  }
  return { pass: true };
}

function toMatchRenderedOutput(ReactNoop, expectedJSX) {
  return captureAssertion(() => {
    const root = ReactNoop.root ?? ReactNoop;
    const container = root._internalRoot.containerInfo;
    const expectedContainer = document.createElement('div');
    // TODO expectedJSX 是 vuact 创建的
    flushSync(() => {
      ReactDOMClient.createRoot(expectedContainer).render(expectedJSX);
    });
    // await new Promise((resolve) => setTimeout(resolve, 20));
    // ReactDOMClient.render(expectedJSX, expectedContainer);
    expect(container.innerHTML?.replaceAll('<!---->', '')).toEqual(
      expectedContainer.innerHTML
    );
  });
}

export default {
  ...SchedulerMatchers,
  toMatchRenderedOutput,
};
