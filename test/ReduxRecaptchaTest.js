/* globals afterEach, beforeEach, describe, it, grecaptcha, reduxRecaptchaOnLoad, window */
import { assert } from 'chai';
import React from 'react';
import { render } from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import recaptchaReducer, { changeRecaptchaLanguage, ReduxRecaptcha, resetRecaptcha } from '../dist/ReduxRecaptcha';

let container;
let store;
let onChange;

const createTestStore = () => createStore(combineReducers({
  recaptcha: recaptchaReducer
}));

describe('ReduxRecaptcha', () => {
  beforeEach(() => {
    store = createTestStore();

    container = document.createElement('div');
    document.body.appendChild(container);

    window.grecaptcha = {
      render(domNode, options) {
        grecaptcha.render.called = grecaptcha.render.called + 1 || 1;
        grecaptcha.render.args = [domNode, options];
      },
      reset() {
        grecaptcha.reset.called = grecaptcha.reset.called + 1 || 1;
      }
    };

    document.head.appendChild = script => {
      document.head.appendChild.called = document.head.appendChild.called + 1 || 1;
      document.head.appendChild.args = [script];
      const recaptchaContainer = document.getElementById('recaptcha-container');
      recaptchaContainer.appendChild(document.createElement('div'));
      reduxRecaptchaOnLoad();
    };

    onChange = value => {
      onChange.called = onChange.called + 1 || 1;
      onChange.args = [value];
    };
  });

  afterEach(() => {
    if (container) {
      document.body.removeChild(container);
    }
  });

  it('should render', () => {
    render(
      <Provider store={store}>
        <ReduxRecaptcha siteKey="test-key"/>
      </Provider>,
      container
    );

    assert.equal(container.children.length, 1);
    assert.equal(document.head.appendChild.called, 1);
    assert.equal(document.head.appendChild.args[0].src, 'https://www.google.com/recaptcha/api.js?onload=reduxRecaptchaOnLoad&render=explicit&hl=en');
    assert.equal(grecaptcha.render.called, 1);
    assert.equal(grecaptcha.render.args[0], container.firstChild);
    assert.equal(grecaptcha.render.args[0].id, 'recaptcha-container');
    assert.equal(grecaptcha.render.args[0].className, 'recaptcha-container');
    assert.equal(grecaptcha.render.args[1].sitekey, 'test-key');
    assert.equal(store.getState().recaptcha.language, 'en');
    assert.equal(store.getState().recaptcha.value, undefined);
  });

  it('should call onChange on callback', () => {
    render(
      <Provider store={store}>
        <ReduxRecaptcha siteKey="test-key" onChange={onChange}/>
      </Provider>,
      container
    );

    grecaptcha.render.args[1].callback('test123');

    assert.equal(onChange.called, 1);
    assert.equal(onChange.args[0], 'test123');
    assert.equal(store.getState().recaptcha.value, 'test123');
  });

  it('should call onChange on expired-callback', () => {
    render(
      <Provider store={store}>
        <ReduxRecaptcha siteKey="test-key" onChange={onChange}/>
      </Provider>,
      container
    );

    grecaptcha.render.args[1].callback('test123');
    grecaptcha.render.args[1]['expired-callback']();

    assert.equal(onChange.called, 2);
    assert.equal(onChange.args[0], undefined);
    assert.equal(store.getState().recaptcha.value, undefined);
  });

  it('should reset', () => {
    render(
      <Provider store={store}>
        <ReduxRecaptcha siteKey="test-key" onChange={onChange}/>
      </Provider>,
      container
    );

    grecaptcha.render.args[1].callback('test123');

    store.dispatch(resetRecaptcha());

    assert.equal(grecaptcha.reset.called, 1);
    assert.equal(onChange.called, 2);
    assert.equal(onChange.args[0], undefined);
    assert.equal(store.getState().recaptcha.value, undefined);
  });

  it('should change language', () => {
    render(
      <Provider store={store}>
        <ReduxRecaptcha siteKey="test-key" onChange={onChange}/>
      </Provider>,
      container
    );

    grecaptcha.render.args[1].callback('test123');

    store.dispatch(changeRecaptchaLanguage('es'));

    assert.equal(document.head.appendChild.called, 2);
    assert.equal(document.head.appendChild.args[0].src, 'https://www.google.com/recaptcha/api.js?onload=reduxRecaptchaOnLoad&render=explicit&hl=es');
    assert.equal(grecaptcha.render.called, 2);
    assert.equal(store.getState().recaptcha.language, 'es');
    assert.equal(store.getState().recaptcha.value, undefined);
  });
});
