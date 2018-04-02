/**
 * Specific to subscriber pages
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function CSPSubscriberPage(remote) {
    this.remote = remote;

    this.msgs = {
      successfulCreation: 'Subscriber created successfully.',
      successfulNotifLangUpdate: 'Notification language updated successfully.',
      successfulSuspend: 'Suspension request submitted. Suspension can take a couple of minutes. Check Status and Change History for updates.',
      successfulFeatureUpdate: 'Feature updated'
    };

    /**
     * Dropdown for subscribers
     * @return {object} promise
     */
    this.clickSubscriberActions = function() {
      return this.remote
        .findById('csp-subscriber-actions')
          .click()
        .end();
    };

    /**
     * Get the phone number text in the plan header
     * @return {object} promise
     */
    this.getPhoneNumberHeaderText = function() {
      return this.remote
        .findByCssSelector('h4.phone-number')
          .getVisibleText()
          .then(function(text) {
            return text;
          });
    };

    /**
     * Susepend or resume the subscriber inside Subscriber Actions
     * @return {object} promise
     */
    this.clickSubscriberSuspendResume = function() {
      return this
        .clickSubscriberActions()
        .then(function() {
          return this.parent
            .findByCssSelector('#csp-suspend-sub:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * Manage Policies and Features link
     * @return {object} promise
     */
    this.clickSubscriberManagePolicies = function() {
      return this
        .clickSubscriberActions()
        .then(function() {
          return this.parent
            .findByCssSelector('#csp-manage-features:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * View number transfer PIN
     * @return {object} promise
     */
    this.clickSubscriberViewNumTransferPIN = function() {
      return this
        .clickSubscriberActions()
        .then(function() {
          return this.parent
            .findByCssSelector('#csp-view-pin:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * Get the subscriber status from the status menu on the left
     * @return {object} promise
     */
    this.getSubscriberStatusText = function() {
      return this.remote
        .findByCssSelector('aside.status-area > article.status > span.label')
        .getVisibleText()
        .then(function(statusText) {
          return statusText;
        });
    };

    /**
     * Suspensions reasons in the left status bar when a
     * subscriber is suspended
     * @return {object} promise
     */
    this.getSubscriberSuspensionReasons = function() {
      return this.remote
        .findAllByCssSelector('#csp-suspension-reasons li')
        .then(function(list) {
          return list;
        });
    };

    /**
     * Manage subscriber preferred voice numbers
     * @return {object} promise
     */
    this.clickSubscriberManagePreferredVoiceNumbers = function() {
      return this
        .clickSubscriberActions()
        .then(function() {
          return this.parent
            .findByCssSelector('#csp-manage-preferred-voice-numbers:not(.disabled-link)')
              .click()
            .end();
        });
    };
  }

  return CSPSubscriberPage;
});
