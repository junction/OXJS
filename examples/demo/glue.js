DemoApp = {};

DemoApp.OX = function() {

  con: undefined;

  /** private **/
  var _getFormValue = function(formID, inputName) {
    return $('form#' + formID + ' input[name=' + inputName + ']').val();
  };

  var _addOutput = function(selector, msg) {
    $(selector).append("<li>" + msg + "</li>");
  };

  /** public **/
  return {
    setup: function(jsjacCon) {

      var adapter = OX.ConnectionAdapter.extend({
        jid: jsjacCon.jid,

        registerHandler: function(event, handler) {
          return jsjacCon.registerHandler(event, handler);
        },

        unregisterHandler: function(event, handler) {
          return jsjacCon.unregisterHandler(event, handler);
        },

        send: function(xml, cb, args) {
          var wrapped = function() {
            var doc = arguments[0],
              newArgs = [],
              packetAdapter = {
                ptype: doc.firstChild.getAttribue('type').value,
                from: doc.firstChild.getAttribute('from').value,
                to: doc.firstChild.getAttribute('to').value,
                type: doc.firstChild.getAttribute('type').value,

                getFrom: function() {
                  return this.from;
                },

                getType: function() {
                  return this.type;
                },

                getTo: function() {
                  return this.to;
                }
              };

            newArgs.push(packetAdapter);
            for(var i=1,len=arguments.length;i<len;i++) {
              newArgs.push(arguments[i]);
            }

            return cb.apply(cb, newArgs);
          };

          return jsjacCon._sendRaw(xml,wrapped,args);
        }
      });

      this.con = OX.Connection.extend({connection: adapter});
      this.con.initConnection();
    },

    authenticate: function(formID) {
      var sip = _getFormValue(formID, 'sip-address'),
        pw= _getFormValue(formID, 'password'),
        jid= _getFormValue(formID, 'jid');

      this.con.Auth.authenticatePlain(sip, pw, jid);

      return false;
    },

    createCall: function(formID) {
      var to = _getFormValue(formID,'to'),
        from = _getFormValue(formID,'from');

      alert("to: " + to + " from: " + from);

      return false;
    }
  };
}();

DemoApp.JSJaC = function() {
  /** private **/
  var outputMessage = function(xml,outbound) {
    var sent = (!!outbound) ? 'outbound' : 'inbound',
      msg = "<div class='msg %s'>" + xml + "</div>";

    msg = msg.replace(/%s/, sent);

    $('#message_pane_inner').append(msg);
  }

  var handlePacketIn = function(aPacket) {
    console.log(aPacket);
    outputMessage(aPacket.xml().htmlEnc());
  }

  var handlePacketOut = function(aPacket) {
    console.log(aPacket);
    outputMessage(aPacket.xml().htmlEnc(), true);
  }

  var handleIQ = function(aIQ) {
    DemoApp.JSJaC.con.send(aIQ.errorReply(ERR_FEATURE_NOT_IMPLEMENTED));
  }

  var handleMessage = function(aJSJaCPacket) {
  }

  var handlePresence = function(aJSJaCPacket) {
  }

  var handleError = function(e) {
    document.getElementById('err').innerHTML = "An error occured:<br />"+
      ("Code: "+e.getAttribute('code')+"\nType: "+e.getAttribute('type')+
      "\nCondition: "+e.firstChild.nodeName).htmlEnc();
    document.getElementById('logged_out_pane').style.display = '';
    document.getElementById('logged_in_pane').style.display = 'none';

    if (DemoApp.JSJaC.con.connected())
      DemoApp.JSJaC.con.disconnect();
  }

  var handleStatusChanged = function(status) {
    oDbg.log("status changed: "+status);
  }

  var handleConnected = function() {
    document.getElementById('logged_out_pane').style.display = 'none';
    document.getElementById('logged_in_pane').style.display = '';

    document.getElementById('err').innerHTML = '';

    $('#logged_in_as').text(DemoApp.JSJaC.con.jid);
    DemoApp.JSJaC.con.send(new JSJaCPresence());
  }

  var handleDisconnected = function() {
    document.getElementById('logged_out_pane').style.display = '';
    //    document.getElementById('logged_in_pane').style.display = 'none';
  }

  var handleIqTime = function(iq) {
    var now = new Date();
    DemoApp.JSJaC.con.send(iq.reply([iq.buildNode('display',
                                    now.toLocaleString()),
                       iq.buildNode('utc',
                                    now.jabberDate()),
                       iq.buildNode('tz',
                                    now.toLocaleString().substring(now.toLocaleString().lastIndexOf(' ')+1))
                       ]));
    return true;
  }

  var setupCon = function(con) {
    con.registerHandler('message',handleMessage);
    con.registerHandler('presence',handlePresence);
    con.registerHandler('iq',handleIQ);
    con.registerHandler('onconnect',handleConnected);
    con.registerHandler('onerror',handleError);
    con.registerHandler('status_changed',handleStatusChanged);
    con.registerHandler('ondisconnect',handleDisconnected);

    con.registerHandler('packet_in', handlePacketIn);
    con.registerHandler('packet_out', handlePacketOut);

    con.registerIQGet('query', NS_TIME, handleIqTime);

    DemoApp.OX.setup(con);
  }

  var sendMsg = function(aForm) {
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
      html = "<div class='msg error''>Error: "+e.message+"</div>";
      document.getElementById('iResp').innerHTML += html;
      document.getElementById('iResp').lastChild.scrollIntoView();
      return false;
    }
  }

  return {
    /** public **/

    con: undefined,

    doLogin: function(aForm) {
      document.getElementById('err').innerHTML = ''; // reset

      try {
        // setup args for contructor
        oArgs = new Object();
        oArgs.httpbase = aForm.http_base.value;
        oArgs.timerval = 2000;

        if (typeof(oDbg) != 'undefined')
          oArgs.oDbg = oDbg;

        this.con = new JSJaCHttpBindingConnection(oArgs);

        setupCon(this.con);

        // setup args for connect method
        oArgs = new Object();
        oArgs.domain = aForm.server.value;
        oArgs.resource = 'ox_demo';
        oArgs.username = aForm.username.value.replace(/@/, '!');
        oArgs.pass = aForm.password.value;
        oArgs.register = false;
        this.con.connect(oArgs);
      } catch (e) {
        document.getElementById('err').innerHTML = e.toString();
      } finally {
        return false;
      }
    }, // doLogin

    quit: function() {
      var p = new JSJaCPresence();
      p.setType("unavailable");
      this.con.send(p);
      this.con.disconnect();

      $('#logged_out_pane').show();
      $('#logged_in_pane').hide();
    },

    init: function() {
      if (typeof(Debugger) == 'function') {
        oDbg = new Debugger(2,'simpleclient');
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

          document.getElementById('logged_out_pane').style.display = 'none';
          document.getElementById('err').innerHTML = '';

        }
      } catch (e) {} // reading cookie failed - never mind

    }
  }
}();

var onload = DemoApp.JSJaC.init;

var onerror = function(e) {
  document.getElementById('err').innerHTML = e;
    document.getElementById('logged_out_pane').style.display = '';

  if (DemoApp.JSJaC.con && DemoApp.JSJaC.con.connected())
    DemoApp.JSJaC.con.disconnect();

  return false;
};

var onunload = function() {
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

