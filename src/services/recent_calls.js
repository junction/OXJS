/**
 * @namespace
 * Namespace for recent call related services. This service has not been implemented yet.
 * @extends OX.Base
 * @extends OX.Mixin.Subscribable
 * @requires A 'connectionAdapter' property inherited from an {@link OX.Connection}.
 */
OX.Service.RecentCalls = OX.Base.extend(OX.Mixin.Subscribable,
  /** @lends OX.Service.RecentCalls */{

  /**
   * URI for this PubSub service.
   */
  pubSubURI: OX.Settings.URIs.pubSub.recentCalls,

  /**
   * @namespace
   * Recent Call Item.
   * @name OX.Service.RecentCalls.Item
   * @extends OX.Item
   */
  Item: OX.Item.extend(OX.Mixin.CallDialog,
    /** @lends OX.Service.RecentCalls.Item# */{

    /** The URI of the call originator. */
    fromURI: null,

    /** The URI of the call terminator. */
    toURI: null,

    /** Caller ID information for the caller */
    fromDisplay: null,

    /** Caller ID information for the callee */
    toDisplay: null,

    /** The time at which the call started. */
    startTime: null,

    /** The duration of the call, in seconds */
    duration: null,

    /** Whether or not the call is outgoing */
    isOutgoing: function () {
      return this.toURI != null;
    },

    /** Whether or not the call is incoming */
    isIncoming: function () {
      return this.fromURI != null;
    },

    /** Whether or not the call was cancelled */
    isCancelled: function () {
      return this.isOutgoing() && this.duration === 0;
    },

    /** Whether or not the call was missed */
    isMissed: function () {
      return this.isIncoming() && this.duration === 0;
    }
  }),

  /** @private
   * Returns an {@link OX.Service.RecentCalls.Item} from an XML Document.
   * This method should be called once for each item to be constructed.
   * If a DOM Element contains more than one item node, only the first
   * item node will be returned as an {@link OX.Service.RecentCalls.Item}
   *
   * @param {Element|Node} element The DOM Element or Node to parse into a {@link OX.Service.RecentCalls.Item}
   * @returns {OX.Service.RecentCalls.Item} item
   */
  itemFromElement: function (element) {
    if (!element) {
      return undefined;
    }

    var recentCallNode = element.getElementsByTagName('recent-call'),
        attrs          = {connection: this.connection};

    if (!recentCallNode || !recentCallNode[0]) {
      return undefined;
    }

    var childNodes = recentCallNode[0].childNodes, node, d;
    for (var i = 0, len = childNodes.length; i < len; i++) {
      node = childNodes[i];

      if (!node.nodeName) {
        continue;
      }

      switch (node.nodeName.toLowerCase()) {
      case 'from-uri':
        attrs.fromURI = node.firstChild.nodeValue;
        break;
      case 'to-uri':
        attrs.toURI = node.firstChild.nodeValue;
        break;
      case 'branch':
        attrs.branch = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'from-display':
        attrs.fromDisplay = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'to-display':
        attrs.toDisplay = node.firstChild && node.firstChild.nodeValue;
        break;
      case 'time':
        d = node.getAttribute('start').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)(Z|(([+-])(\d{2}):(\d{2})))$/i);
        if (!d) throw new OX.Error("ISO Date was improperly formatted: " + node.getAttribute('start'));
        attrs.startTime = new Date(
          Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6] | 0, (d[6] * 1000 - ((d[6] | 0) * 1000)) | 0, d[7]) +
            (d[7].toUpperCase() === "Z" ? 0 : (d[10] * 3600 + d[11] * 60) * (d[9] === "-" ? 1000 : -1000)));
        attrs.duration = +node.getAttribute('duration');
        break;
      }
    }

    return this.Item.extend(attrs);
  }

});
