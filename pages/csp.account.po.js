/**
 * Specific to account pages.
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function CSPAccountPage(remote) {
    this.remote = remote;
    this.badSecurityAnswer = 'thisisBAD';
    this.msgs = {
      successfulCSPAccountCreation: 'Account created successfully.',
      successfulTermination: 'Account terminated',
      badSecurityAnswer: 'Authentication failed: Incorrect answer.',
      successfulAccountNote: 'Note successfully added',
      successfulNotifLangUpdate: 'Notification language updated successfully.',
      successfulPasswordReset: 'Reset password instruction sent.',
      successfulSuspend: 'Account successfully suspended.',
      successfulResume: 'Successfully resumed account',
      successfulSkuPurchase: 'FE Automated Tests - Don’t Delete has been purchased.'
    };

    /**
     * Dropdown for accounts
     * @return {object} promise
     */
    this.clickAccountActions = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('csp-account-actions')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.clickTerminateAccount = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findById('csp-terminate')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickApplyAccountCredit = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findById('csp-credit-debit')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickMakePurchaseWithSKU = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findById('csp-make-purchase')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickJoinSubscriber = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(60000) // need extra delay since this step consistently timed out
            .findByCssSelector('#csp-join-sub:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.getSecurityQuestionAlertMessageText = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('article.notification-parent:not(.ng-hide) .message')
          .getVisibleText()
          .then(function(alertMsg) {
            return alertMsg;
          });
    };

    /**
     * For edit-in-place submit.
     * @param {string} name - The css name for that editable obj
     * @return {object} promise
     */
    this.clickEditableSubmit = function(name) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('.custom-popover.' + name)
          .findByCssSelector('button.btn-primary')
            .click()
          .end()
        .end();
    };

    /**
     * Promise returns a {number} for the balance
     * @return {object} promise
     */
    this.getCurrentAccountBalance = function() {
      return this.remote
        // xpath allows async tasks to finish before lookup
        .setFindTimeout(helper.getFindTimeout())
        .findByXpath('//span[contains(@class, "current-balance")][string-length(text()) > 0]')
          .getVisibleText()
          .then(function(balance) {
            var parsedBalance = balance.replace(/[$,]/g, '');
            return balance ? Number(parsedBalance) : '';
          });
    };

    /**
     * @return {object} promise
     */
    this.clickAccountAddNote = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findById('csp-add-note')
              .click()
            .end();
        });
    };

    /**
     * @return {object} promise
     */
    this.clickAccountManageCreditCards = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findById('csp-manage-ccs')
              .click()
            .end();
        });
    };

    /**
     * Reset password inside Account Actions dropdown
     * @return {object} promise
     */
    this.clickAccountResetPassword = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findByCssSelector('#csp-reset-pwd:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * Susepend or resume the account inside Account Actions
     * @return {object} promise
     */
    this.clickAccountSuspendResume = function() {
      return this
        .clickAccountActions()
        .then(function() {
          return this.parent
            .setFindTimeout(helper.getFindTimeout())
            .findByCssSelector('#csp-suspend-resume:not(.disabled-link)')
              .click()
            .end();
        });
    };

    /**
     * Get the account status from the status menu on the left
     * @return {object} promise
     */
    this.getAccountStatusText = function() {
      return this.remote
        .findByCssSelector('aside.status-area > article.status > span.label')
        .getVisibleText()
        .then(function(statusText) {
          return statusText;
        });
    };

    /**
     * Suspensions reasons in the left status bar when an
     * account is suspended
     * @return {object} promise
     */
    this.getAccountSuspensionReasons = function() {
      return this.remote
        .findAllByCssSelector('#csp-suspension-reasons li')
        .then(function(list) {
          return list;
        });
    };

    /**
     * Add subscriber to account
     * @return {object} promise
     */
    this.addSubscriberToAccount = function(mdn) {
      return this
        .clickJoinSubscriber()
        .then(function() {
          return this.parent
            .findById('csp-join-sub-mdn')
            .click()
            .clearValue()
            .type(mdn)
          .end()
          .findByCssSelector('.modal-footer button.btn-primary')
            .click()
          .end()
          .waitForDeletedByCssSelector('div.modal-backdrop');
        });
    };

    /**
     * Purchase with SKU
     * @return {object} promise
     */
    this.purchaseWithSku = function(sku) {
      return this.clickMakePurchaseWithSKU()
      .then(function() {
        return this.parent
          .findByCssSelector('.modal-body')
            .findByCssSelector('input[ng-model="data.sku"]')
              .click()
              .clearValue()
              .type(String(sku))
            .end()
          .end()
          .findByCssSelector('.modal-footer #cspSearchBtn')
            .click()
          .end()
          .findByCssSelector('figure[us-spinner]:not(.visible)')
          .end()
          .sleep(2000)
          .findByCssSelector('.modal-footer #cspPurchaseBtn')
            .click()
          .end()
          .waitForDeletedByCssSelector('div.modal-backdrop')
          .sleep(1000);
      });
    };
  }

  return CSPAccountPage;
});
