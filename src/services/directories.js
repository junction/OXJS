/**
 * @namespace
 * <p>Namespace for directory related services.</p>
 * <p>The Directories Service provides subscribed users to
 * recieve updates regarding their organization's directory.</p>
 * <p>There are two node levels that a user can subscribe to:</p>
 *  <ul>
 *    <li>/me/jid</li>
 *    <li>/sip-domain</li>
 *  </ul>
 * <p>Different results <i>may</i> be generated depending upon which node is subscribed to.</p>
 * <p>Please note that subscribing to '/' will redirect your subscription request to '/me/jid'.</p>
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires A 'connectionAdapter' property inherited from an {@link OX.Connection}.
 * @see <a href="http://wiki.onsip.com/docs/Directories_Pubsub">Directories PubSub</a>
 */
OX.Service.Directories = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.Directories */{

  /**
   * URI for the PubSub directories service
   */
  pubSubURI: OX.Settings.URIs.pubSub.directories,

  /**
   * @class
   * A directory item.
   * @extends OX.Item
   */
  Item: OX.Item.extend(/** @lends OX.Service.Directories.Item# */{
    /**
     * The SIP URI of the entry.
     * @type String
     */
    sipURI: null,

    /**
     * The related SIP address.
     * @type OX.URI
     */
    related: null,

    /**
     * The ID of the item.
     * @returns {String} The item attribute of the URI query.
     */
    id: function () {
      return this.uri.queryParam('item');
    }
  })

});

OX.Service.Directories.mixin(/** @lends OX.Service.Directories */{
  /**
   * @class
   * An alias for a contact.
   * @extends OX.Service.Directories.Item
   */
  AliasItem: OX.Service.Directories.Item.extend(/** @lends OX.Service.Directories.AliasItem# */{
    /**
     * The XMPP URI of the alias.
     * @type OX.URI
     */
    xmppURI: null
  }),

  /**
   * @class
   * A contact.
   * @extends OX.Service.Directories.Item
   */
  EntityItem: OX.Service.Directories.Item.extend(/** @lends OX.Service.Directories.EntityItem# */{
    /**
     * The name of the entity.
     * @type OX.URI
     */
    name: null
  }),

  /** @private
   * Returns the appropriate {@link OX.Service.Directories.Item}
   * ({@link OX.Service.Directories.AliasItem} or {@link OX.Service.Directories.EntityItem})
   * from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOMElement contains more than one item node, only the first
   * item node will be returned as an {@link OX.Service.Directories.Item}
   *
   * @param {Element|Node} element The DOM Element or Node to parse into a {@link OX.Service.Directories.Item}
   * @returns {OX.Service.ActiveCalls.Item} The item.
   */
  itemFromElement: function (element) {
    if (!element) {
      return undefined;
    }

    var aliasNode =  element.getElementsByTagName('alias'),
        entityNode = element.getElementsByTagName('entity'),
        node       = aliasNode[0] || entityNode[0],
        attrs      = { connection: this.connection };

    if (!node) {
      return undefined;
    }

    var childNodes = node.childNodes;

    for (var i = 0, len = childNodes.length; i < len; i++) {
      var childNode = childNodes[i],
          childNodeName = childNode.nodeName,
          value = (childNode && childNode.firstChild && childNode.firstChild.nodeValue) || undefined;

      if (!childNode) {
        continue;
      }

      switch (childNodeName.toLowerCase()) {
      case 'sip-uri':
        attrs.sipURI = value;
        break;
      case 'xmpp-uri':
        attrs.xmppURI = OX.URI.parse(value);
        break;
      case 'link':
        if (childNode.getAttribute('rel') === 'related') {
          attrs.related = OX.URI.parse(childNode.getAttribute('href'));
        } else {
          OX.Log.warn('Links with rel="' + childNode.getAttribute('rel') + '" are not supported.');
        }
        break;
      case 'name':
        attrs.name = value;
        break;
      }
    }

    return aliasNode[0] ? this.AliasItem.extend(attrs) : this.EntityItem.extend(attrs);
  }
});
