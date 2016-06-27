import React from 'react';
import { connect } from 'react-redux';

export const RECAPTCHA_INITIALIZE = 'redux-recaptcha/INITIALIZE';
export const RECAPTCHA_RESET = 'redux-recaptcha/RESET';
export const RECAPTCHA_LANGUAGE_CHANGE = 'redux-recaptcha/LANGUAGE_CHANGE';
export const RECAPTCHA_CHANGED = 'redux-recaptcha/CHANGED';
export const RECAPTCHA_EXPIRED = 'redux-recaptcha/EXPIRED';

const loadRecaptcha = language => {
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?onload=reduxRecaptchaOnLoad&render=explicit&hl=' + language;
  document.head.appendChild(script);
};

export const resetRecaptcha = () => {
  grecaptcha.reset();
  return { type: RECAPTCHA_RESET };
};

export const changeRecaptchaLanguage = language => {
  const container = document.getElementById('recaptcha-container');
  container.removeChild(container.firstChild);
  loadRecaptcha(language);
  return { type: RECAPTCHA_LANGUAGE_CHANGE, language };
};

const initializeRecaptcha = (language, onLoad) => {
  window.reduxRecaptchaOnLoad = onLoad;
  loadRecaptcha(language);
  return { type: RECAPTCHA_INITIALIZE };
};
const recaptchaChanged = value => ({ type: RECAPTCHA_CHANGED, value });
const recaptchaExpired = value => ({ type: RECAPTCHA_EXPIRED, value });

const ReduxRecaptchaPure = React.createClass({
  propTypes: {
    siteKey: React.PropTypes.string,
    onChange: React.PropTypes.func
  },
  componentDidMount() {
    this.props.initializeRecaptcha(this.props.language, this.onLoad);
  },
  componentWillReceiveProps(nextProps) {
    if ((nextProps.value !== this.props.value) && this.props.onChange) {
      this.props.onChange(nextProps.value);
    }
  },
  onLoad() {
    grecaptcha.render(document.getElementById('recaptcha-container'), {
      sitekey: this.props.siteKey,
      callback: this.props.recaptchaChanged,
      'expired-callback': this.props.recaptchaExpired
    });
  },
  render() {
    return <div id="recaptcha-container" className="recaptcha-container"/>;
  }
});

export const ReduxRecaptcha = connect(
  state => ({
    language: state.recaptcha.language,
    value: state.recaptcha.value
  }),
  { changeRecaptchaLanguage, initializeRecaptcha, recaptchaChanged,
    recaptchaExpired, resetRecaptcha }
)(ReduxRecaptchaPure);

const withoutValue = state => {
  const stateWithoutValue = { ...state };
  delete stateWithoutValue.value;
  return stateWithoutValue;
};

export default (state = { language: 'en' }, action) => {
  switch (action.type) {
    case RECAPTCHA_RESET:
      return withoutValue(state);
    case RECAPTCHA_LANGUAGE_CHANGE:
      return withoutValue({ ...state, language: action.language });
    case RECAPTCHA_CHANGED:
    case RECAPTCHA_EXPIRED:
      return { ...state, value: action.value };
    default:
      return state;
  }
};
