/**
 * @namespace
 * <p>The core namespace for OX. OX is the official OnSIP XMPP-API JavaScript Library.</p>
 *
 * <p>For documentation concerning the OnSIP XMPP-API itself,
 * visit the <a href="http://wiki.onsip.com/docs/XMPP_API">wiki</a>.</p>
 * @version 2.0.1
 */
var OX = {

  /**
   * The version number for OX using <a href="http://semver.org">Semantic Versioning</a>.
   * @type String
   */
  VERSION: '2.1.1',

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
 * provides if it's a PubSub service. PubSub services include:</p>
 * <ul>
 *   <li>{@link OX.Service.ActiveCalls}</li>
 *   <li>{@link OX.Service.Directories}</li>
 *   <li>{@link OX.Service.UserAgents}</li>
 *   <li>{@link OX.Service.Voicemail}</li>
 * </ul>
 *
 * <p>For OnSIP Component services, there are calls on the Service
 * for using the Ad-Hoc commands. Component services include:
 * <ul>
 *   <li>{@link OX.Service.ActiveCalls}</li>
 *   <li>{@link OX.Service.Auth}</li>
 *   <li>{@link OX.Service.Rosters}.</li>
 * </ul>
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
