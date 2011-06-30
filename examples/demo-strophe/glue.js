/**
 *  Introduction:
 *  -------------
 *  glue.js is a sample application that spotlights OXJS,
 *  the JavaScript SDK developed by Junction Networks.
 *
 *  OX was implemented for the purpose of abstracting the
 *  low level XMPP messaging used for real-time events.
 *  In this light, developers could focus entirely on the
 *  business requirements of their application.
 *
 *  Use OXJS if you need to build a web application that
 *  features real-time call events. Use the sample code in
 *  glue.js to guide you in your development using OX against
 *  Junction's XMPP based API.
 *
 *  glue.js will illustrate how to :
 *
 *    - Make SIP calls
 *    - Retrieve notifications of call states
 *      (eg. Whether the call was answered, terminated, etc.)
 *    - Manage your Roster
 *
 *
 *  Getting Started:
 *  ----------------
 *  In order to work around Same Origin Policy issues, add the following
 *  snippet to your Apache config file:
 *
 *      SSLProxyEngine on
 *      ProxyPass /http-bind https://my.onsip.com/http-bind
 *      ProxyPassReverse /http-bind http://my.onsip.com/http-bind
 *
 *  To run this Demo application you'll need to point your root web
 *  folder to the root directory of your OXJS download.
 *  For instance :
 *      http://localhost/OXJS/examples/demo-strophe/index.html
 *  You can access API documentation via
 *      http://localhost/OXJS/doc/public/index.html
 *
 *  Gotchas:
 *  --------
 *  There are some nuances to working with Junction's XMPP API
 *  that are worth it to mention.
 *
 *    - The create call (`OX.Service.ActiveCalls.create`) functionality
 *      is an adhoc command that is fairly atomic. It doesn't require
 *      callback handlers or authorization as is the case for call-event
 *      notifications.
 *
 *    - In order to be notified of call events (e.g. call answered,
 *      call hungup, call created), 3 steps need to be taken in the
 *      development of the application.
 *
 *      a. You need to register callback handlers for these asynchronous events.
 *      b. You need to authorize yourself (This must be done every hour)
 *      c. You need to subscribe. (Use the flag `reuseSubscriptions`
 *         to ensure that you don't reach the upper bounds of the maximum
 *         number of subscriptions your client has). Not setting this
 *         flag would require you, the developer, to manage your user agent's
 *         subscriptions using calls `OX.Service.ActiveCalls.subscribe` for
 *         new subscriptions and `OX.Service.ActiveCalls.configureNodeSubscription`
 *         if the subscription already exists and needs to be refreshed.
 *
 *    - There is one callback handler that's registered for `onPublish`
 *      events which includes states signifying incoming, answered, created calls.
 *      There is a separate handler, `onRetract`, for terminated calls.
 *
 *    - Calling `OX.Service.ActiveCalls.create` (in OX) or `callCreate`
 *      (in this Demo) will effectively ring your phone as part of the
 *      call setup process. When you answer your phone, OnSIP will dial
 *      out to its intended caller. The XMPP API will fire an event that
 *      calls the appropriate registered handler.
 */

/* globals DemoApp Strophe $ */
DemoApp = {};

function htmlEnc(str) {
  return str.split(/&/).join("&amp;")
            .split(/;/).join("&semi;")
            .split(/</).join("&lt;")
            .split(/>/).join("&gt;");
}

function logMessage(xml, outbound) {
  var sent = (!!outbound) ? 'outbound' : 'inbound',
      msg  = "<div class='msg %s'>" + htmlEnc(xml) + "</div>";
  if (window.console && window.console.debug) {
    console.debug('(' + sent + ') - ' + xml);
  }
  msg = msg.replace(/%s/, sent);
  $('#message_pane_inner').append(msg);
  $('#message_pane_inner :last').get(0).scrollIntoView();
}

function _getFormValue(formID, inputName) {
  return $('form#' + formID + ' input[name=' + inputName + ']').val();
}

function _addOutput(selector, msg) {
  $(selector).append("<li>" + msg + "</li>");
}

/**
 * Strophe callback function
 *
 * @param status connection status
 *
 * @see <a href="http://strophe.im/strophejs/">Strophe JS</a>
 */
