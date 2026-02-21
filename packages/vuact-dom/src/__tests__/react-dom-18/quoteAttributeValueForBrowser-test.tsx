/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

let React;
let ReactDOMServer;

describe('quoteAttributeValueForBrowser', () => {
  beforeEach(() => {
    jest.resetModules();
    React = require('react');
    ReactDOMServer = require('react-dom/server');
  });

  it('ampersand is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr="&" />);
    expect(response).toMatch('<img data-attr="&amp;"');
  });

  it('double quote is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr={'"'} />);
    expect(response).toMatch('<img data-attr="&quot;"');
  });

  it.skipIf(__VUACT_SKIP_TEST__, 'single quote is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr="'" />);
    expect(response).toMatch('<img data-attr="&#x27;"/>');
  });

  it('greater than entity is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr=">" />);
    expect(response).toMatch('<img data-attr="&gt;"');
  });

  it('lower than entity is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr="<" />);
    expect(response).toMatch('<img data-attr="&lt;"');
  });

  it('number is escaped to string inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(<img data-attr={42} />);
    expect(response).toMatch('<img data-attr="42"');
  });

  it.skipIf(__VUACT_SKIP_TEST__, 'object is passed to a string inside attributes', async () => {
    const sampleObject = {
      toString: function() {
        return 'ponys';
      },
    };

    const response = await ReactDOMServer.renderToString(
      <img data-attr={sampleObject} />,
    );
    expect(response).toMatch('<img data-attr="ponys"/>');
  });

  it.skipIf(__VUACT_SKIP_TEST__, 'script tag is escaped inside attributes', async () => {
    const response = await ReactDOMServer.renderToString(
      <img data-attr={'<script type=\'\' src=""></script>'} />,
    );
    expect(response).toMatch(
      '<img data-attr="&lt;script type=&#x27;&#x27; ' +
        'src=&quot;&quot;&gt;&lt;/script&gt;"/>',
    );
  });
});
