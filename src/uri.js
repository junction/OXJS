/**
 * URI namespace.
 * @namespace
 * @extends OX.Base
 */
OX.URI = OX.Base.extend(/** @lends OX.URI */{
  /**
   * Parse +string+ as an OX.URI.Base object.
   *
   * @param {String} uriString the URI to parse
   * @returns {OX.URI.Base} A new OX.URI.Base object
   *
   * @example
   * var uri = OX.URI.parse('xmpp:lisa@example.com');
   */
  parse: function (uriString) {
    return OX.URI.Base.extend();
  },

  /**
   * Convert +object+ into an OX.URI.Base object
   *
   * @param {Object} object an object with these members: scheme, path, authority, query, fragment
   * @returns {OX.URI.Base} A new URI object
   *
   * @example
   * var uri = OX.URI.fromObject({scheme: 'xmpp', path: 'lisa@example.com'});
   */
  fromObject: function (object) {
    return OX.URI.Base.extend(object);
  }
});

/**
 * Traits object for URI.
 * @namespace
 * @extends OX.Base
 */
OX.URI.Base = OX.Base.extend(/** @lends OX.URI.Base# */{
  /**
   * The URI scheme.
   * @public
   */
  scheme: null,

  /**
   * The URI authority section.
   * @public
   */
  authority: null,

  /**
   * The URI path.
   * @public
   */
  path: null,

  /**
   * The URI query parameters.
   * @public
   */
  query: null,

  /**
   * The URI fragment identifier.
   * @public
   */
  fragment: null,

  /**
   * Convert URI object to string representation.
   * @public
   */
  toString: function () {
    return 'XXX - Not implemented';
  }
});
