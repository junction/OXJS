DemoApp = {};

DemoApp.OX = function() {
  con: undefined;

  function _getFormValue(formID, inputName) {
    return $('form#' + formID + ' input[name=' + inputName + ']').val();
  }

  function _addOutput(selector, msg) {
    $(selector).append("<li>" + msg + "</li>");
  }

  return {
    setup: function (con) {
      var handlers = {};

      var adapter = OX.ConnectionAdapter.extend({
        _callbacks: [],

        jid: con.jid,

        registerHandler: function (event, handler) {
          function wrapped(stanza) {
            var packetAdapter = {
              getFrom: function () { return stanza.getAttribute('from'); },
              getType: function () { return stanza.getAttribute('type'); },
              getTo:   function () { return stanza.getAttribute('to');   },
              getNode: function () { return stanza;                      }
            };

            var newArgs = [packetAdapter];
            for (var i = 1, len = arguments.length; i < len; i++) {
              newArgs.push(arguments[i]);
            }

            handler.apply(this, newArgs);
            return true;
          }

          this.unregisterHandler(event);
          handlers[event] = con.addHandler(wrapped, null, event,
                                           null, null, null);
        },

        unregisterHandler: function (event) {
          if (handlers[event]) {
            con.deleteHandler(handlers[event]);
            delete handlers[event];
          }
        },

        send: function (xml, cb, args) {
          var node = document.createElement('wrapper');
          node.innerHTML = xml;
          node = node.firstChild;

          if (cb) {
            function wrapped(stanza) {
              var packetAdapter = {
                getFrom: function () { return stanza.getAttribute('from'); },
                getType: function () { return stanza.getAttribute('type'); },
                getTo:   function () { return stanza.getAttribute('to');   },
                getNode: function () { return stanza;                      }
              };

              var newArgs = [packetAdapter];
              for (var i = 0, len = args.length; i < len; i++) {
                newArgs.push(args[i]);
              }

              cb.apply(this, newArgs);
              return false;
            }

            var id = node.getAttribute('id');
            if (!id) {
              id = con.getUniqueId();
              node.setAttribute('id', id);
            }

            this._callbacks[id] = con.addHandler(wrapped, null, null,
                                                 null, id, null);
          }

          node.setAttribute('xmlns', 'jabber:client');
          return con.send(node);
        }
      });

      this.con = OX.Connection.extend({connection: adapter});
      this.con.initConnection();

      this.con.ActiveCalls.registerSubscriptionHandlers();
      this.con.ActiveCalls.registerHandler('onPublish',
                                           this._handleActiveCallPublish);
      this.con.ActiveCalls.registerHandler('onRetract',
                                           this._handleActiveCallRetract);
      this.con.ActiveCalls.registerHandler('onPending',
                                           this._handleActiveCallPending);
      this.con.ActiveCalls.registerHandler('onSubscribed',
                                           this._handleActiveCallSubscribe);
      this.con.ActiveCalls.registerHandler('onUnsubscribed',
                                           this._handleActiveCallUnsubscribe);
    },

    authorize: function (formID) {
      var sip = _getFormValue(formID, 'sip-address'),
          pw  = _getFormValue(formID, 'password'),
          jid = _getFormValue(formID, 'jid');

      this.con.Auth.authorizePlain(sip, pw, jid, {
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

    createCall: function (formID) {
      var to   = _getFormValue(formID, 'to'),
          from = _getFormValue(formID, 'from');

      this.con.ActiveCalls.create(to, from, {
        onSuccess: function (packet) {
          console.log('successful call');
        },

        onError: function (packet) {
          console.log('boooooo');
        }
      });

      return false;
    },

    subscribeActiveCalls: function (formID) {
      var node = _getFormValue(formID, 'node');

      this.con.ActiveCalls.subscribe(node, {
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

    _handleActiveCallRetract: function (itemURI) {
      var itemID = itemURI.queryParam('item').replace(/(^.*\:)/, '').replace('.', '');
      $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID).parent().remove();
    },

    _handleActiveCallPublish: function (item) {
      console.log('handling an item publish');
      var itemID = item.callID.replace('.', '');
      var html = "<div id='%s'><h4>From %s; To %s</h4><ul><li>State: %s</li><li>From Tag: %s</li><li>To Tag: %s</li></ul><input type='submit' value='Hangup'/></div>";
      html = html
        .replace(/%s/,itemID)
        .replace(/%s/,item.uacAOR)
        .replace(/%s/,item.uasAOR)
        .replace(/%s/,item.dialogState)
        .replace(/%s/,item.fromTag)
        .replace(/%s/,item.toTag);

      var el = $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID);
      if (el.length && el.length > 0) {
        el.html(html);
      } else {
        _addOutput('#active-calls_xmpp_onsip_com .pubsub .events', html);
      }

      $('#active-calls_xmpp_onsip_com .pubsub .events #' + itemID + ' input').click(function() { item.hangup(); });

    },

    _handleActiveCallSubscribe: function (uri) {
      console.log('handling an asynchronous subscription message');
      console.log(uri);
      _addOutput('#active-calls_xmpp_onsip_com .pubsub .subscriptions', uri.toString());
    },

    _handleActiveCallUnsubscribe: function (uri) {
      console.log('handling an asynchronous unsubscription message');
      console.log(uri);
      _addOutput('#active-calls_xmpp_onsip_com .pubsub .subscriptions', uri.toString());
    },

    _handleActiveCallPending: function (uri) {
      console.log('handling a pending response');
      console.log(uri);
    }

  };
}();

DemoApp.Strophe = function() {
  var con;

  function htmlEnc(str) {
    return str.split(/&/).join("&amp;")
              .split(/;/).join("&semi;")
              .split(/</).join("&lt;")
              .split(/>/).join("&gt;");
  }

  function handleStatusChanged(status) {
    switch (status) {
    case Strophe.Status.CONNECTED:
      $('#logged_out_pane').hide();
      $('#logged_in_pane').show();
      $('#err').html('');
      $('#logged_in_as').text(con.jid);

      con.send($pres().tree());
      break;

    case Strophe.Status.DISCONNECTED:
      $('#logged_out_pane').show();
      break;

    default:
      console.debug('Status changed: ' + status);
    }
  }

  function logMessage(xml, outbound) {
    var sent = (!!outbound) ? 'outbound' : 'inbound',
        msg  = "<div class='msg %s'>" + htmlEnc(xml) + "</div>";
    console.debug('(' + sent + ') - ' + xml);

    msg = msg.replace(/%s/, sent);
    $('#message_pane_inner').append(msg);
    $('#message_pane_inner :last').get(0).scrollIntoView();
  }

  return {
    doLogin: function (aForm) {
      $('err').html('');

      var jid  = aForm.username.value.replace(/@/, '!') +
                 '@' + aForm.server.value,
          pass = aForm.password.value;
      con.connect(jid, pass, handleStatusChanged);

      DemoApp.OX.setup(con);
    },

    quit: function() {
      con.send($pres({type: 'unavailable'}).tree());
      con.disconnect();

      $('#logged_out_pane').show();
      $('#logged_in_pane').hide();
    },

    init: function() {
      con = new Strophe.Connection('/http-bind/');
      con.rawInput  = function (data) { logMessage(data, false); };
      con.rawOutput = function (data) { logMessage(data, true);  };
    }
  };
}();

$(document).ready(function () {
  DemoApp.Strophe.init();

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
});

var onerror = function (e) {
  DemoApp.Strophe.quit();

  $('#err').html('');
  $('#logged_out_pane').show();

  return false;
};
