/**
 * Specific to device pages
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function CSPDevicePage(remote) {
    this.remote = remote;

    this.statuses = {
      suspended: 'Suspended',
      active: 'Active'
    };

    this.msgs = {
      successfulClientLog: 'Request for client log file submitted.',
      successfulResume: 'Device has been successfully resumed.',
      successfulSuspend: 'Device has been successfully suspended.'
    };

    /**
     * @return {object} promise
     */
    this.clickDeviceActions = function() {
      return this.remote
        .findById('csp-device-actions')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickDisableAccountJoining = function() {
      return this
        .clickDeviceActions()
        .then(function() {
          return this.parent
            .findByCssSelector('a.disable-joining')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickEnableAccountJoining = function() {
      return this
        .clickDeviceActions()
        .then(function() {
          return this.parent
            .findByCssSelector('a.enable-joining')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickRequestClientLog = function() {
      return this
        .clickDeviceActions()
        .then(function() {
          return this.parent
            .findById('csp-get-log')
              .click()
            .end();
        });
    };

    /**
     * Because of the template, this handles both cases
     * @return {object} promise
     */
    this.clickSuspendResume = function() {
      return this
        .clickDeviceActions()
        .then(function() {
          return this.parent
            .findByCssSelector('a.suspend-resume')
              .click()
            .end();
        });
    };

    /**
     * The little status label in the left bar
     * @return {object} promise
     */
    this.getDeviceStatus = function() {
      return this.remote
        .findByCssSelector('aside.status-area span.device-status')
          .getVisibleText()
          .then(function(text) {
            return text;
          });
    };
  }

  return CSPDevicePage;
});
