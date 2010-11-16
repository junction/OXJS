/**
 * @namespace
 * The core namespace for OX.
 * @version 1.5.0
 */
var OX = {

  /**
   * The version number for OX.
   */
  VERSION: '1.5.0',

  /**
   * Prints a debug message to the console, if window.console exists.
   */
  debug: function () {
    return window.console && window.console.debug && window.console.debug.apply && window.console.debug.apply(window.console, arguments);
  },

  /**
   * Prints a log to the console, if window.console exists.
   */
  log: function () {
    return window.console && window.console.log && window.console.log.apply && window.console.log.apply(window.console, arguments);
  },

  /**
   * Prints a warning to the console, if window.console exists.
   */
  warn: function () {
    return window.console && window.console.warn && window.console.warn.apply && window.console.warn.apply(window.console, arguments);
  },

  /**
   * Prints an error to the console, if window.console exists.
   */
  error: function () {
    return window.console && window.console.error && window.console.error.apply && window.console.error.apply(window.console, arguments);
  },

  /**
   * Begins a console group, if it's able to; otherwise it tries to print a log.
   */
  group: function () {
    if (window.console && window.console.group) {
      window.console.group.apply(window.console, arguments);
    } else {
      OX.log.apply(OX, arguments);
    }
  },

  /**
   * End a console group.
   */
  groupEnd: function () {
    if (window.console && window.console.groupEnd) {
      window.console.groupEnd();
    }
  }

};

/**
 * @namespace
 * Namespace for service mixins.
 *
 * These objects should not be used directly, but only when
 * instantiated from an {@link OX.Connection}.
 * @see OX.Connection
 */
OX.Service = {};

/**
 * @namespace
 * Mixins namespace.
 */
OX.Mixin = {};
