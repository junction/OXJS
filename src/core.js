/**
 * @namespace
 * The core namespace for OX. OX is the official OnSIP XMPP-API JavaScript Library.
 * For documentation concerning the OnSIP XMPP-API itself,
 * visit the <a href="http://wiki.onsip.com/docs/XMPP_API">wiki</a>.
 * @version 1.1.0
 */
var OX = {

  /**
   * The version number for OX in the schema of major.minor.patch
   * @type {String}
   */
  VERSION: '1.1.0',

  /**
   * Prints a debug message to the console, if window.console exists.
   * @returns {void}
   */
  debug: function () {
    return window.console && window.console.debug && window.console.debug.apply && window.console.debug.apply(window.console, arguments);
  },

  /**
   * Prints a log to the console, if window.console exists.
   * @returns {void}
   */
  log: function () {
    return window.console && window.console.log && window.console.log.apply && window.console.log.apply(window.console, arguments);
  },

  /**
   * Prints a warning to the console, if window.console exists.
   * @returns {void}
   */
  warn: function () {
    return window.console && window.console.warn && window.console.warn.apply && window.console.warn.apply(window.console, arguments);
  },

  /**
   * Prints an error to the console, if window.console exists.
   * @returns {void}
   */
  error: function () {
    return window.console && window.console.error && window.console.error.apply && window.console.error.apply(window.console, arguments);
  },

  /**
   * Begins a console group, if it's able to; otherwise it tries to print a log.
   * @returns {void}
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
   * @returns {void}
   */
  groupEnd: function () {
    if (window.console && window.console.groupEnd) {
      window.console.groupEnd();
    }
  }

};

/**
 * @namespace
 * <p>Namespace for service mixins.</p>
 * <p>These objects should not be used directly, but only when
 * instantiated from an {@link OX.Connection}.</p>
 * <p>To do actions on a given OnSIP PubSub Service, use {@link OX.Mixin.Subscribable}
 * methods to subscribe, unsubscribe, and get the items the service
 * provides if it's a PubSub service. PubSub services include
 * {@link OX.Service.ActiveCalls}, {@link OX.Service.Directories},
 * {@link OX.Service.UserAgents}, and {@link OX.Service.Voicemail}.</p>
 *
 * <p>For OnSIP Component services, there are calls on the Service
 * for using the Ad-Hoc commands. Component services include
 * {@link OX.Service.ActiveCalls}, {@link OX.Service.Auth}, and
 * {@link OX.Service.Rosters}.</p>
 *
 * <p>For more information about the OnSIP XMPP API services, take a look
 * at the developer documentation.</p>
 * @see OX.Connection
 * @see <a href="http://wiki.onsip.com/docs/XMPP_API">OnSIP XMPP API Developer Documentation</a>
 */
OX.Service = {};

/**
 * @namespace
 * Mixins namespace.
 */
OX.Mixin = {};
