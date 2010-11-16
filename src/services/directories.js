/**
 * Namespace for directory related services.
 * @namespace
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires connection property inherited from an {@link OX.Connection}.
 */
OX.Service.Directories = OX.Base.extend(OX.Mixin.Subscribable, /** @lends OX.Service.Directories */{

  /**
   * URI for the PubSub directories service
   */
  pubSubURI: OX.Settings.URIs.pubSub.directories,

  /**
   * @class AliasItem
   * @extends OX.Item
   */
  AliasItem: OX.Item.extend(/** @lends OX.Service.Directories.AliasItem# */{
    sipURI: null,
    xmppURI: null,
    id: function () {
      console.log(this);
      return this.uri.queryParam('item');
    }
  }),

  /**
   * @class EntityItem
   * @extends OX.Item
   */
  EntityItem: OX.Item.extend(/** @lends OX.Service.Directories.EntityItem# */{
    sipURI: null,
    name: null,
    id: function () {
      console.log(this);
      return this.uri.queryParam('item');
    }
  }),

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
      case 'name':
        attrs.name = value;
        break;
      }
    }

    var ret = aliasNode[0] ? this.AliasItem.extend(attrs) : this.EntityItem.extend(attrs);
    return ret;
  }
});
