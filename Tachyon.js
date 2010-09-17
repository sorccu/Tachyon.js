// Copyright 2010 Simo Kinnunen. All Rights Reserved.

/**
 * @fileoverview A simple, stand-alone implementation of Subspace.
 * @author Simo Kinnunen
 */

var Tachyon = (function() {

  var api,
    masterInObject = [],
    masterOutObject = [];

  /**
   * The Subspace base class. There can be multiple Subspace instances but
   * they all refer to the same in/out objects.
   * @constructor
   */
  function Subspace(inObject, outObject) {

    var api = this,
      handlers = {};

    function pollInObject() {
      var transferObject;
      while ((transferObject = inObject.shift())) {
        processTransferObject(transferObject);
      }
    }

    function processTransferObject(transferObject) {
      var type, handler;
      type = transferObject.type;
      handler = handlers[type];
      if (!handler) {
        throw new Error('Subspace: message "' + type + '" is ' +
          'not being listened to.');
      }
      transferObject.response = handler(transferObject.data);
    }

    /**
     * Requests information from inObject by passing a request to outObject.
     * @param {string} type A label for the request.
     * @param {?object} data Any data you want to pass to the request handler.
     * @param {?function} callback A function that will be called when the
     * request has been completed. Receives the response as an argument.
     * @return {Subspace} The Subspace API.
     */
    api.request = function(type, data, callback) {
      var transferObject, timer;
      function poll() {
        if ('response' in transferObject) {
          callback(transferObject.response);
          clearInterval(timer);
        }
      }
      transferObject = {
        type: type,
        data: data
      };
      outObject.push(transferObject);
      if (callback) {
        timer = setInterval(poll, 25);
      }
      return api;
    };

    /**
     * Registers a response handler for a specific label.
     * @param {string} type The request label to listen to.
     * @param {function} handler The handler method.
     * @return {Subspace} The Subspace API.
     */
    api.respond = function(type, handler) {
      if (handlers[type]) {
        throw new Error('Subspace: message "' + type + '" is ' +
          'already being listened to.');
      }
      handlers[type] = handler;
      return api;
    };

    setInterval(pollInObject, 25);

    return api;

  }

  api = new Subspace(masterInObject, masterOutObject);

  /**
   * Creates a new Subspace. Mediator frames should use this method.
   * @return {Subspace} The new Subspace instance.
   */
  api.createSubspace = function() {
    // reverse in/out objects for mediator frames
    return new Subspace(masterOutObject, masterInObject);
  };

  return api;

})();
