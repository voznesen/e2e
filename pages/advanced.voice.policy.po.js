/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function AdvancedVoicePolicyPage(remote) {
    this.remote = remote;

    this.msgs = {
      successfulCreate: 'Advanced voice accounting Policy has been created.',
      successfulDestroy: 'Advanced voice accounting Policy has been deleted.',
      successfulUpdate: 'Advanced voice accounting Policy has been updated.'
    };

    /**
     * @return {object} promise
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl('/avapolicy/index#/policy'))
        // Wait for the page to load
        .findByCssSelector('figure[us-spinner]:not(.visible)')
        .end()
        .findByCssSelector('div[ng-controller="PoliciesCtrl"]')
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
     * Add a new one
     * @return {object} promise
     */
    this.clickNewButton = function() {
      return this.remote
        .findById('createNewGroupBtn')
          .click()
        .end();
    };

    /**
     * @param {object} params
     * @param {object} params.name
     * @param {object} params.gracePeriod
     * @param {object} params.accountingIncrement
     * @param {object} params.chargeDuration
     * @return {object} promise
     */
    this.fillInModal = function(params) {
      return this.remote
        .findById('input-Name')
          .click()
          .clearValue()
          .type(params.name)
        .end()
        .findById('input-Call_Connection_Grace_Period')
          .click()
          .clearValue()
          .type(params.gracePeriod)
        .end()
        .findById('input-Accounting_Increment')
          .click()
          .clearValue()
          .type(params.accountingIncrement)
        .end()
        .findById('input-Minimum_Charge_Duration')
          .click()
          .clearValue()
          .type(params.chargeDuration)
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickModalSaveButton = function() {
      return this.remote
        .findById('confirmAction_btn')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickModalUnlockButton = function() {
      return this.remote
        .findById('toggleBtn_locked')
          .click()
        .end();
    };

    /**
     * @param {string} name
     * @return {object} promise
     */
    this.searchByName = function(name) {
      return this.remote
        .findByCssSelector('#policies-table-filter input')
          .click()
          .clearValue()
          .type(name)
          .then(function() {
            return helper.pressEnter(this.parent);
          })
        .end()
        .findDisplayedByCssSelector('#policies-table_processing')
        .end()
        // Wait for loading to complete
        .findByCssSelector('#policies-table_processing[style*="visibility: hidden;"]')
        .end();
    };
  }

  return AdvancedVoicePolicyPage;
});
