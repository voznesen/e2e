/**
 * Shared CSP page object
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');
  var CSPAccountPage = require('./csp.account.po.js');

  function CSPPage(remote) {
    this.remote = remote;
    this.cspAccountPage = new CSPAccountPage(this.remote);
    this.defaultSecurityAnswer = 'team';

    this.msgs = {
      successfulCSPAccountCreation: 'Account created successfully.'
    };

    /**
     * Naviagtes to the CSP page
     * @return {Promise}
     */
    this.open = function() {
      return this.remote
        .get(helper.getHostUrl())
        .findDisplayedById('navigLinkToCSP')
          .click()
        .end()
        .findDisplayedById('navigLinkToAccounts')
          .click()
        .end()
        .findDisplayedById('csp-search-input')
        .end();
    };

    /**
     * Combination helper which:
     * - Opens CSP
     * - Looks up the account
     * - Enters the security answer
     * - Verifies that the account page has loaded
     * @param {string} account
     * @return {object} promise
     */
    this.openAccount = function(account) {
      return this.open()
        .then(function() {
          return this.searchAndEnterValidSecurityQuestion(
            account,
            this.defaultSecurityAnswer
          );
        }.bind(this))
        // Give it some time for CSP to search for the account
        .waitForDeletedByCssSelector('div.modal-backdrop')
        .findById('csp-account-details')
        .end();
    };

    /**
     * Combination helper which:
     * - Opens CSP
     * - Looks up the subscriber
     * - Verifies that the account page has loaded
     * @param {string} subscriber
     * @param {boolean} skipSecurityCheck
     * @return {object} promise
     */
    this.openSubscriber = function(subscriber, skipSecurityCheck) {
      return this.open()
        .then(function() {
          if (skipSecurityCheck) {
            return this.enterAndSubmitSearch(subscriber);
          }

          return this.searchAndEnterValidSecurityQuestion(
            subscriber,
            this.defaultSecurityAnswer
          );
        }.bind(this))
        // Give it some time for CSP to search for the subscriber
        .waitForDeletedByCssSelector('div.modal-backdrop')
        .findByCssSelector('figure[us-spinner]:not(.visible)')
        .end()
        .findById('csp-subscriber-details')
        .end();
    };

    /**
     * Currently, there's no way to open a device by
     * it's ID in CSP. You must lookup the subscriber
     * and then click on the device in the status area.
     * @param {string} snid
     * @return {object} promise
     */
    this.openDeviceBySnid = function(snid) {
      return this.open()
        .then(function() {
          return this.enterAndSubmitSearch(snid);
        }.bind(this))
        .waitForDeletedByCssSelector('div.modal-backdrop')
        .findById('csp-subscriber-details')
        .end()
        .findById('csp-device-name')
          .click()
        .end();
    };

    /**
     * Enter the search security answer
     * @param {string} answer
     * @return {object} promise
     */
    this.enterAndSubmitSecurityQuestion = function(answer) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('challengeAnswer')
          .click()
          .clearValue()
          .type(answer)
        .end()
        .findById('authenticateBtn')
          .click()
        .end();
    };

    /**
     * Search for an account or other in CSP
     * @param {string} searchValue - What you wannna search for
     * @return {object} promise
     */
    this.enterAndSubmitSearch = function(searchValue) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('csp-search-input')
          .click()
          .clearValue()
          .type(searchValue)
        .end()
        .findById('csp-search-btn')
          .click()
        .end();
    };

    /**
     * Combine actions.
     * @param {string} searchValue
     * @param {string} securityAnswer
     * @return {object} promise
     */
    this.searchAndEnterValidSecurityQuestion = function(searchValue, securityAnswer) {
      return this
        .enterAndSubmitSearch(searchValue)
        .then(function() {
          return this.enterAndSubmitSecurityQuestion(securityAnswer);
        }.bind(this));
    };

    /**
     * Create a dummy CSP account
     * @return {object} Promise
     */
    this.createAccount = function() {
      var dummyAccountEmail = helper.getRandomEmail();

      return this.remote
        .get(helper.getHostUrl('/devtools/createaccount'))
        .findByCssSelector('input[ng-model="email"]')
          .click()
          .clearValue()
          .type(dummyAccountEmail)
        .end()
        .findByCssSelector('#create-account')
          .click()
        .end()
        .setFindTimeout(150000)
        .findDisplayedByCssSelector('div.alert')
          .findByCssSelector('span.message')
            .getVisibleText()
            .then(function(alertMsg) {
              helper.log('Created CSP account with email:', dummyAccountEmail);
              return {
                success: alertMsg === this.msgs.successfulCSPAccountCreation,
                emailAddress: dummyAccountEmail
              };
            }.bind(this));
    };

    /**
     * Terminate the account. Generally used as a cleanup
     * on dummy accounts.
     * @param {string} email
     * @return {object} promise
     */
    this.destroyAccount = function(email) {
      return this
        .openAccount(email)
        .then(function() {
          return this.cspAccountPage.clickTerminateAccount();
        }.bind(this))
        // Click terminate in the modal
        .findDisplayedByCssSelector('.modal.terminateAccountModal')
          .findById('cspSaveBtn')
            .click()
          .end()
        .end()
        .then(function() {
          return this.getAlertMessageText()
            .then(function(alertMsg) {
              if (alertMsg == this.cspAccountPage.msgs.successfulTermination) {
                helper.log('Destroyed CSP account with email: ' + email);
                return true;
              }
              return false;
            }.bind(this));
        }.bind(this));
    };

    /**
     * Create an unjoined subscriber
     * @return {object} Promise
     */
    this.createSubscriber = function() {
      return this.remote
        .get(helper.getHostUrl('/devtools/createsubscriber'))
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#create-subscriber')
          .click()
        .end()
        .findByCssSelector('a.new-sub')
          .getVisibleText()
            .then(function(snid) {
              helper.log('Created CSP subscriber with snid: ' + snid);
              return {
                success: !!snid,
                snid: snid
              };
            }.bind(this));
    };

    /**
     * Useful helper for grabbing the text in the success/error message
     * @return {object} promise
     */
    this.getAlertMessageText = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('message-box .alert:not(.ng-hide) span.message')
          .getVisibleText()
          .then(function(alertMsg) {
            return alertMsg;
          });
    };
  }

  return CSPPage;
});
