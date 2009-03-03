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
    var scheme, authority, path, query, fragment;

    // Scan for : to find scheme                    - required
    // Scan between // and / to find authority      - optional
    // Scan from end of authority to ? to find path - required
    // Scan from ? to # to find query               - optional
    // Scan from # to EOL to find fragment          - optional
    var parts = uriString.match(/^([^:]*:)(\/\/[^\/]*\/)?([^?]*)(\?[^#]*)?(#.*)?/);
    if (parts[1])
      scheme = parts[1].substr(0, parts[1].length - 1);
    if (parts[2])
      authority = parts[2].substr(2, parts[2].length - 2).substr(0, parts[2].length - 3);
    if (parts[3])
      path = parts[3];
    if (parts[4])
      query = parts[4].substr(1, parts[4].length - 1);
    if (parts[5])
      fragment = parts[5].substr(1, parts[5].length - 1);

    return OX.URI.Base.extend({scheme: scheme, authority: authority,
                               path: path, query: query, fragment: fragment});
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
   *
   * @default "xmpp"
   */
  scheme: 'xmpp',

  /**
   * The URI authority section.
   */
  authority: null,

  /**
   * The URI path.
   */
  path: null,

  /**
   * The URI query parameters.
   */
  query: null,

  /**
   * The URI fragment identifier.
   */
  fragment: null,

  /**
   * Convert URI object to string representation.
   */
  toString: function () {
    var authority = this.authority ? '//' + this.authority + '/' : '',
        query     = this.query     ? '?'  + this.query           : '',
        fragment  = this.fragment  ? '#'  + this.fragment        : '';
    return this.scheme + ':' + authority + this.path + query + fragment;
  }
});
