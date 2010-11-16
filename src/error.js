/**
 * Simple error class of OXJS.
 *
 * @param {String} message The message to throw.
 * @example
 *   throw new OX.Error('the error message');
 */
OX.Error = function (message) {
  this.message = message;
};
OX.Error.prototype = new Error();
OX.Error.prototype.name = "OX.Error";
