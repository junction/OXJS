/**
 * @namespace
 * <p>Namespace for user agent related services.</p>
 * <p>Active Calls pubsub allows for subscribing to evented
 * data regarding the current status of user agents in an OnSIP domain.</p>
 *
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires A 'connectionAdapter' property inherited from an {@link OX.Connection}.
 * @see <a href="http://wiki.onsip.com/docs/User-Agent_Pubsub">UserAgent PubSub</a>
 */
OX.Service.UserAgents = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.UserAgents */{
  /**
   * URI for this PubSub service.
   */
  pubSubURI: OX.Settings.URIs.pubSub.userAgents,

  /**
   * @namespace
   * User Agent Item.
   * @name OX.Service.UserAgents.Item
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

  /** @private
   * Returns an {@link OX.Service.UserAgents.Item} from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOMElement contains more than one item node, only the first
   * item node will be returned as an {@link OX.Service.UserAgents.Item}
   *
   * @param {Element|Node} element The DOM Element or Node to parse into a {@link OX.Service.UserAgents.Item}
   * @returns {OX.Service.UserAgents.Item} The item created from the element passed in.
   */
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
