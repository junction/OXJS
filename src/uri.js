/**
 * URI namespace.
 * @namespace
 * @extends OX.Base
 */
OX.URI = OX.Base.extend(/** @lends OX.URI */{

  /**
   * Parse a string into an OX.URI.Base object.
   *
   * @param {String} uriString the URI to parse
   * @returns {OX.URI.Base} A new OX.URI.Base object
   *
   * @example
   *   var uri = OX.URI.parse('xmpp:lisa@example.com');
   *   // -> { path: "lisa@example.com", scheme: "xmpp" }
   */
  parse: function (uriString) {
    var scheme, authority, path, query, fragment;

    // Scan for : to find scheme                    - required
    // Scan between // and / to find authority      - optional
    // Scan from end of authority to ? to find path - required
    // Scan from ? to # to find query               - optional
    // Scan from # to EOL to find fragment          - optional
    var parts = uriString.match(/^([^:]*:)(\/\/[^\/]*\/)?([^?]*)(\?[^#]*)?(#.*)?/);
    if (parts[1]) {
      scheme = parts[1].substr(0, parts[1].length - 1);
    }
    if (parts[2]) {
      authority = parts[2].substr(2, parts[2].length - 2).substr(0, parts[2].length - 3);
    }
    if (parts[3]) {
      path = parts[3];
    }
    if (parts[4]) {
      query = parts[4].substr(1, parts[4].length - 1);
    }
    if (parts[5]) {
      fragment = parts[5].substr(1, parts[5].length - 1);
    }

    return OX.URI.Base.extend({scheme: scheme, authority: authority,
                               path: path, query: query, fragment: fragment});
  },

  /**
   * Convert an object into an OX.URI.Base object.
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
   * Return the action, if any, in the query parameters.
   *
   * @example
   * uri.action();
   *
   * @returns {String} The action of this query, or undefined if none found.
   */
  action: function () {
    if (!this.query) {
      return undefined;
    }

    var parts = this.query.split(';');
    if (parts[0] === '') {
      return undefined;
    } else {
      return parts[0];
    }
  },

  /**
   * Return the value, if any, for a parameter in the query
   * parameters.
   *
   * @example
   * uri.queryParam('paramName');
   *
   * @param {String} param The parameter who's value is looked up.
   * @returns {String} The value of the parameter, or undefined if not found.
   */
  queryParam: function (param) {
    if (!this.query) {
      return undefined;
    }

    var parts = this.query.split(';');
    for (var i = 1, len = parts.length; i < len; i++) {
      var kvp = parts[i].split('=');
      if (kvp[0] === param) {
        return kvp[1] || '';
      }
    }
    return undefined;
  },

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
