/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');
  var faker = require('../lib/vendor/faker');

  function NetworkGroupsPage(remote) {
    this.remote = remote;

    this.msgs = {
      successfulCreate: 'Network group added',
      successfulUpdate: 'Network group updated',
      successfulDestroy: 'Network group deleted'
    };

    /**
     * Naviages to the feature page
     * @return {promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl('/network/index#/policy'))
        // Wait for the page to load
        .findByCssSelector('figure[us-spinner]:not(.visible)')
        .end()
        .findByCssSelector('div[ng-controller="NetworkCtrl"]')
        .end();
    };

    /**
     * Useful helper for grabbing the text in the success/error message
     * @return {object} promise
     */
    this.getAlertMessageText = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#notificationUI:not(.ng-hide)')
        .end()
        .findByCssSelector('#notificationUI .message')
          .getVisibleText()
          .then(function(alertMsg) {
            return alertMsg;
          });
    };

    /**
     * Get the alert messages within the modal
     */
    this.getModalAlertMessageText = function() {
      return this.remote
        .findById('newGroupAlertMessageUI-message')
          .getVisibleText()
          .then(function(alertMsg) {
            return alertMsg;
          });
    };

    /**
     * To create a new group
     * @return {object} promise
     */
    this.clickNewButton = function() {
      return this.remote
        .findDisplayedById('createNewGroupBtn')
          .click()
        .end();
    };

    /**
     * @param {object} params
     * @param {object} params.name
     * @param {object} params.SIDNIDBSID
     * @param {object} params.MCCMNC
     * @return {object} promise
     */
    this.fillInModal = function(params) {
      return this.remote
        .findByCssSelector('input[ng-model="network.name"]')
          .click()
          .clearValue()
          .type(params.name)
        .end()
        .findByCssSelector('#inputSidNidValue')
          .click()
          .clearValue()
          .type(params.SIDNIDBSID)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findByCssSelector('#inputMccMncValue')
          .click()
          .clearValue()
          .type(params.MCCMNC)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end();
    };

    /**
     * @param {object} params
     * @param {object} params.name
     * @param {object} params.SIDNIDBSID
     * @param {object} params.MCCMNC
     * @return {object} promise
     */
    this.updateModal = function(params) {
      return this.remote
        .findByCssSelector('input[ng-model="network.name"]')
          .click()
          .clearValue()
          .type(params.name)
        .end()
        .findByCssSelector('#inputSidNidValue')
          .click()
          .type(params.SIDNIDBSID)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findByCssSelector('#inputMccMncValue')
          .click()
          .type(params.MCCMNC)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end();
    };

    /**
     * Click the save button within the modal for
     * a new network group
     * @return {object} promise
     */
    this.clickModalSaveButton = function() {
      return this.remote
        .findById('addOkBtn')
          .click()
        .end();
    };

    /**
     * Click the cancel button within the modal for
     * a new network group
     * @return {object} promise
     */
    this.clickModalCancelButton = function() {
      return this.remote
        .findById('addCancelBtn')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickModalLockButton = function() {
      return this.remote
        .findById('network_lock-btn')
          .click()
        .end();
    };

    /**
     * @param {string} name
     * @return {object} promise
     */
    this.searchByName = function(name) {
      return this.remote
        .findByCssSelector('#groups-table_filter input')
          .click()
          .clearValue()
          .type(name)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findDisplayedByCssSelector('#groups-table_processing')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#groups-table_processing[style*="visibility: hidden;"]')
        .end();
    };

    /**
     * @return {string}
     */
    this.getRandomSID = function() {
      return faker.random.number({
        min: 1,
        max: 32767
      });
    };

    /**
     * @return {string}
     */
    this.getRandomNID = function() {
      return faker.random.number({
        min: 1,
        max: 65534
      });
    };

    /**
     * @return {string}
     */
    this.getRandomBSID = function() {
      return faker.random.number({
        min: 1,
        max: 65535
      });
    };

    /**
     * @return {string}
     */
    this.getRandomMCC = function() {
      return faker.random.number({
        min: 100,
        max: 999
      });
    };

    /**
     * @return {string}
     */
    this.getRandomMNC = function() {
      return faker.random.number({
        min: 10,
        max: 999
      });
    };
  }

  return NetworkGroupsPage;
});
