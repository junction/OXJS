/**
 * Namespace for user agent related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Service.UserAgents = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.UserAgents */{
  /**
   * URI for this PubSub service.
   */
  pubSubURI: OX.Settings.URIs.pubSub.userAgents,

  /**
   * User Agent Item.
   * @name OX.Service.UserAgents.Item
   * @namespace
   * @extends OX.Item
   */
  Item: OX.Item.extend(/** @lends OX.Service.UserAgents.Item# */{
    /** The contact of this user agent. */
    contact:  null,

    /** The registration received IP & port. */
    received: null,

    /** The user agent identifier string. */
    device:   null,

    /** The time at which the user agent registration will expire. */
    expires:  null,

    /** The time at which a user-agent dialog event started */
    time: null
  }),

  itemFromElement: function (element) {
    if (!element) {
      return undefined;
    }

    var userAgentNode = element.getElementsByTagName('user-agent'),
        attrs         = {connection: this.connection};

    if (!userAgentNode || !userAgentNode[0]) {
      return undefined;
    }
    var children = userAgentNode[0].childNodes;

    for (var i = 0, len = children.length; i < len; i++) {
      var node = children[i],
          value;

      if (!node.nodeName) {
        continue;
      }

      value = (node.firstChild && node.firstChild.nodeValue) || undefined;
      switch (node.nodeName.toLowerCase()) {
      case 'contact':
        attrs.contact = value;
        break;
      case 'received':
        attrs.received = value;
        break;
      case 'device':
        attrs.device = value;
        break;
      case 'expires':
        attrs.expires = value;
        break;
      case 'time':
        attrs.time = value;
        break;
      }
    }

    return this.Item.extend(attrs);
  }
});