function handleStatusChanged(status) {
  switch (status) {
  case Strophe.Status.CONNECTED:
    $('#logged_out_pane').hide();
    $('#logged_in_pane').show();
    $('#err').html('');
    $('#logged_in_as').text(DemoApp.Strophe.bosh.jid);
    DemoApp.Strophe.bosh.send($pres().tree());
    break;
  case Strophe.Status.DISCONNECTED:
    $('#logged_out_pane').show();
    break;
  default:
    console.debug('Status changed: ' + status);
  }
}

/**
 * OX relies on an underlying XMPP library to
 * negotiate the network layer transactions, but it
 * stays agnostic to any specific library.
 *
 * In this case we're using Strophe as our underlying
 * library that transacts XMPP stanzas across the network.
 *
 * @see <a href="http://strophe.im/strophejs/">Strophe JS</a>
 */
DemoApp.Strophe = OX.Base.extend({

  /**
   * Construct the connection
   */
  bosh: new Strophe.Connection('/http-bind/'),

  /**
   * Connect requires OnSIP username & password
   */
  doLogin: function (aForm) {
    $('err').html('');

    var jid  = aForm.username.value,
        pass = aForm.password.value;
    this.bosh.connect(jid, pass, handleStatusChanged);
  },

  /**
   * Disconnect
   */
  quit: function () {
    this.bosh.send($pres({type: 'unavailable'}).tree());
    this.bosh.disconnect();

    $('#logged_out_pane').show();
    $('#logged_in_pane').hide();
  },

  /**
   * Show the XMPP message stanzas that
   * are being sent and received by
   * this Demo client
   */
  init: function () {
    this.bosh.rawInput  = function (data) { logMessage(data, false); };
    this.bosh.rawOutput = function (data) { logMessage(data, true);  };
  },

  pageDidLoad: function () {
    this.bosh.addHandler(DemoApp.OX._handleRostersIq, 'http://jabber.org/protocol/rosterx', 'iq', 'set', null, null);
    this.bosh.addHandler(DemoApp.OX._handleEjabberdIq, 'jabber:iq:roster', 'iq', 'set', null, null);
    this.bosh.addHandler(DemoApp.OX._handleEjabberdIq, 'jabber:client', 'iq', 'result', null, null);
  }
});


