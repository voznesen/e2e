/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function UsersRolesPage(remote) {
    this.remote = remote;

    this.msgs = {
      usernameError: 'Invalid email or username. Email addresses must be in proper format. Usernames must contain more than 5 characters, must contain fewer than 120 characters, and must only contain letters, numbers, and underscores (_).',
      creationSuccess: 'New user has been created and is immediately available for login.',
      deletionSuccess: 'User deleted.',
      resetSuccess: 'Password reset successful. Temporary password is immediately available for use.'
    };

    /**
     * @return {promise}
     */
    this.open = function() {
      return this.remote.get(helper.getHostUrl('/user/index'));
    };

    /**
     * Opens up the creation view
     * @return {promise}
     */
    this.clickAddUser = function() {
      return this.remote
        .findById('btn-Create_New_User')
          .click()
        .end();
    };

    /**
     * @return {promise}
     */
    this.clickCreateUser = function() {
      return this.remote
        .findByCssSelector('#btn-Send-Invite:not([disabled="disabled"])')
          .click()
        .end();
    };

    /**
     * @param {string} username The username
     * @param {string} usernameConfirm The confirming username
     * @return {promise}
     */
    this.fillInUsernames = function(username, usernameConfirm) {
      return this.remote
        .findByCssSelector('input[ng-model="$parent.data.user.email"]')
          .click()
          .clearValue()
          .type(username)
        .end()
        .findByCssSelector('input[ng-model="$parent.data.user.verifyEmail"]')
          .click()
          .clearValue()
          .type(usernameConfirm)
        .end();
    };

    this.getAlertMessageText = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('.row[ng-show="notification.get(\'show\')"]')
          .findByCssSelector('div.message')
            .getVisibleText()
            .then(function(alertMsg) {
              return alertMsg;
            });
    };

    /**
     * Click and add a role by it's name
     * @param {string} roleName
     * @return {promise}
     */
    this.addRoleByName = function(roleName) {
      return this.remote
        .findByXpath('//select[@id="availableRoles"]/option[contains(.,"'+ roleName + '")]')
          .click()
        .end()
        .findByCssSelector('button[ng-click="makeAssignment()"]')
          .click()
        .end();
    };

    /**
     * Click and add a partner by it's name
     * @param {string} partnerName
     * @return {promise}
     */
    this.addPartnerByName = function(partnerName) {
      return this.remote
        .findByXpath('//select[@id="availablePartners"]/option[contains(.,"'+ partnerName + '")]')
          .click()
        .end()
        .findByCssSelector('button[ng-click="makeAssignment(\'\', \'partner\')"]')
          .click()
        .end();
    };

    this.selectUserByUsername = function(username) {
      return this.remote
        .findByXpath('//select[@id="select_Existing_Users"]/option[contains(.,"'+ username +'")]')
          .click()
        .end();
    };
  }

  return UsersRolesPage;
});
