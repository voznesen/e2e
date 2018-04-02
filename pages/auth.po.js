/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function AuthPage(remote) {
    this.remote = remote;

    this.msgs = {
      invalidLogin: 'The Username/Password combination you entered is not valid.\nNote: Passwords are case sensitive.',
      missingFields: 'Please enter your username and password to sign in.'
    };

    this.partnerElementIds = {
      zactPortal: 'b0c785a8-9c32-4404-a67e-28e8d9a46aad',
      acme: '588b1dc9-85b1-4bc6-bf26-3beea7dc439a'
    };

    /**
     * Log the user it
     * @return {object}
     */
    this.login = function() {
      return this.remote
        .get(helper.getHostUrl())
        .setWindowSize(1280, 1024)
        .setFindTimeout(helper.getFindTimeout())
        .findById('LoginForm_username')
          .click()
          .type(helper.AUTH.username)
        .end()
        .findById('LoginForm_password')
          .click()
          .type(helper.AUTH.password)
        .end()
        .findById('UserLoginSubmitBtn')
          .click()
        .end()
        .findByCssSelector('div[ng-controller="NavigCtrl"]')
        .end();
    };

    /**
     * Log the use out
     * @return {Promise}
     */
    this.logout = function() {
      return this.remote
        .get(helper.getHostUrl() + '/site/logout')
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('div[ng-controller="PortalUserProfileCtrl"]')
        .end()
        .clearCookies();
    };

    /**
     * Combinational helper!
     * @param {string} partnerName
     * @return {object} promise
     */
    this.loginAndSetCurrentPartner = function(partnerName) {
      partnerName = partnerName || 'acme';
      return this.login()
        .then(function() {
          return this.setCurrentPartner(partnerName);
        }.bind(this));
    };

    /**
     * Set the current partner by passing a string name
     * @param {string} partnerName The name of the partner matching this.partnerElementIds
     * @return {Promise.<bool>}
     */
    this.setCurrentPartner = function(partnerName) {
      var cookieValue = this.partnerElementIds[partnerName];

      return this.remote
        .get(helper.getHostUrl())
        .setFindTimeout(helper.getFindTimeout())
        .findById('logoutmenu')
          .click()
        .end()
        .findByXpath('.//a[contains(text(), "Acme Telecom")]')
          .click()
        .end()
        .getCookies()
        .then(function(cookies) {
          var filtered = cookies.filter(function(cookie) {
            return cookie.name == 'sessionPartnerId' && cookie.value == cookieValue;
          });
          return filtered.length == 1;
        });
    };

    /**
     * @param {string} username
     * @param {string} password
     * @return {object} promise
     */
    this.fillInAuth = function(username, password) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findById('LoginForm_username')
          .click()
          .type(username)
        .end()
        .findById('LoginForm_password')
          .click()
          .type(password)
        .end()
        .findById('UserLoginSubmitBtn')
          .click()
        .end();
    };

    /**
     * @return {object} promise
     */
    this.getAlertMessageText = function() {
      return this.remote
        .findDisplayedByCssSelector('#login-ui-container .alert .message')
          .getVisibleText()
          .then(function(alertMsg) {
            return alertMsg;
          });
    };
  }

  return AuthPage;
});