DemoApp.OX = OX.Base.extend({

  /**
   * We wrap our bosh (in this case Strophe) connection in a ConnectionAdapter
   * and pass the adapter to OX.
   */
  ox: OX.Connection.extend({
    connectionAdapter: OX.StropheAdapter.extend({
      connection: DemoApp.Strophe.bosh
    })
  }),

  /**
   * To work with real-time call events, we must register the
   * following event handlers.
   *
   * `onPublish` - This callback function will receive a single argument (i.e. item).
   *  That argument will provide a property called `dialogState` with the following
   *  states:
   *      `created`   - This is the outgoing call
   *      `requested` - This is an incoming call
   *      `confirmed` - Connection is established
   *  (NOTE: call termination is not part of these dialog states)
   *
   * `onRetract` - The event fired on termination of the call.
   *      It provides a single argument (i.e. itemURI)
   *
   * `onSubscribed`   - When a user agent has successfully subscribed.
   * `onUnsubscribed` - When a user agent has successfully unsubscribed.
   * `onPending`      - An event notification that is triggered prior to
   *                    a user agent (un-)successfully subscribing.
   */
  init: function () {
    this.ox.ActiveCalls.registerHandler('onPublish',
                                        this._handleActiveCallPublish);
    this.ox.ActiveCalls.registerHandler('onRetract',
                                        this._handleActiveCallRetract);
    this.ox.ActiveCalls.registerHandler('onPending',
                                        this._handleActiveCallPending);
    this.ox.ActiveCalls.registerHandler('onSubscribed',
                                        this._handleActiveCallSubscribe);
    this.ox.ActiveCalls.registerHandler('onUnsubscribed',
                                        this._handleActiveCallUnsubscribe);
  },

  /**
   * The user must successfully authorize in order to
   * receive event notifications from the XMPP API.
   * Authorization expires every hour and must be renewed.
   * This authorize function would therefore have to be
   * called on a timely interval followed by `subscribe`.
   * (OX.Service.ActiveCalls.subscribe or
   *  OX.Service.ActiveCalls.configureNodeSubsription)
   */
  authorize: function (formID) {
    var sip = _getFormValue(formID, 'sip-address'),
        pw  = _getFormValue(formID, 'password'),
        jid = _getFormValue(formID, 'jid');

    this.ox.Auth.authorizePlain(sip, pw, jid, {
      onSuccess: function (packet) {
        var f      = packet.getNode().getElementsByTagName('x')[0].getElementsByTagName('field')[0],
            expiry = f.getElementsByTagName('value')[0].firstChild.nodeValue,
            note   = packet.getNode().getElementsByTagName('command')[0].getElementsByTagName('note')[0];
        _addOutput('#auth_xmpp_onsip_com .output', note.firstChild.nodeValue + ', Authorized until: ' + expiry);
      },

      onError: function (packet) {
        alert('ARRGGGGG!!!!!');
      }
    });

    return false;
  },

  /**
   * Generates a random string of characters to make up
   * the `callSetupID`. This ID will be passed back through
   * the `onPublish` event when the phone call is created.
   */
  createCallSetupID: function () {
    var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        length = 8,
        ret = "",
        rand = function () {
          return parseInt(Math.random() * 100000000, 10);
        };
    while (ret.length < length) {
      ret += alphabet[rand() % alphabet.length];
    }
    return ret;
  },

  /**
   * This function illustrates how to setup a call.
   *
   * It requires a valid `from` / `to` URI prefixed with 'sip:'
   * For example:
   *
   *     sip:john@example.onsip.com
   *     sip:17328586651@example.onsip.com
   */
  createCall: function (formID) {
    var to   = _getFormValue(formID, 'to'),
        from = _getFormValue(formID, 'from');

    this.ox.ActiveCalls.create(to, from, this.createCallSetupID(), {
      onSuccess: function (packet) {
        console.log('successful call');
      },

      onError: function (packet) {
        console.log('boooooo');
      }
    });

    return false;
  },

  /**
   * A common pitfall is to call `OX.Base.ActiveCalls.subscribe`
   * consecutively after each authorization call.
   *
   * The proper workflow after a successful authorization, however,
   * would be to retrieve existing subscriptions, then finding the
   * existing resource subscription, and executing
   * `OX.Service.ActiveCalls#configureNodeSubscription`
   * rather then `OX.Service.ActiveCalls#subscribe`
   */
  subscribeActiveCalls: function (formID) {
    var node = _getFormValue(formID, 'node');

    this.ox.ActiveCalls.subscribe(node, {
      subscription_depth: 2,
      subscription_type: 'items',
      expire: new Date(new Date().getTime() + 3600 * 1000)
    }, {
      onSuccess: function (reqURI, finalURI, packet) {
        console.log('called onSuccess for subscription to:' +
                    finalURI.toString());
      },

      onError: function (reqURI, finalURI, packet) {
        console.log('called onError for subscription to:' +
                    finalURI.toString());
      }
    });
  },

  /**
   * This callback function was registered for the `onRetract` event handler.
   * Event fired when a call is terminated
   */
  _handleActiveCallRetract: function (itemURI) {
    var itemID = itemURI.queryParam('item').replace(/(^.*\:)/, '').replace('.', '');
    $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID).parent().remove();
  },

  /**
   * This callback function was reigstered for the `onPublish` event handler
   * Event fired when the `dialogState` of the phone call transitions to:
   *     `created`   : outgoing call created
   *     `requested` : incoming call
   *     `confirmed` : phone connection is established
   */
  _handleActiveCallPublish: function (item) {
    console.log('handling an item publish');
    var itemID = item.callID.replace('.', '');
    var html = "<div id='%s'><h4>From %s; To %s</h4><ul><li>State: %s</li><li>From Tag: %s</li><li>To Tag: %s</li></ul><input type='submit' value='Hangup'/></div>";
    html = html.replace(/%s/, itemID)
               .replace(/%s/, item.uacAOR)
               .replace(/%s/, item.uasAOR)
               .replace(/%s/, item.dialogState)
               .replace(/%s/, item.fromTag)
               .replace(/%s/, item.toTag);

    var el = $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID);
    if (el.length && el.length > 0) {
      el.html(html);
    } else {
      _addOutput('#active-calls_xmpp_onsip_com .pubsub .events', html);
    }

    $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID + ' input').click(function () {
      item.hangup();
    });
  },

  /**
   * This callback function was registered to receive
   * notification when the agent subscribed successfully.
   * It's one of several steps necessary to receive event notifications.
   */
  _handleActiveCallSubscribe: function (uri) {
    console.log('handling an asynchronous subscription message');
    console.log(uri);
    _addOutput('#active-calls_xmpp_onsip_com .pubsub .subscriptions', uri.toString());
  },

  /**
   * To `unsubscribe` from event notifications
   */
  _handleActiveCallUnsubscribe: function (uri) {
    console.log('handling an asynchronous unsubscription message');
    console.log(uri);
    _addOutput('#active-calls_xmpp_onsip_com .pubsub .subscriptions', uri.toString());
  },

  /**
   * The `subscription` is in a pending state
   */
  _handleActiveCallPending: function (uri) {
    console.log('handling a pending response');
    console.log(uri);
  },

  /**
   * Manage Rosters (or Buddy Lists)
   */
  pushRosterGroups: function (formID) {
    var jid = null;
    this.ox.Rosters.pushRosterGroups(jid, {
      onSuccess: function (packet) {
        console.log('successful roster push');
      },

      onError: function (packet) {
        console.log('ERROR: roster push failed.');
      }
    });

    return false;
  },

  requestRoster: function (formID) {
    var iq    = OX.XML.XMPP.IQ.extend(),
        query = OX.XML.XMPP.Stanza.extend();

    var callbacks = {
      onSuccess: function (packet) {
        console.log('successful roster request');
      },

      onError: function (packet) {
        console.log('ERROR: roster request failed.');
      }
    };

    iq.type('get');
    query.name = 'query';
    query.attr('xmlns', 'jabber:iq:roster');
    iq.addChild(query);

    this.ox.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess(packet);
      }
    }, []);

    return false;
  },

  addRosterItem: function (formID) {
    var name   = _getFormValue(formID, 'name'),
        jid    = _getFormValue(formID, 'jid'),
        groups = [ _getFormValue(formID, 'group') ],
        iq     = OX.XML.XMPP.IQ.extend(),
        query  = OX.XML.XMPP.Stanza.extend(),
        item   = OX.XML.XMPP.Stanza.extend();

    var callbacks = {
      onSuccess: function (packet) {
        console.log('Succesfully added roster item.');
      },

      onError: function (packet) {
        console.log('ERROR: roster add failed.');
      }
    }, groupStanza;

    iq.type('set');
    query.name = 'query';
    query.attr('xmlns', 'jabber:iq:roster');
    item.name = 'item';
    item.attr('jid', jid);
    item.attr('name', name);

    for (var i = 0;  i < groups.length; i++) {
      groupStanza = OX.XML.XMPP.Stanza.extend();
      groupStanza.name = 'group';
      groupStanza.text = groups[i];
      item.addChild(groupStanza);
    }
    iq.addChild(query.addChild(item));

    this.ox.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess(packet);
      }
    }, []);

    return false;
  },

  deleteRosterItem: function (formID) {
    var jid   = _getFormValue(formID, 'jid'),
        iq    = OX.XML.XMPP.IQ.extend(),
        query = OX.XML.XMPP.Stanza.extend(),
        item  = OX.XML.XMPP.Stanza.extend();

    var callbacks = {
      onSuccess: function (packet) {
        console.log('Succesfully deleted roster item.');
      },

      onError: function (packet) {
        console.log('ERROR: roster delete failed.');
      }
    };

    iq.type('set');
    query.name = 'query';
    query.attr('xmlns', 'jabber:iq:roster');
    item.name = 'item';
    item.attr('jid', jid);
    item.attr('subscription', 'remove');

    iq.addChild(query.addChild(item));

    this.ox.send(iq.toString(), function (packet) {
      if (!packet) {
        return;
      }

      if (packet.getType() === 'error' && callbacks.onError) {
        callbacks.onError(packet);
      } else if (callbacks.onSuccess) {
        callbacks.onSuccess(packet);
      }
    }, []);

    return false;
  },

  _handleRostersIq: function (packet) {
    var items = packet.getElementsByTagName('x')[0].getElementsByTagName('item');
    for (var i = 0; i < items.length; i++) {
      var name         = items[i].attributes.name.value,
          jid          = items[i].attributes.jid.value,
          group        = items[i].getElementsByTagName('group')[0].firstChild.nodeValue,
          uniqueFormId = 'add-roster-item-' + jid.replace(/@/, '').replace(/\./g, ''),
          action       = items[i].attributes.action.value;

      if (action === 'add') {
        _addOutput('#rosters_xmpp_onsip_com .xmpp_roster', name +
                   '<form id="' + uniqueFormId + '" action="#">' +
                   '<input type="hidden" name="name" id="name" value="' + name + '"/>' +
                   '<input type="hidden" name="jid" id="jid" value="' + jid + '"/>' +
                   '<input type="hidden" name="group" id="group" value="' + group + '"/>' +
                   '<input type="submit" value="Add Item"/></form>');
        $('#' + uniqueFormId).bind('submit', function (e) {
          e.preventDefault();
          DemoApp.OX.addRosterItem(uniqueFormId);
        });
      } else if (action === 'modify') {
        _addOutput('#rosters_xmpp_onsip_com .xmpp_roster', name +
                   '<form id="' + uniqueFormId + '" action="#">' +
                   '<input type="hidden" name="name" id="name" value="' + name + '"/>' +
                   '<input type="hidden" name="jid" id="jid" value="' + jid + '"/>' +
                   '<input type="hidden" name="group" id="group" value="' + group + '"/>' +
                   '<input type="submit" value="Modify Item"/></form>');
        $('#' + uniqueFormId).bind('submit', function (e) {
          e.preventDefault();
          DemoApp.OX.addRosterItem(uniqueFormId);
        });
      } else if (action === 'delete') {
        _addOutput('#rosters_xmpp_onsip_com .xmpp_roster', name +
                   '<form id="' + uniqueFormId + '" action="#">' +
                   '<input type="hidden" name="name" id="name" value="' + name + '"/>' +
                   '<input type="hidden" name="jid" id="jid" value="' + jid + '"/>' +
                   '<input type="hidden" name="group" id="group" value="' + group + '"/>' +
                   '<input type="submit" value="Delete Item"/></form>');
        $('#' + uniqueFormId).bind('submit', function (e) {
          e.preventDefault();
          DemoApp.OX.deleteRosterItem(uniqueFormId);
        });
      }
    }

    var id   = packet.attributes.id.value;
    var from = packet.attributes.to.value;
    var to   = packet.attributes.from.value;
    var iq    = OX.XML.XMPP.IQ.extend();
    iq.from(from);
    iq.to(to);
    iq.type('result');
    iq.attr('id', id);
    this.ox.send(iq.toString());

    return true;
  },

  _handleEjabberdIq: function (packet) {
    if (packet.getElementsByTagName('query')[0]) {
      var items = packet.getElementsByTagName('query')[0].getElementsByTagName('item');
      for (var i = 0; i < items.length; i++) {
        if (items[i].attributes.subscription.value !== 'remove') {
          var item  = items[i],
              name_str   = item.attributes.name.value,
              jid_str    = item.attributes.jid.value,
              groups_str = '',
              groups     = item.getElementsByTagName('group');
          if (groups) {
            for (var j = 0; j < groups.length; j++) {
              if (groups[j].firstChild) {
                if (groups_str !== '') {
                  groups_str += ", ";
                }
                groups_str += groups[j].firstChild.nodeValue;
              } else {
                groups_str = "n/a";
              }
            }
          }
          _addOutput('#rosters_xmpp_onsip_com .current_roster',
                     name_str + ' :: ' + jid_str + ' :: ' + groups_str);
        }
      }
    }

    var id   = packet.attributes.id.value;
    var from = packet.attributes.to.value;
    var to   = packet.attributes.from.value;
    var iq    = OX.XML.XMPP.IQ.extend();
    iq.from(from);
    iq.to(to);
    iq.type('result');
    iq.attr('id', id);
    this.ox.send(iq.toString());

    return true;
  }
});

$(document).ready(function () {
  DemoApp.Strophe.pageDidLoad();

  $('#logout').bind('click', function (e) {
    DemoApp.Strophe.quit();
    e.preventDefault();
  });

  $('#login').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.Strophe.doLogin(this);
  });

  $('#authorize-plain').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.OX.authorize('authorize-plain');
  });

  $('#create-call').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.OX.createCall('create-call');
  });

  $('#subscribe-active-calls').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.OX.subscribeActiveCalls('subscribe-active-calls');
  });

  $('#push-roster-groups').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.OX.pushRosterGroups('push-roster-groups');
  });

  $('#request-roster').bind('submit', function (e) {
    e.preventDefault();
    DemoApp.OX.requestRoster('request-roster');
  });
});

var onerror = function (e) {
  DemoApp.Strophe.quit();

  $('#err').html('');
  $('#logged_out_pane').show();
  return false;
};
