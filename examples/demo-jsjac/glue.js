DemoApp = {};

DemoApp.OX = function() {
  con: undefined;

  /** private **/
  var _getFormValue = function (formID, inputName) {
    return $('form#' + formID + ' input[name=' + inputName + ']').val();
  };

  var _addOutput = function (selector, msg) {
    $(selector).append("<li>" + msg + "</li>");
  };

  /** public **/
  return {
    setup: function (jsjacCon) {

      var adapter = OX.ConnectionAdapter.extend({
        jid: jsjacCon.jid,

        registerHandler: function (event, handler) {
          return jsjacCon.registerHandler(event, handler);
        },

        unregisterHandler: function (event, handler) {
          return jsjacCon.unregisterHandler(event, handler);
        },

        send: function (xml, cb, args) {
          var wrapped = function (iqElement, cbArgs) {
            var packetAdapter = {
              node:  iqElement,
              ptype: iqElement.getAttribute('type'),
              from:  iqElement.getAttribute('from'),
              to:    iqElement.getAttribute('to'),
              type:  iqElement.getAttribute('type'),

              getFrom: function () { return this.from; },
              getType: function () { return this.type; },
              getTo:   function () { return this.to; },
              getNode: function () { return this.node; }
            };

            var newArgs = [packetAdapter];
            for (var i = 0, len = args.length; i < len ;i++) {
              newArgs.push(args[i]);
            }

            DemoApp.JSJaC.outputMessage(iqElement.xml.htmlEnc());
            return cb.apply(cb, newArgs);
          };

          DemoApp.JSJaC.outputMessage(xml.htmlEnc(), true);
          return jsjacCon._sendRaw(xml, wrapped);
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

    authenticate: function (formID) {
      var sip = _getFormValue(formID, 'sip-address'),
          pw  = _getFormValue(formID, 'password'),
          jid = _getFormValue(formID, 'jid');

      var onsuccess = function (packet) {
        var f = packet.doc.getElementsByTagName('x')[0].getElementsByTagName('field')[0];
        var expiry = f.getElementsByTagName('value')[0].firstChild.nodeValue;
        var note = packet.doc.getElementsByTagName('command')[0].getElementsByTagName('note')[0];

        _addOutput('#auth_xmpp_onsip_com .output', note.firstChild.nodeValue + ', Authorized until: ' + expiry);
      };

      var onerror = function (packet) {
        alert('ARRGGGGG!!!!!');
      };

      this.con.Auth.authenticatePlain(sip, pw, jid, {
        onSuccess: onsuccess,
        onError:   onerror
      });

      return false;
    },

    createCall: function (formID) {
      var to = _getFormValue(formID, 'to'),
        from = _getFormValue(formID, 'from');

      var onsuccess = function (packet) {
        console.log('successful call');
      };

      var onerror = function (packet) {
        console.log('boooooo');
      };

      this.con.ActiveCalls.create(to, from, {
        onSuccess: onsuccess,
        onError:   onerror
      });

      return false;
    },

    subscribeActiveCalls: function (formID) {
      var node = _getFormValue(formID, 'node');
      var cb = {
        onSuccess: function (reqURI, finalURI, packet) {
          console.log('called onSuccess for subscription to:' +
                      finalURI.toString());
        },
        onError:  function (reqURI, finalURI, packet) {
          console.log('called onError for subscription to:' +
                      finalURI.toString());
        }
      };

      this.con.ActiveCalls.subscribe(node, cb);
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

DemoApp.JSJaC = function() {
  /** private **/
  var handlePacketIn = function (aPacket) {
    DemoApp.JSJaC.outputMessage(aPacket.xml().htmlEnc());
  };

  var handlePacketOut = function (aPacket) {
    DemoApp.JSJaC.outputMessage(aPacket.xml().htmlEnc(), true);
  };

  var handleIQ = function (anIQ) {
    DemoApp.JSJaC.con.send(anIQ.errorReply(ERR_FEATURE_NOT_IMPLEMENTED));
  };

  var handleMessage = function (aJSJaCPacket) {
  };

  var handlePresence = function (aJSJaCPacket) {
  };

  var handleError = function (e) {
    var html = "An error occured:<br />" +
               ("Code: " + e.getAttribute('code') + "\nType: " +
                e.getAttribute('type') + "\nCondition: " +
                e.firstChild.nodeName).htmlEnc();
    document.getElementById('err').innerHTML = str;
    document.getElementById('logged_out_pane').style.display = '';
    document.getElementById('logged_in_pane').style.display = 'none';

    if (DemoApp.JSJaC.con.connected())
      DemoApp.JSJaC.con.disconnect();
  };

  var handleStatusChanged = function (status) {
    oDbg.log("status changed: " + status);
  };

  var handleConnected = function () {
    document.getElementById('logged_out_pane').style.display = 'none';
    document.getElementById('logged_in_pane').style.display = '';

    document.getElementById('err').innerHTML = '';

    $('#logged_in_as').text(DemoApp.JSJaC.con.jid);
    DemoApp.JSJaC.con.send(new JSJaCPresence());
  };

  var handleDisconnected = function () {
    document.getElementById('logged_out_pane').style.display = '';
    //    document.getElementById('logged_in_pane').style.display = 'none';
  };

  var handleIqTime = function (iq) {
    var now = new Date();
    DemoApp.JSJaC.con.send(iq.reply([iq.buildNode('display',
                                                  now.toLocaleString()),
                                     iq.buildNode('utc',
                                                  now.jabberDate()),
                                     iq.buildNode('tz',
                                                  now.toLocaleString().substring(now.toLocaleString().lastIndexOf(' ')+1))]));
    return true;
  };

  var setupCon = function (con) {
    con.registerHandler('message',         handleMessage);
    con.registerHandler('presence',        handlePresence);
    con.registerHandler('iq',              handleIQ);
    con.registerHandler('onconnect',       handleConnected);
    con.registerHandler('onerror',         handleError);
    con.registerHandler('status_changed',  handleStatusChanged);
    con.registerHandler('ondisconnect',    handleDisconnected);

    con.registerHandler('packet_in',       handlePacketIn);
    con.registerHandler('packet_out',      handlePacketOut);

    con.registerIQGet('query', NS_TIME, handleIqTime);
  };

  var sendMsg = function (aForm) {
    if (aForm.msg.value == '' || aForm.sendTo.value == '')
      return false;

    if (aForm.sendTo.value.indexOf('@') == -1)
      aForm.sendTo.value += '@' + DemoApp.JSJaC.con.domain;

    try {
      var aMsg = new JSJaCMessage();
      aMsg.setTo(new JSJaCJID(aForm.sendTo.value));
      aMsg.setBody(aForm.msg.value);
      DemoApp.JSJaC.con.send(aMsg);

      aForm.msg.value = '';

      return false;
    } catch (e) {
      var html = "<div class='msg error''>Error: " + e.message + "</div>";
      document.getElementById('iResp').innerHTML += html;
      document.getElementById('iResp').lastChild.scrollIntoView();

      return false;
    }
  };

  return {
    /** public **/
    outputMessage: function (xml, outbound) {
      var sent = (!!outbound) ? 'outbound' : 'inbound',
      msg = "<div class='msg %s'>" + xml + "</div>";

      msg = msg.replace(/%s/, sent);

      $('#message_pane_inner').append(msg);
    },

    con: undefined,

    doLogin: function (aForm) {
      document.getElementById('err').innerHTML = ''; // reset

      try {
        // setup args for contructor
        var oArgs = new Object();
        oArgs.httpbase = aForm.http_base.value;
        oArgs.timerval = 2000;

        if (typeof(oDbg) != 'undefined')
          oArgs.oDbg = oDbg;

        this.con = new JSJaCHttpBindingConnection(oArgs);

        setupCon(this.con);

        // setup args for connect method
        oArgs = new Object();
        oArgs.domain   = aForm.server.value;
        oArgs.resource = 'ox-jsjac-demo';
        oArgs.username = aForm.username.value; //.replace(/@/, '!');
        oArgs.pass     = aForm.password.value;
        oArgs.register = false;
        this.con.connect(oArgs);
        DemoApp.OX.setup(this.con);
      } catch (e) {
        document.getElementById('err').innerHTML = e.toString();
      } finally {
        return false;
      }
    },

    quit: function() {
      var p = new JSJaCPresence();
      p.setType("unavailable");
      this.con.send(p);
      this.con.disconnect();

      $('#logged_out_pane').show();
      $('#logged_in_pane').hide();
    },

    init: function() {
      var oDbg;
      if (typeof(Debugger) == 'function') {
        oDbg = new Debugger(2, 'simpleclient');
        oDbg.start();
      } else {
        // if you're using firebug or safari, use this for debugging
        //oDbg = new JSJaCConsoleLogger(2);
        // comment in above and remove comments below if you don't need debugging
        oDbg = function() {};
        oDbg.log = function() {};
      }


      try { // try to resume a session
        if (JSJaCCookie.read('btype').getValue() == 'binding')
          this.con = new JSJaCHttpBindingConnection({'oDbg':oDbg});
        else
          this.con = new JSJaCHttpPollingConnection({'oDbg':oDbg});

        setupCon(this.con);

        if (this.con.resume()) {
          DemoApp.OX.setup(this.con);
          document.getElementById('logged_out_pane').style.display = 'none';
          document.getElementById('err').innerHTML = '';

        }
      } catch (e) {} // reading cookie failed - never mind
    }
  };
}();

var onload = DemoApp.JSJaC.init;

var onerror = function (e) {
  document.getElementById('err').innerHTML = e;
    document.getElementById('logged_out_pane').style.display = '';

  if (DemoApp.JSJaC.con && DemoApp.JSJaC.con.connected())
    DemoApp.JSJaC.con.disconnect();

  return false;
};

var onunload = function () {
  if (typeof DemoApp.JSJaC.con != 'undefined'
      && DemoApp.JSJaC.con
      && DemoApp.JSJaC.con.connected()) {
    // save backend type
    if (DemoApp.JSJaC.con._hold) // must be binding
      (new JSJaCCookie('btype','binding')).write();
    if (DemoApp.JSJaC.con.suspend) {
      DemoApp.JSJaC.con.suspend();
    }
  }
};
