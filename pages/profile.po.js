/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function ProfilePage(remote) {
    this.remote = remote;

    this.msgs = {
      success: 'Profile successfully changed',
      passwordFailure: 'Invalid account or password. Please try again.',
      passwordMismatch: 'Invalid password or passwords do not match',
      passwordRequirements: 'Password requirements not met'
    };

    /**
     * Navigates to the profile page
     * @return {promise}
     */
    this.open = function() {
      return this.remote.get(helper.getHostUrl('/myprofile'));
    };

    /**
     * @return {promise}
     */
    this.clickChangeProfileBtn = function() {
      return this.remote
        .findById('btn_ChangeProfile')
          .click()
        .end();
    };

    /**
     * @return {promise}
     */
    this.clickChangePassBtn = function() {
      return this.remote
        .findById('btn_ChangePassword')
          .click()
        .end();
    };

    /**
     * @return {promise}
     */
    this.getAlertMessageText = function() {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('div.alert')
          .findByCssSelector('div.message')
            .getVisibleText()
            .then(function(alertMsg) {
              return alertMsg;
            });
    };

    /**
     * @param {string} first First name
     * @param {string} last Last name
     * @return {promise}
     */
    this.fillInName = function(first, last) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#input_First_Name:not([disabled="disabled"])')
          .clearValue()
          .click()
          .type(first)
        .end()
        .findByCssSelector('#input_Last_Name:not([disabled="disabled"])')
          .clearValue()
          .click()
          .type(last)
        .end();
    };

    /**
     * Fill in all three passwords
     * @param {string} current
     * @param {string} updated
     * @param {string} updatedConfirm
     * @return {promise}
     */
    this.fillInPasswords = function(current, updated, updatedConfirm) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findByCssSelector('#input_Old_Password:not([disabled="disabled"])')
          .clearValue()
          .click()
          .type(current)
        .end()
        .findByCssSelector('#input_New_Password:not([disabled="disabled"])')
          .clearValue()
          .click()
          .type(updated)
        .end()
        .findByCssSelector('#input_Verify_Password:not([disabled="disabled"])')
          .clearValue()
          .click()
          .type(updatedConfirm)
        .end();
    };

    /**
     * @return {string}
     */
    this.getValidPassword = function() {
      return helper.getRandomString(12) + 'Aa1@';
    };
  }

  return ProfilePage;
});
