/**
 * @author Tyler Van Hoomissen
 */
define(function(require) {
  var helper = require('../lib/helper');

  function RolePermissionsPage(remote) {
    this.remote = remote;

    this.msgs = {
      addSuccess: 'Role created.',
      deleteSuccess: 'Role deleted.',
      missingRoleName: 'Role name is required.',
      missingPermission: 'Role permissions must be assigned.',
    };

    /**
     * @return {promise}
     */
    this.open = function() {
      return this.remote.get(helper.getHostUrl('/user/permissions'));
    };

    /**
     * @return {promise}
     */
    this.clickAddRole = function() {
      return this.remote
        .findById('btn-Add_Role')
          .click()
        .end();
    };

    this.clickCreateRole = function() {
      return this.remote
        .findById('btn-Create_New_Role')
          .click()
        .end();
    };

    /**
     * @param {string} value The permission value
     * @return {promise}
     */
    this.addPermissionByName = function(value) {
      return this.remote
        .findByCssSelector('select[ng-model="$parent.$parent.newPermissions"] option[value="' + value + '"]')
          .click()
        .end()
        .findByCssSelector('button[ng-click="makeAssignment()"]')
          .click()
        .end();
    };

    /**
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

    /**
     * @return {object} promise
     */
    this.closeAlertMessageText = function() {
      return this.remote
        .findByCssSelector('message-box button[ng-click="close()"]')
          .click()
        .end();
    };

    /**
     * Combination of this.clickCreateRole() and
     * this.getAlertMessageText()
     * @return {promise}
     */
    this.clickCreateAndGetAlertMessageText = function() {
      return this
        .clickCreateRole()
        .then(function() {
          return this.getAlertMessageText();
        }.bind(this));
    };

    /**
     * @param {string} name
     * @return {object} promise
     */
    this.clickRoleByName = function(name) {
      return this.remote
        .setFindTimeout(helper.getFindTimeout())
        .findDisplayedByCssSelector('select[ng-model="$parent.selectedRole"] option:not([selected="selected"])')
        .end()
        // Use xpath to look for option innerHTML
        .findByXpath('//option[contains(.,"'+ name + '")]')
          .click()
        .end();
    };

    /**
     * @param {string} name The role you want to delete
     * @return {promise}
     */
    this.deleteRoleByName = function(name) {
      return this.clickRoleByName(name)
        .findByCssSelector('button[ng-click="deleteRole()"]')
          .click()
        .end()
        .findByCssSelector('div.modal button#confirmOkBtn')
          .click()
        .end();
    };
  }

  return RolePermissionsPage;
});
