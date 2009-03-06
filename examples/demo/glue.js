DemoApp = function() {

  /** private **/
  var _getFormValue = function(formID, inputName) {
    return $('form#' + formID + ' input[name=' + inputName + ']').val();
  };

  var _addOutput = function(selector, msg) {
    $(selector).append("<li>" + msg + "</li>");
  };

  /** public **/
  return {
    authenticate: function(formID) {
      var sip = _getFormValue(formID, 'sip-address'),
        pw= _getFormValue(formID, 'password'),
        jid= _getFormValue(formID, 'jid');

      _addOutput('#auth_xmpp_onsip_com .commands .output', "authd for " + sip + " as " + jid);

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

