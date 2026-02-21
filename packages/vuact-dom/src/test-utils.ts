import { act, isValidElement } from 'vuact';
import { render } from './render';

const ELEMENT_NODE = 1;

function renderIntoDocument(element: any) {
  const div = document.createElement('div');
  return render(element, div);
}

const isElement = isValidElement;

function isElementOfType(inst: any, convenienceConstructor: any) {
  return isValidElement(inst) && inst.type === convenienceConstructor;
}

function isDOMComponent(inst: any) {
  return !!(inst && inst.nodeType === ELEMENT_NODE && inst.tagName);
}

function isDOMComponentElement(inst: any) {
  return !!(inst && !!inst.tagName && isValidElement(inst));
}

function isCompositeComponent(inst: any) {
  if (isDOMComponent(inst)) {
    return false;
  }
  return (
    inst != null &&
    typeof inst.render === 'function' &&
    typeof inst.setState === 'function'
  );
}

function isCompositeComponentWithType(inst: any, type: any) {
  if (!isCompositeComponent(inst)) {
    return false;
  }
  return type === inst.constructor;
}

export {
  act,
  renderIntoDocument,
  isElement,
  isElementOfType,
  isDOMComponent,
  isDOMComponentElement,
  isCompositeComponent,
  isCompositeComponentWithType,
  // findAllInRenderedTree,
  // scryRenderedDOMComponentsWithClass,
  // findRenderedDOMComponentWithClass,
  // scryRenderedDOMComponentsWithTag,
  // findRenderedDOMComponentWithTag,
  // scryRenderedComponentsWithType,
  // findRenderedComponentWithType,
  // mockComponent,
  // nativeTouchData,
  // Simulate,
};

export default {
  act,
  renderIntoDocument,
  isElement,
  isElementOfType,
  isDOMComponent,
  isDOMComponentElement,
  isCompositeComponent,
  isCompositeComponentWithType,
};
