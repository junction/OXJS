/**
 * @namespace
 * Item abstract object.
 * URIs on Items are derived from
 * <a href="http://xmpp.org/extensions/xep-0147.html">XEP-0147: XMPP URI Scheme Query Components</a>.
 *
 * Service items inherit from this one.
 * @extends OX.Base
 */
OX.Item = OX.Base.extend(/** @lends OX.Item# */{
  /**
   * The URI of this item.
   *
   * @type OX.URI.Base
   */
  uri: null
});
