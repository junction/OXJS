/**
 * @namespace
 * Item abstract object.
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
